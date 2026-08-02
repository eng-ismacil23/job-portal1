const { createApplication, getApplications, getApplicationById, updateApplicationStatus, deleteApplication } = require('../controller/applications.controller');
const { authenticate } = require('../middleware/auth');
const router = require('express').Router();

router.get('/', authenticate, getApplications);
router.get('/:id', authenticate, getApplicationById);
router.post('/', authenticate, createApplication);
router.delete('/:id', authenticate, deleteApplication);
router.put('/:id', authenticate, updateApplicationStatus);

module.exports = router;