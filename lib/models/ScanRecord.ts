/**
 * lib/models/ScanRecord.ts
 * Tracks every time a consumer scans or looks up a product batch.
 */

import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IScanRecord extends Document {
  batchId:   string;
  scannedAt: Date;
  productName: string;
  farmName:  string;
  certificationStatus: string;
  /** null for anonymous (consumer) scans */
  scannedBy?: mongoose.Types.ObjectId | string;
  ipAddress?: string;
  createdAt: Date;
}

const ScanRecordSchema = new Schema<IScanRecord>(
  {
    batchId:    { type: String, required: true, index: true },
    scannedAt:  { type: Date, default: Date.now },
    productName:{ type: String, required: true },
    farmName:   { type: String, required: true },
    certificationStatus: { type: String, required: true },
    scannedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
    ipAddress:  { type: String },
  },
  { timestamps: true }
);

export const ScanRecordModel: Model<IScanRecord> =
  (mongoose.models.ScanRecord as Model<IScanRecord>) ||
  mongoose.model<IScanRecord>('ScanRecord', ScanRecordSchema);
