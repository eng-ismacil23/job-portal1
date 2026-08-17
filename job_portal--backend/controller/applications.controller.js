const { appliactionModel, validateApplication } = require('../models/applications.service');
const { jobModel } = require('../models/jobs.service');
const HTTP_STATUS = require('../constants/httpStatusCodes');

// Body already validated by `validate(validateApplication)` middleware.
const createApplication = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Only students can apply for jobs." });
        }

        const { jobId, phone, coverLetter, experience, education, portfolio } = req.body;
        const studentId = req.user.id;

        const jobExists = await jobModel.findById(jobId);
        if (!jobExists) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Job not found." });
        }

        if (jobExists.status === 'terminated' || jobExists.status === 'closed') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: "false",
                message: "Shaqadan waa la joojiyay (terminated/closed), mar kale ma dalban kartid."
            });
        }

        // Check applicant capacity limit
        const currentCount = await appliactionModel.countDocuments({ jobId });
        if (jobExists.maxApplicants && currentCount >= jobExists.maxApplicants) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: "false",
                message: `Shaqadan waxaa buuxsamay tiradii ugu badnayd ee loogu talagalay (${jobExists.maxApplicants} codsade).`
            });
        }

        const alreadyApplied = await appliactionModel.findOne({ jobId, studentId });
        if (alreadyApplied) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: "You have already applied for this job." });
        }

        const newApplication = new appliactionModel({
            jobId,
            studentId,
            phone: phone || '',
            coverLetter: coverLetter || '',
            experience: experience || '',
            education: education || '',
            portfolio: portfolio || '',
            status: 'Pending'
        });

        await newApplication.save();

        res.status(HTTP_STATUS.CREATED).json({
            status: "true",
            message: "Application submitted successfully",
            data: newApplication
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: "You have already applied for this job." });
        }
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const getApplications = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 500);
        const skip = (page - 1) * limit;

        let query = {};

        if (req.user.role === 'company') {
            const myJobs = await jobModel.find({ createdBy: req.user.id }).select('_id');
            const jobIds = myJobs.map(job => job._id);
            query = { jobId: { $in: jobIds } };
        } else if (req.user.role === 'student') {
            query = { studentId: req.user.id };
        } // admin gets all applications (query = {})

        const [applications, total] = await Promise.all([
            appliactionModel.find(query)
                .populate("jobId", "title company createdBy description deadline maxApplicants positionsCount")
                .populate("studentId", "name email skills role avatar bio education experience CV")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            appliactionModel.countDocuments(query)
        ]);

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Applications retrieved successfully",
            data: applications,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await appliactionModel.findById(id)
            .populate("jobId", "title company createdBy description deadline")
            .populate("studentId", "name email skills");

        if (!application) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Application not found" });
        }

        const studentOwnerId = application.studentId?._id?.toString() || application.studentId?.toString();
        const jobOwnerId = application.jobId?.createdBy?.toString();

        const isStudentOwner = studentOwnerId === req.user.id;
        const isJobOwner = jobOwnerId === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isStudentOwner && !isJobOwner && !isAdmin) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized to view this application." });
        }

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Application retrieved successfully",
            data: application
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, phone, coverLetter, experience, education, portfolio } = req.body;

        const application = await appliactionModel.findById(id).populate("jobId");
        if (!application) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Application not found" });
        }

        const studentOwnerId = (application.studentId?._id || application.studentId || '').toString();
        const jobOwnerId = (application.jobId?.createdBy?._id || application.jobId?.createdBy || '').toString();
        const currentUserId = (req.user.id || req.user._id || '').toString();
        const isAdmin = req.user.role === 'admin';
        const isCompanyOwner = req.user.role === 'company' && jobOwnerId === currentUserId;
        const isStudentOwner = req.user.role === 'student' && studentOwnerId === currentUserId;

        // 1. Company owner or Admin updating application status (Accept / Reject)
        if (status !== undefined) {
            if (!isCompanyOwner && !isAdmin) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized. Only the company or admin can change application status." });
            }
            const allowedStatuses = ["Pending", "Accepted", "Rejected", "applied", "pending"];
            if (!allowedStatuses.includes(status)) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: `Status must be one of: Pending, Accepted, Rejected` });
            }
            application.status = status;
        }

        // 2. Student updating their own submitted form details
        if (isStudentOwner) {
            const isPending = ['Pending', 'pending', 'applied', 'not applied'].includes(application.status);
            if (!isPending) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    status: "false",
                    message: "Codsigan go'aan ayaa laga gaaray (Accepted/Rejected), xogtiisa ma beddeli kartid."
                });
            }

            if (phone !== undefined) application.phone = phone;
            if (coverLetter !== undefined) application.coverLetter = coverLetter;
            if (experience !== undefined) application.experience = experience;
            if (education !== undefined) application.education = education;
            if (portfolio !== undefined) application.portfolio = portfolio;
        } else if (status === undefined && !isAdmin && !isCompanyOwner) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized to update this application." });
        }

        await application.save();

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: isStudentOwner ? "Application updated successfully" : "Application status updated successfully",
            data: application
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await appliactionModel.findById(id);

        if (!application) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Application not found" });
        }

        const studentOwnerId = (application.studentId?._id || application.studentId || '').toString();
        const currentUserId = (req.user.id || req.user._id || '').toString();
        const isAdmin = req.user.role === 'admin';

        if (studentOwnerId !== currentUserId && !isAdmin) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized to cancel this application." });
        }

        await appliactionModel.findByIdAndDelete(id);

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Application canceled successfully"
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

module.exports = {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    updateApplicationStatus: updateApplication,
    deleteApplication
};
