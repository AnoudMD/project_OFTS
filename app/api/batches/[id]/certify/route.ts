/**
 * POST /api/batches/[id]/certify
 * Certifier approves or rejects a batch certification.
 * Roles: certifier only
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BatchModel } from '@/lib/models/Batch';
import { withAuth } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';
import mongoose from 'mongoose';

const VALID_DECISIONS = ['Approved', 'Certified', 'Rejected', 'Under Review'] as const;
type Decision = (typeof VALID_DECISIONS)[number];

async function certifyBatch(
  req: NextRequest,
  user: JWTPayload,
  params?: Record<string, string>
): Promise<NextResponse> {
  if (user.role !== 'certifier') {
    return NextResponse.json({ error: 'Only certifiers can certify batches.' }, { status: 403 });
  }

  await connectDB();

  const id = params?.id ?? '';
  const isObjectId = mongoose.isValidObjectId(id);

  const batch = isObjectId
    ? await BatchModel.findById(id)
    : await BatchModel.findOne({ batchId: id.toUpperCase() });

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found.' }, { status: 404 });
  }

  const { decision, notes } = (await req.json()) as { decision: Decision; notes?: string };

  if (!VALID_DECISIONS.includes(decision)) {
    return NextResponse.json(
      { error: `Invalid decision. Must be one of: ${VALID_DECISIONS.join(', ')}` },
      { status: 400 }
    );
  }

  batch.certificationStatus = decision;
  batch.certifierNotes = notes?.trim() || batch.certifierNotes;
  batch.reviewedAt = new Date();
  batch.reviewedBy = user.name;

  // Add a Quality Check event automatically
  batch.events.push({
    eventType: 'Quality Check',
    location: user.organization || 'Certification Authority',
    timestamp: new Date(),
    notes: `Certification ${decision.toLowerCase()}. ${notes?.trim() ?? ''}`.trim(),
    actorRole: 'certifier',
    actorName: user.name,
  } as never);

  await batch.save();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const b = batch.toObject() as any;
  return NextResponse.json({
    batch: {
      id: String(b._id),
      batchId: b.batchId,
      certificationStatus: b.certificationStatus,
      certifierNotes: b.certifierNotes,
      reviewedAt: b.reviewedAt?.toISOString?.(),
      reviewedBy: b.reviewedBy,
    },
  });
}

export const POST = withAuth(certifyBatch);
