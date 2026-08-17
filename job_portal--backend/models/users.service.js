const mongoose = require('mongoose');
const joi = require('joi');

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false // defense-in-depth: password hash is never returned unless explicitly requested with .select('+password')
    },
    role: {
        // 'admin' is included here so an administrator account can exist
        // (created directly in the DB / via a seed script), but the Joi
        // registration validator below still only allows 'student' or
        // 'company' through the public /register endpoint - a user can
        // never self-register as admin.
        enum: ['student', 'company', 'admin'],
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'deleted']
    }
}, { timestamps: true })

const usersModel = mongoose.model('Users', usersSchema);

function validateUsers(users) {
    const schema = joi.object({
        name: joi.string().required().min(2).max(60),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        role: joi.string().valid('student', 'company').required(), // 'admin' intentionally NOT allowed here
        skills: joi.array().items(joi.string()).optional(),
        avatar: joi.string().allow('').optional(),
        status: joi.string().valid('active', 'deleted').optional()
    })
    return (schema.validate(users))
}
module.exports = {
    usersModel,
    validateUsers
};
