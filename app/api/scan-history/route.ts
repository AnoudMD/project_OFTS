/**
 * GET  /api/scan-history  — Authenticated user's scan history
 * POST /api/scan-history  — Save a scan record (consumer/any role)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ScanRecordModel } from '@/lib/models/ScanRecord';
import { withAuth } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';

// ── GET /api/scan-history ─────────────────────────────────────────────────────

async function getScanHistory(
  req: NextRequest,
  user: JWTPayload
): Promise<NextResponse> {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50'));

  const records = await ScanRecordModel
    .find({ scannedBy: user.sub })
    .sort({ scannedAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scanHistory: records.map((r: any) => ({
      id: String(r._id),
      batchId: r.batchId,
      scannedAt: r.scannedAt?.toISOString?.() ?? r.scannedAt,
      productName: r.productName,
      farmName: r.farmName,
      certificationStatus: r.certificationStatus,
    })),
  });
}

// ── POST /api/scan-history ────────────────────────────────────────────────────

async function saveScanRecord(
  req: NextRequest,
  user: JWTPayload
): Promise<NextResponse> {
  await connectDB();

  const { batchId, productName, farmName, certificationStatus } =
    (await req.json()) as Record<string, string>;

  if (!batchId || !productName || !farmName || !certificationStatus) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const record = await ScanRecordModel.create({
    batchId,
    productName,
    farmName,
    certificationStatus,
    scannedBy: user.sub,
    scannedAt: new Date(),
  });

  return NextResponse.json({
    record: {
      id: String(record._id),
      batchId: record.batchId,
      scannedAt: record.scannedAt.toISOString(),
      productName: record.productName,
      farmName: record.farmName,
      certificationStatus: record.certificationStatus,
    },
  }, { status: 201 });
}

export const GET  = withAuth(getScanHistory);
export const POST = withAuth(saveScanRecord);
