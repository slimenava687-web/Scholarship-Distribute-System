const { getAddress } = require('ethers');
const User = require('../models/UserModel');

async function authenticateWallet(req, res, next) {
  const walletAddress = req.header('x-wallet-address');

  if (!walletAddress) {
    return res.status(401).json({ message: 'Wallet address is required.' });
  }

  try {
    const normalizedAddress = getAddress(walletAddress);
    let user = await User.findOne({
      $or: [
        { walletAddress: normalizedAddress },
        { walletAddress: { $regex: new RegExp(`^${normalizedAddress}$`, 'i') } }
      ]
    });

    if (!user) {
      user = await User.create({
        walletAddress: normalizedAddress,
        role: 'student',
        name: ''
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid Ethereum wallet address.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access is required.' });
  }

  return next();
}

module.exports = { authenticateWallet, requireAdmin };