const crypto = require('crypto');
const { getAddress } = require('ethers');
const mongoose = require('mongoose');
const Application = require('../models/ApplicationModel');
const Scholarship = require('../models/ScholarshipModel');

async function createApplication(req, res) {
  try {
    const { scholarshipId, studentAddress, studentName } = req.body;

    if (!scholarshipId || !studentAddress || !studentName) {
      return res.status(400).json({
        message: 'scholarshipId, studentAddress and studentName are required.'
      });
    }

    let normalizedStudentAddress;
    try {
      normalizedStudentAddress = getAddress(studentAddress);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid Ethereum wallet address.' });
    }

    if (normalizedStudentAddress !== req.user.walletAddress) {
      return res.status(403).json({
        message: 'studentAddress must match the authenticated wallet.'
      });
    }

    const scholarship = await Scholarship.findOne({
      scholarshipId,
      isActive: true,
      deadline: { $gte: new Date() }
    });

    if (!scholarship) {
      return res.status(404).json({ message: 'Active scholarship not found.' });
    }

    const application = await Application.create({
      applicationId: crypto.randomUUID(),
      scholarshipId,
      studentAddress: normalizedStudentAddress,
      studentName,
      status: 'pending'
    });

    return res.status(201).json(application);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    console.error('Error creating application:', error.message);
    return res.status(500).json({ message: 'Unable to create application.' });
  }
}

async function getMyApplications(req, res) {
  try {
    const applications = await Application.find({
      studentAddress: req.user.walletAddress
    }).sort({ createdAt: -1 });

    return res.json(applications);
  } catch (error) {
    console.error('Error fetching student applications:', error.message);
    return res.status(500).json({ message: 'Unable to fetch applications.' });
  }
}

async function getAllApplications(req, res) {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    return res.json(applications);
  } catch (error) {
    console.error('Error fetching all applications:', error.message);
    return res.status(500).json({ message: 'Unable to fetch applications.' });
  }
}

async function updateApplicationStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      message: "status must be either 'approved' or 'rejected'."
    });
  }

  try {
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { applicationId: id }] }
      : { applicationId: id };

    const application = await Application.findOneAndUpdate(
      query,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    return res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error.message);
    return res.status(500).json({ message: 'Unable to update application status.' });
  }
}

module.exports = {
  createApplication,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus
};
