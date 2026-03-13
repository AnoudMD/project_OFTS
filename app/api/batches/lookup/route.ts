/**
 * GET /api/batches/lookup?code=OT-2025-001234
 * Public endpoint — no auth required.
 * Used by consumers to look up a batch by scanning/entering a QR code.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BatchModel } from '@/lib/models/Batch';
import { ScanRecordModel } from '@/lib/models/ScanRecord';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code')?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: 'Query param "code" is required.' }, { status: 400 });
  }

  try {
    await connectDB();

    const batch = await BatchModel.findOne({ batchId: code }).lean();

    if (!batch) {
      return NextResponse.json(
        { error: `No product found for batch code "${code}". Please verify the QR code.` },
        { status: 404 }
      );
    }

    // Save anonymous scan record
    try {
      await ScanRecordModel.create({
        batchId: batch.batchId,
        productName: batch.productName,
        farmName: batch.farmName,
        certificationStatus: batch.certificationStatus,
        ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
      });
    } catch {
      // Non-fatal: scan record save failure should not break the lookup
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b = batch as any;
    return NextResponse.json({
      batch: {
        id: String(b._id),
        batchId: b.batchId,
        productName: b.productName,
        farmName: b.farmName,
        producerName: b.producerName,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        certificationDocuments: (b.certificationDocuments ?? []).map((d: any) => ({
          id: String(d._id),
          name: d.name,
          type: d.type,
          size: d.size,
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
      },
    });
  } catch (err) {
    console.error('[api/batches/lookup]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
