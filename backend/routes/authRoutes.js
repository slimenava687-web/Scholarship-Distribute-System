const express = require('express');
const { login, updateProfile, getMe } = require('../controllers/authController');
const { authenticateWallet } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateWallet, getMe);
router.put('/profile', authenticateWallet, updateProfile);

module.exports = router;
