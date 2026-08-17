const mongoose = require('mongoose');
const joi = require('joi');

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "jobs",
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected", "applied", "pending", "not applied"],
        default: "Pending"
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        index: true
    },
    phone: {
        type: String,
        default: ""
    },
    coverLetter: {
        type: String,
        default: ""
    },
    experience: {
        type: String,
        default: ""
    },
    education: {
        type: String,
        default: ""
    },
    portfolio: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// A student can only apply once per job - enforce at the DB level too
// (defense in depth, backing up the application-level check in the controller).
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

const appliactionModel = mongoose.model("application", applicationSchema);

function validateApplication(application) {
    const schema = joi.object({
        jobId: joi.string().required(),
        status: joi.string().valid("Pending", "Accepted", "Rejected", "applied", "pending", "not applied").optional(),
        studentId: joi.string().optional(),
        phone: joi.string().allow('', null).optional(),
        coverLetter: joi.string().allow('', null).optional(),
        experience: joi.string().allow('', null).optional(),
        education: joi.string().allow('', null).optional(),
        portfolio: joi.string().allow('', null).optional(),
    });

    return schema.validate(application);
}

module.exports = {
    appliactionModel,
    validateApplication
};
