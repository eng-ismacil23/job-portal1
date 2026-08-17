const { jobModel, validateJobs } = require('../models/jobs.service');
const HTTP_STATUS = require('../constants/httpStatusCodes');

// Get all jobs (paginated, optionally hides expired jobs)
const GET = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const filter = {
            status: { $nin: ['terminated'] }
        };
        if (req.query.activeOnly === 'true') {
            filter.deadline = { $gte: new Date() };
            filter.status = 'active';
        }

        const [jobs, total] = await Promise.all([
            jobModel.find(filter)
                .populate("createdBy", "name email")
                .select('title company description deadline positionsCount maxApplicants status companyLogo createdBy')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            jobModel.countDocuments(filter)
        ]);

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Jobs found successfully",
            data: jobs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// Get company's own jobs
const GETMYJOBS = async (req, res) => {
    try {
        const jobs = await jobModel.find({ createdBy: req.user.id })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Company jobs fetched successfully",
            data: jobs
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

// Get job by ID
const GETBYID = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await jobModel.findById(id).populate("createdBy", "name email");
        if (!job) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Job not found" });
        }
        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Job found successfully",
            data: job
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
}

// Create job (body already validated by `validate(validateJobs)` middleware)
const POST = async (req, res) => {
    try {
        const { title, company, description, deadline, positionsCount, maxApplicants, status, companyLogo } = req.body;
        const createdBy = req.user.id;

        const newJob = new jobModel({
            title,
            company,
            description,
            deadline,
            positionsCount: positionsCount || 1,
            maxApplicants: maxApplicants || 10,
            status: status || 'active',
            companyLogo: companyLogo || '',
            createdBy
        });
        await newJob.save();

        res.status(HTTP_STATUS.CREATED).json({
            status: "true",
            message: "Job created successfully",
            data: newJob
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
}

// Update job (Company owner or Admin)
const PUT = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await jobModel.findById(id);

        if (!job) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Job not found." });
        }

        const creatorId = (job.createdBy?._id || job.createdBy || '').toString();
        const currentUserId = (req.user.id || req.user._id || '').toString();

        if (creatorId !== currentUserId && req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized. You can only update your own jobs." });
        }

        const { title, company, description, deadline, positionsCount, maxApplicants, status, companyLogo } = req.body;
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (company !== undefined) updateData.company = company;
        if (description !== undefined) updateData.description = description;
        if (deadline !== undefined) updateData.deadline = new Date(deadline);
        if (positionsCount !== undefined) updateData.positionsCount = positionsCount;
        if (maxApplicants !== undefined) updateData.maxApplicants = maxApplicants;
        if (status !== undefined) updateData.status = status;
        if (companyLogo !== undefined) updateData.companyLogo = companyLogo;

        const updatedJob = await jobModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Job updated successfully",
            data: updatedJob
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
}

// Delete job
const DELETE = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await jobModel.findById(id);

        if (!job) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Job not found." });
        }

        const creatorId = (job.createdBy?._id || job.createdBy || '').toString();
        const currentUserId = (req.user.id || req.user._id || '').toString();

        if (creatorId !== currentUserId && req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized. You can only delete your own jobs." });
        }

        await jobModel.findByIdAndDelete(id);

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Job deleted successfully"
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
}

module.exports = {
    GET,
    GETMYJOBS,
    GETBYID,
    POST,
    PUT,
    DELETE
};
