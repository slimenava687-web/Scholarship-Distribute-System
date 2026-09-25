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
    status: {
      type: String,
      required: true,
      default: 'pending',
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
