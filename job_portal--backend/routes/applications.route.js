const { createApplication, getApplications, getApplicationById, updateApplicationStatus, deleteApplication } = require('../controller/applications.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { validateApplication } = require('../models/applications.service');
const router = require('express').Router();

router.get('/', authenticate, getApplications);
router.get('/:id', authenticate, getApplicationById);
router.post('/', authenticate, validate(validateApplication), createApplication);
router.delete('/:id', authenticate, deleteApplication);
router.put('/:id', authenticate, updateApplicationStatus);

module.exports = router;
