const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    scholarshipId: {
      type: String,
      required: true,
      trim: true
    },
    studentAddress: {
      type: String,
      required: true,
      trim: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    studentId: {
      type: String,
      default: '',
      trim: true
    },
    grantAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      required: true,
      default: 'pending',
      trim: true
    },
    onChainId: {
      type: Number,
      default: null
    },
    txHash: {
      type: String,
      default: '',
      trim: true
    },
    isDisbursed: {
      type: Boolean,
      default: false
    },
    disburseTxHash: {
      type: String,
      default: '',
      trim: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate applications by the same student for the same scholarship
applicationSchema.index({ scholarshipId: 1, studentAddress: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
