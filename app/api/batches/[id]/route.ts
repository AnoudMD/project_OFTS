/**
 * GET   /api/batches/[id]  — Get batch by MongoDB _id OR by batchId code
 * PATCH /api/batches/[id]  — Update batch (producer: own fields; certifier: status)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BatchModel } from '@/lib/models/Batch';
import { withAuth } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';
import mongoose from 'mongoose';

// ── GET /api/batches/[id] ─────────────────────────────────────────────────────

async function getBatch(
  _req: NextRequest,
  user: JWTPayload,
  params?: Record<string, string>
): Promise<NextResponse> {
  await connectDB();

  const id = params?.id ?? '';
  // Support both MongoDB ObjectId and batchId code (e.g. OT-2025-001234)
  const isObjectId = mongoose.isValidObjectId(id);

  const batch = isObjectId
    ? await BatchModel.findById(id).lean()
    : await BatchModel.findOne({ batchId: id.toUpperCase() }).lean();

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found.' }, { status: 404 });
  }

  return NextResponse.json({ batch: formatBatch(batch) });
}

// ── PATCH /api/batches/[id] ───────────────────────────────────────────────────

async function updateBatch(
  req: NextRequest,
  user: JWTPayload,
  params?: Record<string, string>
): Promise<NextResponse> {
  await connectDB();

  const id = params?.id ?? '';
  const isObjectId = mongoose.isValidObjectId(id);

  const batch = isObjectId
    ? await BatchModel.findById(id)
    : await BatchModel.findOne({ batchId: id.toUpperCase() });

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found.' }, { status: 404 });
  }

  const body = await req.json();

  if (user.role === 'producer') {
    // Producers can only update their own batches' non-status fields
    if (String(batch.producerId) !== user.sub) {
      return NextResponse.json({ error: 'You can only update your own batches.' }, { status: 403 });
    }
    const allowed = ['productName', 'farmName', 'notes', 'quantity'];
    for (const key of allowed) {
      if (body[key] !== undefined) (batch as Record<string, unknown>)[key] = body[key];
    }

  } else if (user.role === 'certifier') {
    // Certifiers can approve / reject
    const validStatuses = ['Approved', 'Certified', 'Rejected', 'Under Review'];
    if (body.certificationStatus && validStatuses.includes(body.certificationStatus)) {
      batch.certificationStatus = body.certificationStatus;
      batch.certifierNotes = body.certifierNotes ?? batch.certifierNotes;
      batch.reviewedAt = new Date();
      batch.reviewedBy = user.name;
    }
  } else {
    return NextResponse.json({ error: 'Forbidden — insufficient permissions.' }, { status: 403 });
  }

  await batch.save();
  return NextResponse.json({ batch: formatBatch(batch.toObject()) });
}

export const GET  = withAuth(getBatch);
export const PATCH = withAuth(updateBatch);

// ── Format helper ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatBatch(b: any) {
  return {
    id: String(b._id),
    batchId: b.batchId,
    productName: b.productName,
    farmName: b.farmName,
    producerName: b.producerName,
    producerId: String(b.producerId),
    category: b.category,
    origin: b.origin,
    productionDate: b.productionDate instanceof Date
      ? b.productionDate.toISOString().split('T')[0]
      : b.productionDate,
    expiryDate: b.expiryDate instanceof Date
      ? b.expiryDate.toISOString().split('T')[0]
      : b.expiryDate,
    quantity: b.quantity,
    notes: b.notes,
    certificationStatus: b.certificationStatus,
    certifierNotes: b.certifierNotes,
    reviewedAt: b.reviewedAt?.toISOString?.() ?? b.reviewedAt,
    reviewedBy: b.reviewedBy,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    certificationDocuments: (b.certificationDocuments ?? []).map((d: any) => ({
      id: String(d._id),
      name: d.name,
      type: d.type,
      size: d.size,
      url: d.url,
      uploadedAt: d.uploadedAt?.toISOString?.() ?? d.uploadedAt,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events: (b.events ?? []).map((e: any) => ({
      id: String(e._id),
      batchId: b.batchId,
      eventType: e.eventType,
      location: e.location,
      timestamp: e.timestamp?.toISOString?.() ?? e.timestamp,
      notes: e.notes,
      actorRole: e.actorRole,
      actorName: e.actorName,
    })),
    createdAt: b.createdAt?.toISOString?.() ?? b.createdAt,
  };
}
