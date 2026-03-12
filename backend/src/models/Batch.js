const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    originalName: String,
    fileName: String,
    filePath: String,
    mimeType: String,
  },
  { _id: false }
);

const batchSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    farmName: { type: String, required: true },
    productionDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    certificationStatus: {
      type: String,
      enum: ['Pending', 'Certified Organic', 'Rejected'],
      default: 'Pending',
    },
    certificationDocuments: [documentSchema],
    qrCodeUrl: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Batch', batchSchema);
