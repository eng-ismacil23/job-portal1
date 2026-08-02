const mongoose = require('mongoose');
const joi = require('joi');

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "jobs",
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected", "applied", "pending", "not applied"],
        default: "Pending"
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    }
}, { timestamps: true });

const appliactionModel = mongoose.model("application", applicationSchema);

function validateJobs(application) {
    const schema = joi.object({
        jobId: joi.string().required(),
        status: joi.string().optional(),
        studentId: joi.string().optional(),
    });

    return schema.validate(application);
}

module.exports = {
    appliactionModel,
    validateJobs
};