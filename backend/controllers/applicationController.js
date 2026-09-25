const crypto = require('crypto');
const { getAddress } = require('ethers');
const mongoose = require('mongoose');
const Application = require('../models/ApplicationModel');
const Scholarship = require('../models/ScholarshipModel');

async function createApplication(req, res) {
  let resolvedName = '';
  let resolvedStudentId = '';
  try {
    const {
      scholarshipId,
      studentName,
      onChainId,
      txHash,
      scholarshipOnChainId
    } = req.body;

    const studentAddress = req.body.studentAddress || req.user?.walletAddress;
    resolvedName = (studentName && studentName.trim()) || req.user?.name || '';
    resolvedStudentId = (req.body.studentId && req.body.studentId.trim()) || req.user?.studentId || '';

    if (!scholarshipId || !studentAddress || !resolvedName) {
      return res.status(400).json({
        message: 'scholarshipId, studentAddress and studentName are required.'
      });
    }

    if (req.user) {
      let userUpdated = false;
      if ((!req.user.name || !req.user.name.trim()) && resolvedName) {
        req.user.name = resolvedName;
        userUpdated = true;
      }
      if ((!req.user.studentId || !req.user.studentId.trim()) && resolvedStudentId) {
        req.user.studentId = resolvedStudentId;
        userUpdated = true;
      }
      if (userUpdated) req.user.save().catch(() => {});
    }

    let normalizedStudentAddress;
    try {
      normalizedStudentAddress = getAddress(studentAddress);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid Ethereum wallet address.' });
    }

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && normalizedStudentAddress.toLowerCase() !== (req.user?.walletAddress || '').toLowerCase()) {
      return res.status(403).json({
        message: 'studentAddress must match the authenticated wallet.'
      });
    }
    
    // Find scholarship by scholarshipId, onChainId, or scholarshipOnChainId
    const targetOnChainId = Number(scholarshipOnChainId) || Number(scholarshipId) || null;
    let scholarship = await Scholarship.findOne({
      $or: [
        { scholarshipId },
        ...(targetOnChainId ? [{ onChainId: targetOnChainId }] : [])
      ]
    });

    if (!scholarship) {
      scholarship = await Scholarship.create({
        scholarshipId: targetOnChainId ? `SCH-CHAIN-${targetOnChainId}` : scholarshipId,
        title: targetOnChainId ? `Học bổng On-Chain #${targetOnChainId}` : scholarshipId,
        totalBudget: 1,
        remainingBudget: 1,
        rewardAmount: 0.0001,
        deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        isActive: true,
        onChainId: targetOnChainId
      });
    }

    const canonicalScholarshipId = scholarship.scholarshipId;

    // Check duplicate application before proceeding (case-insensitive)
    const existingApplication = await Application.findOne({
      $or: [
        {
          scholarshipId: canonicalScholarshipId,
          studentAddress: { $regex: new RegExp(`^${normalizedStudentAddress}$`, 'i') }
        },
        ...(onChainId ? [{ onChainId: Number(onChainId) }] : [])
      ]
    });

    if (existingApplication) {
      if (onChainId) existingApplication.onChainId = Number(onChainId);
      if (txHash) existingApplication.txHash = txHash;
      if (resolvedName) existingApplication.studentName = resolvedName;
      if (resolvedStudentId) existingApplication.studentId = resolvedStudentId;
      if (req.body.status) existingApplication.status = req.body.status;
      if (req.body.isDisbursed !== undefined) existingApplication.isDisbursed = Boolean(req.body.isDisbursed);
      await existingApplication.save();
      return res.status(200).json(existingApplication);
    }

    const grantAmount = scholarship.rewardAmount || 0.0001;

    let appStatus = 'pending';
    let isDisbursed = false;
    if (req.body.status === 'approved') appStatus = 'approved';
    else if (req.body.status === 'rejected') appStatus = 'rejected';
    if (req.body.isDisbursed) isDisbursed = true;

    const application = await Application.create({
      applicationId: crypto.randomUUID(),
      scholarshipId: canonicalScholarshipId,
      studentAddress: normalizedStudentAddress,
      studentName: resolvedName,
      studentId: resolvedStudentId,
      grantAmount,
      status: appStatus,
      isDisbursed,
      onChainId: (onChainId !== undefined && onChainId !== null && onChainId !== '') ? Number(onChainId) : null,
      txHash: txHash || ''
    });

    return res.status(201).json(application);
  } catch (error) {
    if (error.code === 11000) {
      const fallbackAddress = req.body.studentAddress || req.user?.walletAddress || '';
      const existing = await Application.findOne({
        $or: [
          {
            scholarshipId: req.body.scholarshipId,
            studentAddress: { $regex: new RegExp(`^${fallbackAddress}$`, 'i') }
          },
          ...(req.body.onChainId ? [{ onChainId: Number(req.body.onChainId) }] : [])
        ]
      });
      if (existing) {
        if (req.body.onChainId) existing.onChainId = Number(req.body.onChainId);
        if (req.body.txHash) existing.txHash = req.body.txHash;
        if (req.body.studentName) existing.studentName = req.body.studentName;
        if (resolvedStudentId) existing.studentId = resolvedStudentId;
        if (req.body.status) existing.status = req.body.status;
        if (req.body.isDisbursed !== undefined) existing.isDisbursed = Boolean(req.body.isDisbursed);
        await existing.save();
        return res.status(200).json(existing);
      }
      return res.status(200).json({ message: 'Hồ sơ đã được lưu.' });
    }

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
  const { status, isDisbursed, disburseTxHash } = req.body;

  if (status && !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      message: "status must be either 'approved' or 'rejected'."
    });
  }

  try {
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { applicationId: id }] }
      : { applicationId: id };

    const application = await Application.findOne(query);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const scholarship = await Scholarship.findOne({
      scholarshipId: application.scholarshipId
    });

    if (!scholarship) {
      return res.status(404).json({ message: 'Associated scholarship not found.' });
    }

    const grantAmount = application.grantAmount || scholarship.rewardAmount || 1;

    // 1. Xử lý GIẢI NGÂN (disburse): ĐÂY MỚI LÀ THỜI ĐIỂM TRỪ NGÂN SÁCH THỰC TẾ
    if (isDisbursed && !application.isDisbursed) {
      const updatedScholarship = await Scholarship.findOneAndUpdate(
        {
          scholarshipId: application.scholarshipId,
          remainingBudget: { $gte: grantAmount }
        },
        {
          $inc: { remainingBudget: -grantAmount }
        },
        { new: true }
      );

      if (!updatedScholarship) {
        return res.status(400).json({
          message: `Ngân sách còn lại (${scholarship.remainingBudget} ETH) không đủ để giải ngân suất học bổng này (${grantAmount} ETH).`
        });
      }

      application.isDisbursed = true;
      application.status = 'approved';
      if (disburseTxHash) application.disburseTxHash = disburseTxHash;
    }

    // 2. Xử lý DUYỆT / TỪ CHỐI (review): CHỈ ĐỔI TRẠNG THÁI HỒ SƠ, KHÔNG TRỪ TIỀN
    if (status && application.status !== status) {
      if (status === 'approved') {
        // Chỉ kiểm tra xem ngân sách còn đủ không, KHÔNG trừ tiền (chờ đến khi giải ngân mới trừ)
        if (scholarship.remainingBudget < grantAmount) {
          return res.status(400).json({
            message: `Ngân sách còn lại (${scholarship.remainingBudget} ETH) không đủ để duyệt hồ sơ này (${grantAmount} ETH).`
          });
        }
        application.status = 'approved';
        application.grantAmount = grantAmount;
      } else if (status === 'rejected') {
        // Không cho phép từ chối nếu tiền đã giải ngân xong
        if (application.isDisbursed) {
          return res.status(400).json({
            message: 'Hồ sơ này đã giải ngân ETH thành công đến ví sinh viên, không thể từ chối.'
          });
        }
        application.status = 'rejected';
      }
    }

    await application.save();
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
