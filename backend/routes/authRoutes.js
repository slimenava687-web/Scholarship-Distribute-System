const express = require('express');
const { login, updateProfile } = require('../controllers/authController');
const { authenticateWallet } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.put('/profile', authenticateWallet, updateProfile);

module.exports = router;
