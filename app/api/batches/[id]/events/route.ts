/**
 * GET  /api/batches/[id]/events  — Get all supply chain events for a batch
 * POST /api/batches/[id]/events  — Add a new supply chain event (producer/certifier/distributor/retailer)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BatchModel } from '@/lib/models/Batch';
import { withAuth } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';
import mongoose from 'mongoose';

const ALLOWED_ROLES = ['producer', 'certifier', 'distributor', 'retailer'];
const VALID_EVENT_TYPES = ['Harvest', 'Processing', 'Quality Check', 'Packaging', 'Shipment', 'Distribution'];

// ── GET /api/batches/[id]/events ──────────────────────────────────────────────

async function getEvents(
  _req: NextRequest,
  _user: JWTPayload,
  params?: Record<string, string>
): Promise<NextResponse> {
  await connectDB();

  const id = params?.id ?? '';
  const isObjectId = mongoose.isValidObjectId(id);

  const batch = isObjectId
    ? await BatchModel.findById(id).select('batchId events').lean()
    : await BatchModel.findOne({ batchId: id.toUpperCase() }).select('batchId events').lean();

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found.' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events = (batch.events ?? []).map((e: any) => ({
    id: String(e._id),
    batchId: batch.batchId,
    eventType: e.eventType,
    location: e.location,
    timestamp: e.timestamp?.toISOString?.() ?? e.timestamp,
    notes: e.notes,
    actorRole: e.actorRole,
    actorName: e.actorName,
  }));

  return NextResponse.json({ events });
}

// ── POST /api/batches/[id]/events ─────────────────────────────────────────────

async function addEvent(
  req: NextRequest,
  user: JWTPayload,
  params?: Record<string, string>
): Promise<NextResponse> {
  if (!ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Only supply chain participants can add events.' }, { status: 403 });
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

  const body = await req.json();
  const { eventType, location, timestamp, notes } = body as Record<string, string>;

  // Validation
  if (!VALID_EVENT_TYPES.includes(eventType))
    return NextResponse.json({ error: 'Invalid event type.' }, { status: 400 });
  if (!location?.trim())
    return NextResponse.json({ error: 'Location is required.' }, { status: 400 });
  if (!timestamp)
    return NextResponse.json({ error: 'Timestamp is required.' }, { status: 400 });

  const newEvent = {
    eventType,
    location: location.trim(),
    timestamp: new Date(timestamp),
    notes: notes?.trim() || undefined,
    actorRole: user.role,
    actorName: user.name,
  };

  batch.events.push(newEvent as never);
  await batch.save();

  // Return the newly created event (last in array)
  const saved = batch.events[batch.events.length - 1] as unknown as Record<string, unknown>;
  return NextResponse.json({
    event: {
      id: String((saved as { _id: unknown })._id),
      batchId: batch.batchId,
      eventType: saved.eventType,
      location: saved.location,
      timestamp: (saved.timestamp as Date)?.toISOString?.(),
      notes: saved.notes,
      actorRole: saved.actorRole,
      actorName: saved.actorName,
    },
  }, { status: 201 });
}

export const GET  = withAuth(getEvents);
export const POST = withAuth(addEvent);
