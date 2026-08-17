/**
 * =====================================================
 *  ADMIN USER SEED SCRIPT
 *  Run: node seed-admin.js
 * =====================================================
 *  Waxay aburtaa admin user-ka database-ga MongoDB-ga
 *  Password-ka default: Admin@1234 (waa in la beddelo)
 * =====================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Admin user details (waa in la beddelo password-ka) ──
const ADMIN_USER = {
    name:     'Super Admin',
    email:    'admin@jobportal.com',
    password: 'Admin@1234',       // ← Waa in aad beddeshid marka la galayo
    role:     'admin',
    skills:   [],
    status:   'active'
};

// ── MongoDB URI (from .env or hardcoded fallback) ──
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal';

// ── Minimal schema (mirrors models/users.service.js) ──
const usersSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['student', 'company', 'admin'], required: true },
    skills:   { type: [String] },
    status:   { type: String, default: 'active', enum: ['active', 'deleted'] }
}, { timestamps: true });

const UsersModel = mongoose.model('Users', usersSchema);

async function seedAdmin() {
    try {
        console.log('\n🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if admin already exists
        const existing = await UsersModel.findOne({ email: ADMIN_USER.email });
        if (existing) {
            console.log(`⚠️  Admin user already exists:`);
            console.log(`   Email  : ${existing.email}`);
            console.log(`   Role   : ${existing.role}`);
            console.log(`   Status : ${existing.status}`);
            console.log('\n💡 To reset password, delete the user from DB and re-run this script.\n');
            await mongoose.disconnect();
            return;
        }

        // Hash password
        const salt   = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(ADMIN_USER.password, salt);

        // Create admin user
        const admin = new UsersModel({
            name:     ADMIN_USER.name,
            email:    ADMIN_USER.email,
            password: hashed,
            role:     ADMIN_USER.role,
            skills:   ADMIN_USER.skills,
            status:   ADMIN_USER.status
        });

        await admin.save();

        console.log('🎉 Admin user created successfully!\n');
        console.log('═══════════════════════════════════');
        console.log('  Name     :', ADMIN_USER.name);
        console.log('  Email    :', ADMIN_USER.email);
        console.log('  Password :', ADMIN_USER.password, '  ← CHANGE THIS!');
        console.log('  Role     :', ADMIN_USER.role);
        console.log('  ID       :', admin._id.toString());
        console.log('═══════════════════════════════════\n');

    } catch (err) {
        console.error('❌ Error creating admin user:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.\n');
    }
}

seedAdmin();
