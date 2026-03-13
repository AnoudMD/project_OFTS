/**
 * lib/models/Batch.ts
 * Mongoose model for Product Batches.
 * batchId is the human-readable QR code value (e.g. "OT-2025-001234").
 */

import mongoose, { Schema, type Document, type Model } from 'mongoose';

// ── Embedded sub-schemas ──────────────────────────────────────────────────────

const CertificationDocumentSchema = new Schema(
  {
    name:       { type: String, required: true },
    type:       { type: String, enum: ['PDF', 'PNG', 'JPG'], required: true },
    size:       { type: String },
    url:        { type: String },       // Blob/S3 URL if uploaded
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const SupplyChainEventSchema = new Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ['Harvest', 'Processing', 'Quality Check', 'Packaging', 'Shipment', 'Distribution'],
    },
    location:  { type: String, required: true },
    timestamp: { type: Date,   required: true },
    notes:     { type: String },
    actorRole: {
      type: String,
      required: true,
      enum: ['consumer', 'producer', 'certifier', 'distributor', 'retailer'],
    },
    actorName: { type: String, required: true },
  },
  { _id: true, timestamps: false }
);

// ── Batch document ─────────────────────────────────────────────────────────────

export interface IBatch extends Document {
  batchId:       string;
  productName:   string;
  farmName:      string;
  producerName:  string;
  producerId:    mongoose.Types.ObjectId | string;
  category:      string;
  origin:        string;
  productionDate: Date;
  expiryDate:    Date;
  quantity?:     string;
  notes?:        string;
  certificationStatus: 'Pending' | 'Under Review' | 'Approved' | 'Certified' | 'Rejected';
  certifierNotes?: string;
  reviewedAt?:   Date;
  reviewedBy?:   string;
  certificationDocuments: mongoose.Types.DocumentArray<mongoose.Document>;
  events:        mongoose.Types.DocumentArray<mongoose.Document>;
  createdAt:     Date;
  updatedAt:     Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    batchId:      { type: String, required: true, unique: true, index: true },
    productName:  { type: String, required: true, trim: true },
    farmName:     { type: String, required: true, trim: true },
    producerName: { type: String, required: true },
    producerId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category:     { type: String, required: true },
    origin:       { type: String, required: true },
    productionDate: { type: Date, required: true },
    expiryDate:   { type: Date, required: true },
    quantity:     { type: String },
    notes:        { type: String },
    certificationStatus: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Certified', 'Rejected'],
      default: 'Pending',
    },
    certifierNotes: { type: String },
    reviewedAt:     { type: Date },
    reviewedBy:     { type: String },
    certificationDocuments: { type: [CertificationDocumentSchema], default: [] },
    events:         { type: [SupplyChainEventSchema], default: [] },
  },
  { timestamps: true }
);

// Text index for search
BatchSchema.index({ productName: 'text', farmName: 'text', batchId: 'text' });

export const BatchModel: Model<IBatch> =
  (mongoose.models.Batch as Model<IBatch>) || mongoose.model<IBatch>('Batch', BatchSchema);
