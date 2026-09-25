const express = require('express');
const {
  createApplication,
  getMyApplications
} = require('../controllers/applicationController');
const { authenticateWallet } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateWallet, createApplication);
router.get('/my-applications', authenticateWallet, getMyApplications);

module.exports = router;
