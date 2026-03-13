const SupplyChainEvent = require('../models/SupplyChainEvent');
const Batch = require('../models/Batch');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/events   (producer, distributor, retailer, certifier)
// ─────────────────────────────────────────────────────────────────────────────
async function addEvent(req, res, next) {
  try {
    const { batchId, eventType, location, timestamp, notes } = req.body;

    if (!batchId || !eventType || !location) {
      return res.status(400).json({ error: 'batchId, eventType, and location are required.' });
    }

    // Verify batch exists
    const batch = await Batch.findOne({ batchId: batchId.toUpperCase() });
    if (!batch) {
      return res.status(404).json({ error: `Batch ${batchId} not found.` });
    }

    const event = await SupplyChainEvent.create({
      batch: batch._id,
      batchId: batch.batchId,
      eventType,
      location: location.trim(),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      notes: notes?.trim() || '',
      actorRole: req.user.role,
      actor: req.user._id,
      actorName: req.user.name,
    });

    res.status(201).json({
      event: {
        id: event._id.toString(),
        batchId: event.batchId,
        eventType: event.eventType,
        location: event.location,
        timestamp: event.timestamp,
        notes: event.notes,
        actorRole: event.actorRole,
        actorName: event.actorName,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events/:batchId
// ─────────────────────────────────────────────────────────────────────────────
async function getEvents(req, res, next) {
  try {
    const { batchId } = req.params;

    const events = await SupplyChainEvent.find({ batchId: batchId.toUpperCase() })
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      events: events.map((e) => ({
        id: e._id.toString(),
        batchId: e.batchId,
        eventType: e.eventType,
        location: e.location,
        timestamp: e.timestamp,
        notes: e.notes || '',
        actorRole: e.actorRole,
        actorName: e.actorName || '',
      })),
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/events/:id   (actor who created it, or producer)
// ─────────────────────────────────────────────────────────────────────────────
async function updateEvent(req, res, next) {
  try {
    const event = await SupplyChainEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Only the actor who created it can update
    if (event.actor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own events.' });
    }

    const allowed = ['eventType', 'location', 'timestamp', 'notes'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    await event.save();
    res.json({ event: event.toJSON() });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/events/:id
// ─────────────────────────────────────────────────────────────────────────────
async function deleteEvent(req, res, next) {
  try {
    const event = await SupplyChainEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (event.actor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own events.' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { addEvent, getEvents, updateEvent, deleteEvent };
