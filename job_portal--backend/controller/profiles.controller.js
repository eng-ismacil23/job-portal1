const { profileModel } = require('../models/profiles.service');
const HTTP_STATUS = require('../constants/httpStatusCodes');

const createProfile = async (req, res) => {
    try {
        const { bio, education, experience, CV } = req.body;
        const userId = req.user.id;

        const existingProfile = await profileModel.findOne({ userId });
        if (existingProfile) {
            const updated = await profileModel.findOneAndUpdate(
                { userId },
                { bio, education, experience, CV },
                { new: true, runValidators: true }
            );
            return res.status(HTTP_STATUS.OK).json({
                status: "true",
                message: "Profile updated successfully",
                data: updated
            });
        }

        const newProfile = new profileModel({ userId, bio, education, experience, CV });
        await newProfile.save();

        res.status(HTTP_STATUS.CREATED).json({
            status: "true",
            message: "Profile created successfully",
            data: newProfile
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

// Full profile listing - route-level `authorize('company', 'admin')` now
// restricts this so ordinary students can no longer browse everyone else's
// CV/bio/experience data (previously open to any authenticated user).
const GET = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const [profiles, total] = await Promise.all([
            profileModel.find().populate("userId", "name email role skills").skip(skip).limit(limit),
            profileModel.countDocuments()
        ]);

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Profiles found successfully",
            data: profiles,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const getProfileByUserId = async (req, res) => {
    try {
        const userId = req.params.userId || req.params.id;
        const profile = await profileModel.findOne({ userId }).populate("userId", "name email role skills");

        if (!profile) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Profile not found" });
        }

        res.status(HTTP_STATUS.OK).json({ status: "true", message: "Profile retrieved successfully", data: profile });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await profileModel.findOne({ userId }).populate("userId", "name email role skills");

        if (!profile) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Profile not found" });
        }

        res.status(HTTP_STATUS.OK).json({ status: "true", message: "Profile retrieved successfully", data: profile });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio, education, experience, CV } = req.body;

        const updatedProfile = await profileModel.findOneAndUpdate(
            { userId },
            { 
                bio: bio || '', 
                education: education || '', 
                experience: experience || '', 
                CV: CV || '' 
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(HTTP_STATUS.OK).json({ status: "true", message: "Profile updated successfully", data: updatedProfile });
    } catch (err) {
        console.error('updateMyProfile error:', err);
        res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: err.message || "Internal server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { bio, education, experience, CV } = req.body;

        const profile = await profileModel.findById(id);
        if (!profile) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Profile not found" });
        }

        if (profile.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized to update this profile." });
        }

        const updatedProfile = await profileModel.findByIdAndUpdate(
            id,
            { bio, education, experience, CV },
            { new: true, runValidators: true }
        );

        res.status(HTTP_STATUS.OK).json({ status: "true", message: "Profile updated successfully", data: updatedProfile });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

module.exports = {
    createProfile,
    getProfileByUserId,
    getMyProfile,
    updateMyProfile,
    updateProfile,
    GET
};
