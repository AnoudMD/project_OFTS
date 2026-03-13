const mongoose = require('mongoose');

const CERTIFICATION_STATUSES = ['Pending', 'Under Review', 'Approved', 'Certified', 'Rejected'];
const CATEGORIES = ['Coffee', 'Tea', 'Grains', 'Spices', 'Oils', 'Fruits', 'Vegetables', 'Dairy', 'Cacao', 'Other'];

// ── Sub-schema: Certification Document ───────────────────────────────────────
const certDocSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['PDF', 'PNG', 'JPG', 'JPEG'], default: 'PDF' },
    size: { type: String, default: '' },
    url: { type: String, default: '' },       // Path to uploaded file
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ── Main Batch Schema ─────────────────────────────────────────────────────────
const batchSchema = new mongoose.Schema(
  {
    // Human-readable, QR-encodable batch code — e.g. OT-2025-001234
    batchId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
    },

    category: {
      type: String,
      enum: { values: CATEGORIES, message: 'Invalid category: {VALUE}' },
      default: 'Other',
    },

    origin: {
      type: String,
      trim: true,
      default: '',
    },

    productionDate: {
      type: Date,
      required: [true, 'Production date is required'],
    },

    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },

    quantity: {
      type: String,
      trim: true,
      default: '',
    },

    notes: {
      type: String,
      trim: true,
      default: '',
    },

    certificationStatus: {
      type: String,
      enum: { values: CERTIFICATION_STATUSES, message: 'Invalid status: {VALUE}' },
      default: 'Pending',
      index: true,
    },

    certifierNotes: {
      type: String,
      default: '',
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // Ref to the certifier User who reviewed
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    certificationDocuments: [certDocSchema],

    // Ref to the producer User who created this batch
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Denormalized for quick display without populating
    producerName: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        if (ret.createdBy && typeof ret.createdBy === 'object') {
          ret.producerId = ret.createdBy._id?.toString() || ret.createdBy.toString();
        } else {
          ret.producerId = ret.createdBy?.toString() || '';
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Virtual: supply-chain events (populated separately) ───────────────────────
// Events are stored in a separate collection for flexibility.
// Use batchSchema.virtual + populate when needed.

// ── Indexes ───────────────────────────────────────────────────────────────────
batchSchema.index({ productName: 'text', farmName: 'text', origin: 'text' });
batchSchema.index({ certificationStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Batch', batchSchema);
