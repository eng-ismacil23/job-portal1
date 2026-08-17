/**
 * Script: seed-job-logos.js
 * 
 * This script:
 * 1. Fetches all jobs from the local MongoDB
 * 2. For each job without a companyLogo, uploads an appropriate 
 *    tech company logo SVG to Cloudinary
 * 3. Updates the job in MongoDB with the returned Cloudinary URL
 * 
 * Run: node seed-job-logos.js
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const https = require('https');

// ── Cloudinary upload (no SDK needed) ─────────────────────────────────────
const uploadBase64ToCloudinary = (base64Image, folder = 'job_portal_logos') => {
    return new Promise((resolve, reject) => {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        const timestamp = Math.floor(Date.now() / 1000);
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

        const postData = new URLSearchParams({
            file: base64Image,
            api_key: apiKey,
            timestamp: timestamp.toString(),
            signature,
            folder
        }).toString();

        const options = {
            hostname: 'api.cloudinary.com',
            path: `/v1_1/${cloudName}/image/upload`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (parsed.secure_url) {
                        resolve(parsed.secure_url);
                    } else {
                        reject(new Error(parsed.error?.message || 'Upload failed: ' + body));
                    }
                } catch (e) {
                    reject(new Error('Parse error: ' + body));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
};

// ── SVG logo generator ─────────────────────────────────────────────────────
// Creates a professional tech company logo as SVG based on company name
const generateCompanyLogoSVG = (companyName) => {
    const colors = {
        'salaama learning hub': { bg: '#0A2463', accent: '#FFD700', text: 'SL' },
        'isma tech':            { bg: '#1A1A2E', accent: '#E94560', text: 'IT' },
        'default':              { bg: '#10205F', accent: '#FAF92A', text: '?' }
    };

    const key = companyName.toLowerCase().trim();
    let matched = colors['default'];
    for (const k of Object.keys(colors)) {
        if (k !== 'default' && key.includes(k)) { matched = colors[k]; break; }
    }

    // initials from company name
    const words = companyName.trim().split(/\s+/);
    const initials = words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : companyName.substring(0, 2).toUpperCase();

    const { bg, accent } = matched;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${bg}cc;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="32" fill="url(#bg)"/>
  <!-- accent bar -->
  <rect x="0" y="160" width="200" height="10" rx="0" fill="${accent}" opacity="0.85"/>
  <!-- ring circle -->
  <circle cx="100" cy="90" r="52" fill="none" stroke="${accent}" stroke-width="4" opacity="0.3"/>
  <!-- initials -->
  <text x="100" y="108" 
    font-family="'Inter','Helvetica Neue',Arial,sans-serif" 
    font-size="54" 
    font-weight="900" 
    text-anchor="middle" 
    letter-spacing="-2"
    fill="${accent}">${initials}</text>
  <!-- company name tiny -->
  <text x="100" y="182" 
    font-family="'Inter','Helvetica Neue',Arial,sans-serif" 
    font-size="13" 
    font-weight="700" 
    text-anchor="middle"
    fill="white"
    opacity="0.7">${companyName.substring(0, 20)}</text>
</svg>`;

    return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
};

// ── Job-specific logo SVGs ─────────────────────────────────────────────────
const JOB_LOGOS = {
    // Key: partial job title match (lowercase)
    'backend developer': {
        company: 'Salaama Learning Hub',
        svgColor: '#0A2463',
        accent: '#FFD700',
        icon: 'SL'
    },
    'mobile app': {
        company: 'isma tech',
        svgColor: '#1A1A2E',
        accent: '#E94560',
        icon: 'IT'
    },
    'ai agents': {
        company: 'isma tech',
        svgColor: '#1A1A2E',
        accent: '#E94560',
        icon: 'IT'
    },
    'full stack': {
        company: 'isma tech',
        svgColor: '#1A1A2E',
        accent: '#E94560',
        icon: 'IT'
    }
};

// ── MongoDB Job Model ─────────────────────────────────────────────────────
const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    description: String,
    deadline: String,
    companyLogo: String,
    createdBy: mongoose.Schema.Types.ObjectId,
    positionsCount: Number,
    maxApplicants: Number,
    status: String
}, { timestamps: true });

const jobModel = mongoose.models.Job || mongoose.model('Job', jobSchema);

// ── Main ─────────────────────────────────────────────────────────────────
async function run() {
    console.log('\n🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal');
    console.log('✅ Connected!\n');

    const jobs = await jobModel.find({});
    console.log(`📋 Found ${jobs.length} job(s) in database.\n`);

    let updated = 0;
    let skipped = 0;

    for (const job of jobs) {
        if (job.companyLogo && job.companyLogo.startsWith('http')) {
            console.log(`⏭  Skipping "${job.title}" — already has logo.`);
            skipped++;
            continue;
        }

        console.log(`🖼  Generating logo for: "${job.title}" (${job.company})`);

        try {
            const base64Logo = generateCompanyLogoSVG(job.company || job.title);
            console.log(`   ⬆  Uploading to Cloudinary...`);

            const url = await uploadBase64ToCloudinary(base64Logo);
            await jobModel.findByIdAndUpdate(job._id, { companyLogo: url });

            console.log(`   ✅ Done! URL: ${url}\n`);
            updated++;

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 800));
        } catch (err) {
            console.error(`   ❌ Failed for "${job.title}": ${err.message}\n`);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} job(s)`);
    console.log(`   ⏭  Skipped: ${skipped} job(s)`);
    console.log(`   📋 Total:   ${jobs.length} job(s)\n`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB. Done!\n');
}

run().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
