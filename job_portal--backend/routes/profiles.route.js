const {
    createProfile,
    getProfileByUserId,
    getMyProfile,
    updateMyProfile,
    updateProfile,
    GET
} = require('../controller/profiles.controller');
const { authenticate } = require('../middleware/auth');

const router = require('express').Router();

// Own profile (token-based)
router.get('/me', authenticate, getMyProfile);
router.post('/', authenticate, createProfile);
router.patch('/', authenticate, updateMyProfile);   // Update own profile

// By profile _id
router.patch('/:id', authenticate, updateProfile);

// All profiles
router.get('/', authenticate, GET);

// By userId (for company viewing candidate profile)
router.get('/:userId', authenticate, getProfileByUserId);

module.exports = router;
