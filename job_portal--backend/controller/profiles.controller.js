const { profileModel } = require('../models/profiles.service');

const createProfile = async (req, res) => {
    try {
        const { bio, education, experience, CV } = req.body;
        const userId = req.user.id;

        const existingProfile = await profileModel.findOne({ userId });
        if (existingProfile) {
            // Auto-update instead of rejecting
            const updated = await profileModel.findOneAndUpdate(
                { userId },
                { bio, education, experience, CV },
                { new: true }
            );
            return res.status(200).json({
                status: "true",
                message: "Profile updated successfully",
                data: updated
            });
        }

        const newProfile = new profileModel({ userId, bio, education, experience, CV });
        await newProfile.save();

        res.status(201).json({
            status: "true",
            message: "Profile created successfully",
            data: newProfile
        });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

const GET = async (req, res) => {
    try {
        const profiles = await profileModel.find().populate("userId", "name email role skills");
        res.status(200).json({ status: "true", message: "Profiles found successfully", data: profiles });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

// GET by userId param  e.g. GET /profiles/:userId
const getProfileByUserId = async (req, res) => {
    try {
        const userId = req.params.userId || req.params.id;
        const profile = await profileModel.findOne({ userId }).populate("userId", "name email role skills");

        if (!profile) {
            return res.status(404).json({ status: "false", message: "Profile not found" });
        }

        res.status(200).json({ status: "true", message: "Profile retrieved successfully", data: profile });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

// GET own profile (from token)
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await profileModel.findOne({ userId }).populate("userId", "name email role skills");

        if (!profile) {
            return res.status(404).json({ status: "false", message: "Profile not found" });
        }

        res.status(200).json({ status: "true", message: "Profile retrieved successfully", data: profile });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

// PATCH /profiles  — update own profile by token (no :id needed)
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio, education, experience, CV } = req.body;

        const updatedProfile = await profileModel.findOneAndUpdate(
            { userId },
            { bio, education, experience, CV },
            { new: true, upsert: true }   // upsert: create if not exists
        );

        res.status(200).json({ status: "true", message: "Profile updated successfully", data: updatedProfile });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
    }
};

// PATCH /profiles/:id  (by profile _id, for admin or backward compat)
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { bio, education, experience, CV } = req.body;

        const profile = await profileModel.findById(id);
        if (!profile) {
            return res.status(404).json({ status: "false", message: "Profile not found" });
        }

        if (profile.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ status: "false", message: "Unauthorized to update this profile." });
        }

        const updatedProfile = await profileModel.findByIdAndUpdate(
            id,
            { bio, education, experience, CV },
            { new: true }
        );

        res.status(200).json({ status: "true", message: "Profile updated successfully", data: updatedProfile });
    } catch (err) {
        res.status(500).json({ status: "false", message: "Internal server error", error: err.message });
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
