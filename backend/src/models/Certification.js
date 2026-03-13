const mongoose = require('mongoose');

const CERT_STATUSES = ['Pending', 'Under Review', 'Approved', 'Certified', 'Rejected'];

/**
 * Certification record — one per batch, tracks the review lifecycle.
 * The Batch document also caches certificationStatus for quick queries,
 * but this model stores the full audit trail (remarks history, timestamps).
 */
const certificationSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },

    // Denormalized batchId string for quick lookups
    batchId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    certifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    status: {
      type: String,
      enum: { values: CERT_STATUSES, message: 'Invalid status: {VALUE}' },
      default: 'Pending',
    },

    remarks: {
      type: String,
      trim: true,
      default: '',
    },

    // Full audit trail of status changes
    history: [
      {
        status: { type: String, enum: CERT_STATUSES },
        remarks: { type: String, default: '' },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedByName: { type: String, default: '' },
        changedAt: { type: Date, default: Date.now },
      },
    ],
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

// Ensure one certification record per batch
certificationSchema.index({ batch: 1 }, { unique: true });

module.exports = mongoose.model('Certification', certificationSchema);
