const mongoose = require('mongoose');
const joi = require('joi');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        unique: true
    },
    bio: {
        type: String,
        default: ''
    },
    education: {
        type: String,
        default: ''
    },
    experience: {
        type: String,
        default: ''
    }, 
    CV: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const profileModel = mongoose.model("profile", profileSchema);

function validateProfile(profile) {
    const schema = joi.object({
        bio: joi.string().allow('').optional().max(1000),
        education: joi.string().allow('').optional().max(200),
        experience: joi.string().allow('').optional().max(2000),
        CV: joi.string().allow('').optional(),
        userId: joi.string().optional()
    });

    return schema.validate(profile);
}

module.exports = {
    profileModel,
    validateProfile,
};
