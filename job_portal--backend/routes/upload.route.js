const express = require('express');
const router = express.Router();
const { handleUpload } = require('../controller/upload.controller');
const { authenticate } = require('../middleware/auth');

// Protected route: requiring login to upload images
router.post('/', authenticate, handleUpload);

module.exports = router;
