const { appliactionModel } = require('../models/applications.service');
const { jobModel } = require('../models/jobs.service');

const createApplication = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ status: "false", message: "Only students can apply for jobs." });
        }

        const { jobId, status } = req.body;
        const studentId = req.user.id;

        const jobExists = await jobModel.findById(jobId);
        if (!jobExists) {
            return res.status(404).json({ status: "false", message: "Job not found." });
        }

        const alreadyApplied = await appliactionModel.findOne({ jobId, studentId });
        if (alreadyApplied) {
            return res.status(400).json({ status: "false", message: "You have already applied for this job." });
        }

        const newApplication = new appliactionModel({
            jobId,
            studentId,
            status: status || 'Pending'
        });

        await newApplication.save();

        res.status(201).json({
            status: "true",
            message: "Application submitted successfully",
            data: newApplication
        });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const getApplications = async (req, res) => {
    try {
        let query = {};

        // 1. Haddii uu yahay Shirkad: Tusi kaliya applications-ka loo soo diray shaqooyinkeeda
        if (req.user.role === 'company') {
            const myJobs = await jobModel.find({ createdBy: req.user.id }).select('_id');
            const jobIds = myJobs.map(job => job._id);
            query = { jobId: { $in: jobIds } };
        }
        // 2. Haddii uu yahay Arday: Tusi KALIYA kuwa uu isagu codsaday
        else if (req.user.role === 'student') {
            query = { studentId: req.user.id };
        }

        const applications = await appliactionModel.find(query)
            .populate("jobId", "title company createdBy description deadline")
            .populate("studentId", "name email skills");

        res.status(200).json({
            status: "true",
            message: "Applications retrieved successfully",
            data: applications
        });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await appliactionModel.findById(id)
            .populate("jobId", "title company createdBy description deadline")
            .populate("studentId", "name email skills");

        if (!application) {
            return res.status(404).json({ status: "false", message: "Application not found" });
        }

        const studentOwnerId = application.studentId?._id?.toString() || application.studentId?.toString();
        const jobOwnerId = application.jobId?.createdBy?.toString();

        const isStudentOwner = studentOwnerId === req.user.id;
        const isJobOwner = jobOwnerId === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isStudentOwner && !isJobOwner && !isAdmin) {
            return res.status(403).json({ status: "false", message: "Unauthorized to view this application." });
        }

        res.status(200).json({
            status: "true",
            message: "Application retrieved successfully",
            data: application
        });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const application = await appliactionModel.findById(id).populate("jobId");
        if (!application) {
            return res.status(404).json({ status: "false", message: "Application not found" });
        }

        if (application.jobId?.createdBy?.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ status: "false", message: "Unauthorized. Only the job owner can update status." });
        }

        application.status = status;
        await application.save();

        res.status(200).json({
            status: "true",
            message: "Application status updated successfully",
            data: application
        });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await appliactionModel.findById(id);

        if (!application) {
            return res.status(404).json({ status: "false", message: "Application not found" });
        }

        if (application.studentId?.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ status: "false", message: "Unauthorized to delete this application." });
        }

        await appliactionModel.findByIdAndDelete(id);

        res.status(200).json({
            status: "true",
            message: "Application deleted successfully"
        });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

module.exports = {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplicationStatus,
    deleteApplication
};