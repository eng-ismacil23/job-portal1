const { usersModel, validateUsers } = require('../models/users.service');
const { jobModel } = require('../models/jobs.service');
const { appliactionModel } = require('../models/applications.service');
const { sessionModel } = require('../models/sessions.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HTTP_STATUS = require('../constants/httpStatusCodes');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const parseDeviceDetails = (userAgent = '') => {
    let os = 'Windows 11/10';
    if (/windows nt 10.0/i.test(userAgent)) os = 'Windows 10/11';
    else if (/windows nt 6.3/i.test(userAgent)) os = 'Windows 8.1';
    else if (/windows/i.test(userAgent)) os = 'Windows PC';
    else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
    else if (/android 14/i.test(userAgent)) os = 'Android 14';
    else if (/android 13/i.test(userAgent)) os = 'Android 13';
    else if (/android/i.test(userAgent)) os = 'Android Mobile';
    else if (/iphone/i.test(userAgent)) os = 'iPhone iOS';
    else if (/ipad/i.test(userAgent)) os = 'iPadOS';
    else if (/linux/i.test(userAgent)) os = 'Linux PC';

    let browser = 'Chrome';
    if (/edg\//i.test(userAgent)) browser = 'Microsoft Edge';
    else if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) browser = 'Google Chrome';
    else if (/firefox\//i.test(userAgent)) browser = 'Mozilla Firefox';
    else if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) browser = 'Apple Safari';
    else if (/opera|opr\//i.test(userAgent)) browser = 'Opera Browser';

    let deviceType = 'Desktop';
    if (/mobi|iphone|android/i.test(userAgent)) deviceType = 'Mobile';
    else if (/ipad|tablet/i.test(userAgent)) deviceType = 'Tablet';

    return {
        device: `${os} (${browser})`,
        browser,
        os,
        deviceType
    };
};

const parseIpLocation = (ip = '') => {
    if (!ip || ip.includes('127.0.0.1') || ip.includes('::1') || ip.includes('localhost')) {
        return {
            location: 'Mogadishu, Somalia 🇸🇴 (Local LAN)',
            country: 'Somalia 🇸🇴',
            city: 'Mogadishu'
        };
    }
    return {
        location: `Mogadishu, Somalia 🇸🇴 (${ip})`,
        country: 'Somalia 🇸🇴',
        city: 'Mogadishu'
    };
};

// get top 5 companies by real job count (min 1 job)
const GetCompanies = async (req, res) => {
    try {
        const tints = ['#3B82F6', '#EC4899', '#22C55E', '#F59E0B', '#8B5CF6'];

        const companies = await usersModel.find({ status: 'active', role: 'company' })
            .select('name email')
            .lean();

        if (!companies.length) {
            return res.status(HTTP_STATUS.OK).json({ success: true, message: "No companies found", data: [] });
        }

        const companyIds = companies.map(c => c._id);
        const jobCounts = await jobModel.aggregate([
            { $match: { createdBy: { $in: companyIds } } },
            { $group: { _id: '$createdBy', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        jobCounts.forEach(j => { countMap[j._id.toString()] = j.count; });

        const withJobs = companies
            .map((company, index) => ({
                _id: company._id,
                name: company.name,
                email: company.email,
                jobCount: countMap[company._id.toString()] || 0,
                jobs: `${countMap[company._id.toString()] || 0} Job${(countMap[company._id.toString()] || 0) !== 1 ? 's' : ''}`,
                initial: company.name ? company.name.charAt(0).toUpperCase() : 'C',
                tint: tints[index % tints.length],
            }))
            .filter(c => c.jobCount >= 1)
            .sort((a, b) => b.jobCount - a.jobCount)
            .slice(0, 5);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Top companies fetched successfully",
            data: withJobs
        });

    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};

// get all users (paginated)
const GET = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            usersModel.find({ status: 'active' })
                .select('name email role skills status')
                .skip(skip)
                .limit(limit),
            usersModel.countDocuments({ status: 'active' })
        ]);

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Users found successfully",
            data: users,
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

// get by skill
const GETBYSKILL = async (req, res) => {
    try {
        const skill = req.params.skills;
        const users = await usersModel.find({ status: 'active', skills: skill })
            .select('name email role skills');
        if (!users || users.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: "false",
                message: "Users not found"
            });
        }
        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Users found successfully",
            data: users
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// get user by id
const GETBYID = async (req, res) => {
    try {
        const userById = req.params.id;
        const user = await usersModel.findOne({ _id: userById, status: 'active' })
            .select('name email role skills avatar');
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "User not found" });
        }
        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "User found successfully",
            data: user
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// create user (body already validated by the `validate(validateUsers)` middleware in the route)
const POST = async (req, res) => {
    try {
        const { name, email, role, skills, password } = req.body;

        const existingUser = await usersModel.findOne({ email });
        if (existingUser) {
            return res.status(HTTP_STATUS.CONFLICT).json({ status: "false", message: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new usersModel({
            name,
            email,
            role,
            skills: role === "company" ? undefined : skills,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role, email: newUser.email, name: newUser.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(HTTP_STATUS.CREATED).json({
            status: "true",
            message: "User created successfully",
            token: token,
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                skills: newUser.skills
            }
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// post user login
const POSTLOGIN = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Defense in depth against NoSQL-operator injection (e.g. { "$gt": "" })
        // even though the `validate` route middleware should already reject this.
        if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: "Email and password are required" });
        }

        const user = await usersModel.findOne({ email }).select('+password');
        if (!user || user.status === 'deleted') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: "Email or password is incorrect" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: "Email or password is incorrect" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Record User Session & Security Info
        try {
            const userAgentStr = req.headers['user-agent'] || 'Unknown Device';
            const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
            const cleanIp = (rawIp.includes('::1') || rawIp.includes('127.0.0.1')) ? '127.0.0.1 (Localhost)' : rawIp.split(',')[0].trim();
            const deviceName = parseDeviceDetails(userAgentStr).device;

            await sessionModel.create({
                userId: user._id,
                userName: user.name,
                userEmail: user.email,
                role: user.role,
                ipAddress: cleanIp,
                device: deviceName,
                userAgent: userAgentStr,
                status: 'active',
                lastActive: new Date()
            });
        } catch (sessErr) {
            console.error('Session logging error (non-fatal):', sessErr.message);
        }

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "User logged in successfully",
            token: token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                skills: user.skills,
                avatar: user.avatar || ''
            }
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// update user
const PUT = async (req, res) => {
    try {
        const id = req.params.id;
        const isSelf = req.user.id === id;
        const isAdmin = req.user.role === 'admin';

        if (!isSelf && !isAdmin) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized to update this user." });
        }

        const { name, email, role, skills, password, status, avatar } = req.body;
        let updateData = { name, email, skills };
        if (avatar !== undefined) updateData.avatar = avatar;

        // Only an admin may change role/status - prevents privilege escalation
        // where a user could PUT their own account with role: 'admin'.
        if (isAdmin) {
            if (role !== undefined) updateData.role = role;
            if (status !== undefined) updateData.status = status;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updateUser = await usersModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .select('_id name email role skills status avatar');

        if (!updateUser) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "User not found" });
        }

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "User updated successfully",
            data: updateUser
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// delete user by id (soft delete)
const DELETE = async (req, res) => {
    try {
        const id = req.params.id;

        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Unauthorized to delete this account." });
        }

        const deleteUser = await usersModel.findByIdAndUpdate(id, { status: 'deleted' }, { new: true })
            .select('_id name email role skills status');

        if (!deleteUser) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "User not found" });
        }

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "User deleted successfully",
            data: deleteUser
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
}

// Get soft-deleted users (Recycle Bin - Admin Only)
const GET_DELETED = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Admin access required." });
        }

        const { search, startDate, endDate } = req.query;
        let query = { status: 'deleted' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            query.updatedAt = {};
            if (startDate) query.updatedAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.updatedAt.$lte = end;
            }
        }

        const deletedUsers = await usersModel.find(query)
            .select('name email role skills status updatedAt createdAt')
            .sort({ updatedAt: -1 });

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Deleted users fetched successfully",
            data: deletedUsers
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

// Restore soft-deleted user (Admin Only)
const RESTORE_USER = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Admin access required." });
        }

        const { id } = req.params;
        const restoredUser = await usersModel.findByIdAndUpdate(
            id,
            { status: 'active' },
            { new: true }
        ).select('_id name email role skills status');

        if (!restoredUser) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "User not found" });
        }

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "User restored successfully",
            data: restoredUser
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

// Restore all soft-deleted users (Admin Only)
const RESTORE_ALL = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Admin access required." });
        }

        const result = await usersModel.updateMany(
            { status: 'deleted' },
            { status: 'active' }
        );

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: `Dhamaan users-kii la delaayay waa la soo celiyay (${result.modifiedCount} user).`,
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

// Permanent delete (Admin Only)
const PERMANENT_DELETE = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Admin access required." });
        }

        const { id } = req.params;
        const deleted = await usersModel.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "User not found" });
        }

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "User permanently deleted"
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

// Admin create user (Admin Only - allows creating admin, student, or company)
const ADMIN_CREATE_USER = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Admin access required." });
        }

        const { name, email, role, skills, password } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: "false", message: "Name, email, password, and role are required." });
        }

        const existingUser = await usersModel.findOne({ email });
        if (existingUser) {
            return res.status(HTTP_STATUS.CONFLICT).json({ status: "false", message: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new usersModel({
            name,
            email,
            role,
            skills: role === "company" ? undefined : (skills || []),
            password: hashedPassword,
            status: 'active'
        });

        await newUser.save();

        res.status(HTTP_STATUS.CREATED).json({
            status: "true",
            message: "User created by admin successfully",
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                skills: newUser.skills,
                status: newUser.status
            }
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

// Get User Sessions & Security Logs (Admin Only)
const GET_SESSIONS = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Admin access required." });
        }

        const { search, status } = req.query;
        let filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } },
                { ipAddress: { $regex: search, $options: 'i' } },
                { device: { $regex: search, $options: 'i' } }
            ];
        }

        const sessions = await sessionModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Sessions fetched successfully",
            data: sessions
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

// Revoke User Session (Admin Only)
const REVOKE_SESSION = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Admin access required." });
        }

        const { id } = req.params;
        const session = await sessionModel.findByIdAndUpdate(
            id,
            { status: 'revoked' },
            { new: true }
        );

        if (!session) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ status: "false", message: "Session not found." });
        }

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Session revoked successfully",
            data: session
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

// Clear Revoked Sessions (Admin Only)
const CLEAR_SESSIONS = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Admin access required." });
        }

        await sessionModel.deleteMany({ status: 'revoked' });

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Revoked session logs cleared successfully"
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

// Admin Stats – real data aggregated from DB for the analytics graph
const GET_ADMIN_STATS = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ status: "false", message: "Admin access required." });
        }

        const range = req.query.range || '1y'; // '7d' | '30d' | '1y'
        const now = new Date();
        let startDate;
        let groupFormat;
        let labelFormat;

        if (range === '7d') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
            groupFormat = '%Y-%m-%d';
            labelFormat = 'day';
        } else if (range === '30d') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
            groupFormat = '%Y-%m-%d';
            labelFormat = 'day';
        } else {
            // 1y — group by month
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 11);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            groupFormat = '%Y-%m';
            labelFormat = 'month';
        }

        // MongoDB aggregation helper
        const aggregate = (Model, matchExtra = {}) =>
            Model.aggregate([
                { $match: { createdAt: { $gte: startDate }, ...matchExtra } },
                {
                    $group: {
                        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

        const [usersData, jobsData, appsData] = await Promise.all([
            aggregate(usersModel),
            aggregate(jobModel),
            aggregate(appliactionModel)
        ]);

        // Build a full set of period labels between startDate and now
        const labels = [];
        const cur = new Date(startDate);
        if (labelFormat === 'month') {
            while (cur <= now) {
                const y = cur.getFullYear();
                const m = String(cur.getMonth() + 1).padStart(2, '0');
                labels.push(`${y}-${m}`);
                cur.setMonth(cur.getMonth() + 1);
            }
        } else {
            while (cur <= now) {
                const y = cur.getFullYear();
                const m = String(cur.getMonth() + 1).padStart(2, '0');
                const d = String(cur.getDate()).padStart(2, '0');
                labels.push(`${y}-${m}-${d}`);
                cur.setDate(cur.getDate() + 1);
            }
        }

        const toMap = (arr) => {
            const m = {};
            arr.forEach(item => { m[item._id] = item.count; });
            return m;
        };

        const usersMap = toMap(usersData);
        const jobsMap = toMap(jobsData);
        const appsMap = toMap(appsData);

        // Friendly display labels
        const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

        const data = labels.map(label => {
            let name;
            if (labelFormat === 'month') {
                const [, mm] = label.split('-');
                name = monthNames[parseInt(mm, 10) - 1];
            } else if (range === '7d') {
                const d = new Date(label + 'T00:00:00');
                name = dayNames[d.getDay()];
            } else {
                // 30d – show MM/DD
                const [, mm, dd] = label.split('-');
                name = `${mm}/${dd}`;
            }
            return {
                name,
                label,
                users: usersMap[label] || 0,
                jobs: jobsMap[label] || 0,
                applications: appsMap[label] || 0
            };
        });

        // Summary totals
        const totals = {
            users: data.reduce((s, d) => s + d.users, 0),
            jobs: data.reduce((s, d) => s + d.jobs, 0),
            applications: data.reduce((s, d) => s + d.applications, 0)
        };

        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Admin stats fetched successfully",
            data,
            totals,
            range
        });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Internal server error",
            error: err.message
        });
    }
};

module.exports = {
    GET,
    GETBYSKILL,
    GETBYID,
    POST,
    POSTLOGIN,
    PUT,
    DELETE,
    GetCompanies,
    GET_DELETED,
    RESTORE_USER,
    RESTORE_ALL,
    PERMANENT_DELETE,
    ADMIN_CREATE_USER,
    GET_SESSIONS,
    REVOKE_SESSION,
    CLEAR_SESSIONS,
    GET_ADMIN_STATS
};
