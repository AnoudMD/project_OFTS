const mongoose = require('mongoose');

const CERTIFICATION_STATUSES = ['Pending', 'Under Review', 'Approved', 'Certified', 'Rejected'];

/**
 * ScanHistory — records every time a consumer scans or looks up a batch.
 * If the user is authenticated the scannedBy field is populated;
 * anonymous scans are allowed and have scannedBy = null.
 */
const scanHistorySchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },

    // Denormalized for display without populate
    batchId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    productName: {
      type: String,
      trim: true,
      default: '',
    },

    farmName: {
      type: String,
      trim: true,
      default: '',
    },

    certificationStatus: {
      type: String,
      enum: { values: CERTIFICATION_STATUSES, message: 'Invalid status: {VALUE}' },
      default: 'Pending',
    },

    // null for anonymous / consumer scans without login
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    scannedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Most recent scans first by default
scanHistorySchema.index({ scannedAt: -1 });

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
