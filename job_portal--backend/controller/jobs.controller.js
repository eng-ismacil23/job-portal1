const { jobModel, validateJobs } = require('../models/jobs.service');

// Get all jobs
const GET = async (req, res) => {
    try {
        const jobs = await jobModel.find()
            .populate("createdBy", "name email")
            .select('title company description deadline createdBy');

        res.status(200).json({
            status: "true",
            message: "Jobs found successfully",
            data: jobs
        });
    } catch(err) {
        res.status(500).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// Get company's own jobs
const GETMYJOBS = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: "false", message: "Unauthorized: User payload missing" });
        }

        const jobs = await jobModel.find({ createdBy: req.user.id }).populate("createdBy", "name email");
        res.status(200).json({
            status: "true",
            message: "Company jobs fetched successfully",
            data: jobs
        });
    } catch(err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

// Get job by ID 
const GETBYID = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await jobModel.findById(id).populate("createdBy", "name email");
        if (!job) {
            return res.status(404).json({ status: "false", message: "Job not found" });
        }
        res.status(200).json({
            status: "true",
            message: "Job found successfully",
            data: job
        });
    } catch(err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
}

// Create job
const POST = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: "false", message: "Unauthorized: User payload missing" });
        }

        const { title, company, description, deadline } = req.body;
        const createdBy = req.user.id; 

        const newJob = new jobModel({
            title,
            company,
            description,
            deadline,
            createdBy
        });
        await newJob.save();

        res.status(201).json({
            status: "true",
            message: "Job created successfully",
            data: newJob
        });
    } catch(err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
}

// Delete job
const DELETE = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: "false", message: "Unauthorized: User payload missing" });
        }

        const id = req.params.id;
        const job = await jobModel.findById(id);

        if (!job) {
            return res.status(404).json({ status: "false", message: "Job not found." });
        }

        if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ status: "false", message: "Unauthorized. You can only delete your own jobs." });
        }

        await jobModel.findByIdAndDelete(id);

        res.status(200).json({
            status: "true",
            message: "Job deleted successfully"
        });
    } catch(err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
}

module.exports = { 
    GET, 
    GETMYJOBS,
    GETBYID, 
    POST, 
    DELETE 
};