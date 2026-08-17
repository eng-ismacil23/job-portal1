const jwt = require('jsonwebtoken');
const HTTP_STATUS = require('../constants/httpStatusCodes');

if (!process.env.JWT_SECRET) {
    // Fail loudly in real environments instead of silently falling back
    // to a hardcoded default secret ('supersecretkey') that anyone reading
    // the source code (or the git history) could use to forge tokens.
    console.warn('[WARN] JWT_SECRET is not set. Using an insecure default - do NOT use this in production.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ status: "false", message: "Access denied. No token provided." });
    }

    const token = authHeader.replace(/^Bearer\s+/, '').trim();
    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ status: "false", message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ status: "false", message: "Invalid or expired token." });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                status: "false",
                message: "Unauthorized access. You do not have permission."
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
