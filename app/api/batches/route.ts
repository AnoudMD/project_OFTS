/**
 * GET  /api/batches  — List batches (filtered by status, search, role)
 * POST /api/batches  — Create a new product batch (producer only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BatchModel } from '@/lib/models/Batch';
import { withAuth } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';

// ── Batch ID generator ────────────────────────────────────────────────────────

function generateBatchId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `OT-${year}-${rand}`;
}

// ── GET /api/batches ──────────────────────────────────────────────────────────

async function getBatches(req: NextRequest, user: JWTPayload): Promise<NextResponse> {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const startDate = searchParams.get('startDate') ?? '';
  const endDate = searchParams.get('endDate') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));

  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  // Producers only see their own batches
  if (user.role === 'producer') {
    filter.producerId = user.sub;
  }

  if (status && status !== 'All') {
    filter.certificationStatus = status;
  }

  if (search) {
    filter.$or = [
      { batchId: { $regex: search, $options: 'i' } },
      { productName: { $regex: search, $options: 'i' } },
      { farmName: { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [batches, total] = await Promise.all([
    BatchModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BatchModel.countDocuments(filter),
  ]);

  return NextResponse.json({ batches: batches.map(formatBatch), total, page, limit });
}

// ── POST /api/batches ─────────────────────────────────────────────────────────

async function createBatch(req: NextRequest, user: JWTPayload): Promise<NextResponse> {
  if (user.role !== 'producer') {
    return NextResponse.json({ error: 'Only producers can create batches.' }, { status: 403 });
  }

  await connectDB();

  const body = await req.json();
  const {
    productName, farmName, category, origin,
    productionDate, expiryDate, quantity, notes,
    documentName, documentSize,
  } = body as Record<string, string>;

  // Validation
  if (!productName?.trim()) return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
  if (!farmName?.trim())    return NextResponse.json({ error: 'Farm name is required.' }, { status: 400 });
  if (!category)            return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
  if (!origin?.trim())      return NextResponse.json({ error: 'Origin is required.' }, { status: 400 });
  if (!productionDate)      return NextResponse.json({ error: 'Production date is required.' }, { status: 400 });
  if (!expiryDate)          return NextResponse.json({ error: 'Expiry date is required.' }, { status: 400 });

  const batchId = generateBatchId();

  const certDocs = documentName
    ? [{
        name: documentName,
        type: documentName.toLowerCase().endsWith('.pdf') ? 'PDF'
          : documentName.toLowerCase().endsWith('.jpg') ? 'JPG' : 'PNG',
        size: documentSize ?? undefined,
        uploadedAt: new Date(),
      }]
    : [];

  const initialEvent = {
    eventType: 'Harvest',
    location: farmName.trim(),
    timestamp: new Date(productionDate),
    notes: 'Initial batch creation and harvest record',
    actorRole: 'producer',
    actorName: user.name,
  };

  const batch = await BatchModel.create({
    batchId,
    productName: productName.trim(),
    farmName: farmName.trim(),
    producerName: user.name,
    producerId: user.sub,
    category,
    origin: origin.trim(),
    productionDate: new Date(productionDate),
    expiryDate: new Date(expiryDate),
    quantity: quantity?.trim() || undefined,
    notes: notes?.trim() || undefined,
    certificationStatus: 'Pending',
    certificationDocuments: certDocs,
    events: [initialEvent],
  });

  return NextResponse.json({ batch: formatBatch(batch.toObject()) }, { status: 201 });
}

export const GET = withAuth(getBatches);
export const POST = withAuth(createBatch);

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
    certificationDocuments: (b.certificationDocuments ?? []).map((d: any) => ({
      id: String(d._id),
      name: d.name,
      type: d.type,
      size: d.size,
      url: d.url,
      uploadedAt: d.uploadedAt?.toISOString?.() ?? d.uploadedAt,
    })),
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
