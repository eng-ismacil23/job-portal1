const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        default: '127.0.0.1'
    },
    location: {
        type: String,
        default: 'Mogadishu, Somalia (Local)'
    },
    country: {
        type: String,
        default: 'Somalia'
    },
    city: {
        type: String,
        default: 'Mogadishu'
    },
    device: {
        type: String,
        default: 'Desktop (Chrome)'
    },
    browser: {
        type: String,
        default: 'Chrome'
    },
    os: {
        type: String,
        default: 'Windows'
    },
    deviceType: {
        type: String,
        enum: ['Desktop', 'Mobile', 'Tablet'],
        default: 'Desktop'
    },
    userAgent: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'logged_out', 'revoked', 'expired'],
        default: 'active',
        index: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    logoutTime: {
        type: Date
    }
}, { timestamps: true });

const sessionModel = mongoose.model('Sessions', sessionSchema);

module.exports = {
    sessionModel
};
