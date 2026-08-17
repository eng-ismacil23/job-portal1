const {
    createProfile,
    getProfileByUserId,
    getMyProfile,
    updateMyProfile,
    updateProfile,
    GET
} = require('../controller/profiles.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { validateProfile } = require('../models/profiles.service');

const router = require('express').Router();

// Own profile (token-based)
router.get('/me', authenticate, getMyProfile);
router.post('/', authenticate, validate(validateProfile), createProfile);
router.patch('/', authenticate, updateMyProfile);

// By profile _id
router.patch('/:id', authenticate, updateProfile);

// All profiles - restricted to companies/admins so students can no longer
// browse every other user's CV/bio/experience.
router.get('/', authenticate, authorize('company', 'admin'), GET);

// By userId (for company viewing candidate profile)
router.get('/:userId', authenticate, getProfileByUserId);

module.exports = router;
