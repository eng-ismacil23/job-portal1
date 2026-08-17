const {
    GET, GETBYSKILL, GETBYID, POST, POSTLOGIN, PUT, DELETE, GetCompanies,
    GET_DELETED, RESTORE_USER, RESTORE_ALL, PERMANENT_DELETE, ADMIN_CREATE_USER,
    GET_SESSIONS, REVOKE_SESSION, CLEAR_SESSIONS, GET_ADMIN_STATS
} = require('../controller/users.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { validateUsers } = require('../models/users.service');
const { authLimiter } = require('../middleware/rateLimiters');

const router = require('express').Router();

router.post('/register', authLimiter, validate(validateUsers), POST);
router.post('/login', authLimiter, POSTLOGIN);

// Admin-specific routes (MUST be before /:id)
router.get('/deleted', authenticate, authorize('admin'), GET_DELETED);
router.post('/admin-create', authenticate, authorize('admin'), ADMIN_CREATE_USER);
router.put('/restore-all', authenticate, authorize('admin'), RESTORE_ALL);
router.put('/:id/restore', authenticate, authorize('admin'), RESTORE_USER);
router.delete('/:id/permanent', authenticate, authorize('admin'), PERMANENT_DELETE);

// Admin Sessions & Security Logs routes
router.get('/sessions/all', authenticate, authorize('admin'), GET_SESSIONS);
router.get('/admin-stats', authenticate, authorize('admin'), GET_ADMIN_STATS);
router.put('/sessions/:id/revoke', authenticate, authorize('admin'), REVOKE_SESSION);
router.delete('/sessions/clear-revoked', authenticate, authorize('admin'), CLEAR_SESSIONS);

router.get('/', authenticate, GET);
router.get('/companies', GetCompanies);         // must be BEFORE /:id
router.get('/skill/:skills', authenticate, GETBYSKILL);
router.get('/:id', authenticate, GETBYID);

router.put('/:id', authenticate, PUT);
router.delete('/:id', authenticate, DELETE);

module.exports = router;
