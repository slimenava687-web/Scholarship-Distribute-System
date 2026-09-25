const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    scholarshipId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 0
    },
    remainingBudget: {
      type: Number,
      required: true,
      min: 0
    },
    rewardAmount: {
      type: Number,
      required: true,
      default: 1,
      min: 0
    },
    deadline: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    onChainId: {
      type: Number,
      default: null
    },
    txHash: {
      type: String,
      default: '',
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scholarship', scholarshipSchema);
