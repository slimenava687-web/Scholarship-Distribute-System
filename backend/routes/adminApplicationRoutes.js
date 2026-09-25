const express = require('express');
const {
	getAllApplications,
	updateApplicationStatus
} = require('../controllers/applicationController');
const { authenticateWallet, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateWallet, requireAdmin, getAllApplications);
router.patch('/:id/status', authenticateWallet, requireAdmin, updateApplicationStatus);

module.exports = router;