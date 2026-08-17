const crypto = require('crypto');
const https = require('https');

const uploadToCloudinary = (base64Image, folder = 'job_portal') => {
    return new Promise((resolve, reject) => {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'duzuguldp';
        const apiKey = process.env.CLOUDINARY_API_KEY || '193222435723767';
        const apiSecret = process.env.CLOUDINARY_API_SECRET || 'CkW7vP_vg4Nt4iXQXnCbxJUdX5s';

        const timestamp = Math.floor(Date.now() / 1000);
        
        // Build parameters string for signature calculation (sorted alphabetically)
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

        const postData = new URLSearchParams({
            file: base64Image,
            api_key: apiKey,
            timestamp: timestamp.toString(),
            signature: signature,
            folder: folder
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
                        reject(new Error(parsed.error?.message || 'Cloudinary upload failed'));
                    }
                } catch (e) {
                    reject(new Error('Failed to parse Cloudinary response: ' + body));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(postData);
        req.end();
    });
};

module.exports = { uploadToCloudinary };
