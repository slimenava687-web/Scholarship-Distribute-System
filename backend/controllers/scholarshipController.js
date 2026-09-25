const Scholarship = require('../models/ScholarshipModel');

async function createScholarship(req, res) {
  try {
    const {
      scholarshipId,
      title,
      totalBudget,
      remainingBudget,
      deadline
    } = req.body;

    if (!scholarshipId || !title || totalBudget === undefined || !deadline) {
      return res.status(400).json({
        message: 'scholarshipId, title, totalBudget and deadline are required.'
      });
    }

    const budget = Number(totalBudget);
    const remaining = remainingBudget === undefined ? budget : Number(remainingBudget);

    if (!Number.isFinite(budget) || budget < 0 || !Number.isFinite(remaining) || remaining < 0 || remaining > budget) {
      return res.status(400).json({
        message: 'Budget values must be valid and remainingBudget cannot exceed totalBudget.'
      });
    }

    const scholarship = await Scholarship.create({
      scholarshipId,
      title,
      totalBudget: budget,
      remainingBudget: remaining,
      deadline
    });

    return res.status(201).json(scholarship);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'scholarshipId already exists.' });
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
