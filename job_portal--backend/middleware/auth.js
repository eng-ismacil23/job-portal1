const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization || req.header('Authorization') || req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ status: "false", message: "Access denied. No token provided." });
    }

    const token = authHeader.replace(/^Bearer\s+/, '').trim();
    if (!token) {
        return res.status(401).json({ status: "false", message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ status: "false", message: "Invalid or expired token." });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "false",
                message: "Unauthorized access. You do not have permission."
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };