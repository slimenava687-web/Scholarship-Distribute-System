const Scholarship = require('../models/ScholarshipModel');

async function createScholarship(req, res) {
  try {
    const {
      scholarshipId,
      title,
      totalBudget,
      remainingBudget,
      rewardAmount,
      deadline,
      onChainId,
      txHash
    } = req.body;

    const missing = [];
    if (!scholarshipId) missing.push('scholarshipId');
    if (!title) missing.push('title');
    if (totalBudget === undefined || totalBudget === null || totalBudget === '') missing.push('totalBudget');
    if (!deadline) missing.push('deadline');

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Thiếu các thông tin bắt buộc: ${missing.join(', ')}.`
      });
    }

    const budget = Number(totalBudget);
    const remaining = remainingBudget === undefined ? budget : Number(remainingBudget);
    const reward = rewardAmount !== undefined && rewardAmount !== '' ? Number(rewardAmount) : 1;

    if (!Number.isFinite(budget) || budget < 0 || !Number.isFinite(remaining) || remaining < 0 || remaining > budget) {
      return res.status(400).json({
        message: 'Budget values must be valid and remainingBudget cannot exceed totalBudget.'
      });
    }

    if (!Number.isFinite(reward) || reward <= 0) {
      return res.status(400).json({
        message: 'rewardAmount must be greater than 0.'
      });
    }

    const parsedOnChainId = (onChainId !== undefined && onChainId !== null && onChainId !== '') ? Number(onChainId) : null;

    // Check if scholarship already exists by onChainId, txHash, or scholarshipId
    let existing = null;
    if (parsedOnChainId !== null) {
      existing = await Scholarship.findOne({ onChainId: parsedOnChainId });
    }
    if (!existing && txHash) {
      existing = await Scholarship.findOne({ txHash });
    }
    if (!existing) {
      existing = await Scholarship.findOne({ scholarshipId });
    }

    if (existing) {
      // If it's the same on-chain scholarship (or matched by txHash), update it idempotently
      const isSameOnChain = parsedOnChainId !== null && existing.onChainId === parsedOnChainId;
      const isSameTx = txHash && existing.txHash === txHash;
      if (isSameOnChain || isSameTx || existing.scholarshipId === scholarshipId) {
        existing.scholarshipId = scholarshipId;
        existing.title = title;
        existing.totalBudget = budget;
        existing.remainingBudget = remaining;
        existing.rewardAmount = reward;
        existing.deadline = deadline;
        if (parsedOnChainId !== null) existing.onChainId = parsedOnChainId;
        if (txHash) existing.txHash = txHash;
        await existing.save();
        return res.status(200).json(existing);
      }

      return res.status(409).json({ message: `Mã học bổng "${scholarshipId}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` });
    }

    const scholarship = await Scholarship.create({
      scholarshipId,
      title,
      totalBudget: budget,
      remainingBudget: remaining,
      rewardAmount: reward,
      deadline,
      onChainId: parsedOnChainId,
      txHash: txHash || ''
    });

    return res.status(201).json(scholarship);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Mã học bổng đã tồn tại trên hệ thống. Vui lòng chọn mã khác.' });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    console.error('Error creating scholarship:', error.message);
    return res.status(500).json({ message: 'Unable to create scholarship.' });
  }
}

async function getActiveScholarships(req, res) {
  try {
    const scholarships = await Scholarship.find({
      isActive: true,
      deadline: { $gte: new Date() }
    }).sort({ deadline: 1 });

    return res.json(scholarships);
  } catch (error) {
    console.error('Error fetching scholarships:', error.message);
    return res.status(500).json({ message: 'Unable to fetch scholarships.' });
  }
}

module.exports = { createScholarship, getActiveScholarships };
