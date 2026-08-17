const { GET, GETMYJOBS, GETBYID, POST, PUT, DELETE } = require('../controller/jobs.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { validateJobs } = require('../models/jobs.service');
const router = require('express').Router();

router.get('/', GET);
router.get('/my-jobs', authenticate, authorize('company', 'admin'), GETMYJOBS);
router.get('/:id', GETBYID);
router.post('/', authenticate, authorize('company', 'admin'), validate(validateJobs), POST);
router.put('/:id', authenticate, authorize('company', 'admin'), PUT);
router.delete('/:id', authenticate, authorize('company', 'admin'), DELETE);

module.exports = router;
