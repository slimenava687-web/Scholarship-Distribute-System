const express = require('express');
const { createScholarship, getActiveScholarships } = require('../controllers/scholarshipController');
const { authenticateWallet, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateWallet, requireAdmin, createScholarship);
router.get('/', getActiveScholarships);

module.exports = router;
