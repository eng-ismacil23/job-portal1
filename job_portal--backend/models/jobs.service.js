const mongoose = require('mongoose');
const joi = require('joi');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // Was `String` before - made it a real Date so deadline comparisons/sorts
    // ("show jobs that haven't expired", "sort by soonest deadline") work correctly.
    deadline: {
        type: Date,
        required: true
    },
    positionsCount: {
        type: Number,
        default: 1,
        min: 1
    },
    maxApplicants: {
        type: Number,
        default: 10,
        min: 1
    },
    status: {
        type: String,
        enum: ['active', 'terminated', 'closed'],
        default: 'active'
    },
    companyLogo: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        index: true
    }
}, { timestamps: true });

const jobModel = mongoose.model("jobs", jobSchema);

function validateJobs(jobs) {
    const schema = joi.object({
        title: joi.string().required().max(50).min(6),
        company: joi.string().required().min(2).max(60),
        description: joi.string().required().min(5),
        deadline: joi.date().required(),
        positionsCount: joi.number().min(1).optional(),
        maxApplicants: joi.number().min(1).optional(),
        companyLogo: joi.string().allow('').optional(),
        status: joi.string().valid('active', 'terminated', 'closed').optional(),
        createdBy: joi.string().optional() // set server-side from req.user, never trust client input for this
    });

    return schema.validate(jobs);
}

module.exports = {
    jobModel,
    validateJobs,
};
