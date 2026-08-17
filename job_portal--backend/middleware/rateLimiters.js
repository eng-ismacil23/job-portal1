const rateLimit = require('express-rate-limit');

// Limits brute-force attempts against /login and /register.
// 20 requests per 15 minutes per IP is generous for real users but
// makes password-guessing attacks impractically slow.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: "false", message: "Too many attempts, please try again later." }
});

module.exports = { authLimiter };
