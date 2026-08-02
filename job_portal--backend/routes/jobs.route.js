const { GET, GETMYJOBS, GETBYID, POST, DELETE } = require('../controller/jobs.controller');
const { authenticate, authorize } = require('../middleware/auth');
const router = require('express').Router();

router.get('/', GET);
router.get('/my-jobs', authenticate, authorize('company', 'admin'), GETMYJOBS);
router.get('/:id', GETBYID);
router.post('/', authenticate, authorize('company', 'admin'), POST);
router.delete('/:id', authenticate, authorize('company', 'admin'), DELETE);

module.exports = router;
