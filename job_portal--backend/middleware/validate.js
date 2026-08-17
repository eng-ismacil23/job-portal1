const HTTP_STATUS = require('../constants/httpStatusCodes');

// Generic Joi-validation middleware.
// Usage: router.post('/', validate(validateUsers), POST)
// Fixes the previous bug where Joi validators existed in every
// *.service.js file but were never actually called, leaving every
// route open to malformed / malicious payloads (incl. NoSQL-injection
// style objects such as { "$gt": "" } for string fields).
const validate = (validatorFn) => {
    return (req, res, next) => {
        const { error, value } = validatorFn(req.body);
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: "false",
                message: error.details.map((d) => d.message).join(', ')
            });
        }
        req.body = value; // use the sanitized/validated payload from here on
        next();
    };
};

module.exports = validate;
