const { getAddress, verifyMessage } = require('ethers');
const User = require('../models/UserModel');

async function login(req, res) {
  const { walletAddress, message, signature, name } = req.body;

  if (!walletAddress || !message || !signature) {
    return res.status(400).json({ message: 'walletAddress, message and signature are required.' });
  }

  try {
    const normalizedAddress = getAddress(walletAddress);
    const messageLines = message.split('\n');
    const issuedAtLine = messageLines.find((line) => line.startsWith('Issued At: '));
    const expectedMessage = [
      'Scholarship Ledger login',
      `Wallet: ${normalizedAddress}`,
      issuedAtLine
    ].join('\n');
    const issuedAt = issuedAtLine ? Date.parse(issuedAtLine.replace('Issued At: ', '')) : NaN;

    if (message !== expectedMessage || !Number.isFinite(issuedAt) || Math.abs(Date.now() - issuedAt) > 5 * 60 * 1000) {
      return res.status(401).json({ message: 'Authentication message is invalid or expired.' });
    }

    const recoveredAddress = getAddress(verifyMessage(message, signature));
    if (recoveredAddress !== normalizedAddress) {
      return res.status(401).json({ message: 'Wallet signature does not match the connected wallet.' });
    }

    let user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      user = await User.create({
        walletAddress: normalizedAddress,
        name: name || ''
      });
    }

    return res.json({ user });
  } catch (error) {
    if (error.code === 11000) {
      const user = await User.findOne({
        walletAddress: getAddress(walletAddress)
      });
      return res.json({ user });
    }

    if (error.code === 'INVALID_ARGUMENT') {
      return res.status(400).json({ message: 'Invalid Ethereum wallet address.' });
    }

    console.error('Error during wallet login:', error.message);
    return res.status(500).json({ message: 'Unable to login.' });
  }
}

module.exports = { login };
