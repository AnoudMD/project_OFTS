const Batch = require('../models/Batch');
const SupplyChainEvent = require('../models/SupplyChainEvent');
const Certification = require('../models/Certification');

// ── Helper: generate unique batch code ───────────────────────────────────────
function generateBatchCode() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 900000) + 100000); // 6-digit
  return `OT-${year}-${num}`;
}

// ── Helper: attach events to batch JSON ──────────────────────────────────────
async function withEvents(batchDoc) {
  const events = await SupplyChainEvent.find({ batchId: batchDoc.batchId })
    .sort({ timestamp: 1 })
    .lean();

  const batch = batchDoc.toJSON ? batchDoc.toJSON() : batchDoc;
  batch.events = events.map((e) => ({
    id: e._id.toString(),
    batchId: e.batchId,
    eventType: e.eventType,
    location: e.location,
    timestamp: e.timestamp,
    notes: e.notes || '',
    actorRole: e.actorRole,
    actorName: e.actorName || '',
  }));
  return batch;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/batches   (producer only)
// ─────────────────────────────────────────────────────────────────────────────
async function createBatch(req, res, next) {
  try {
    const {
      productName, farmName, category, origin,
      productionDate, expiryDate, quantity, notes,
    } = req.body;

    if (!productName || !farmName || !productionDate || !expiryDate) {
      return res.status(400).json({
        error: 'productName, farmName, productionDate, and expiryDate are required.',
      });
    }

    // Ensure unique batchId
    let batchId;
    let attempts = 0;
    do {
      batchId = generateBatchCode();
      attempts++;
    } while (attempts < 10 && (await Batch.exists({ batchId })));

    const batch = await Batch.create({
      batchId,
      productName: productName.trim(),
      farmName: farmName.trim(),
      category: category || 'Other',
      origin: origin?.trim() || '',
      productionDate: new Date(productionDate),
      expiryDate: new Date(expiryDate),
      quantity: quantity?.trim() || '',
      notes: notes?.trim() || '',
      certificationStatus: 'Pending',
      certificationDocuments: [],
      createdBy: req.user._id,
      producerName: req.user.name,
    });

    // Create a corresponding Certification record
    await Certification.create({
      batch: batch._id,
      batchId: batch.batchId,
      status: 'Pending',
    });

    const result = await withEvents(batch);
    res.status(201).json({ batch: result });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/batches
// ─────────────────────────────────────────────────────────────────────────────
async function listBatches(req, res, next) {
  try {
    const {
      search = '',
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      mine,
    } = req.query;

    const filter = {};

    // Producers see only their own batches (unless admin)
    if (req.user.role === 'producer' || mine === 'true') {
      filter.createdBy = req.user._id;
    }

    if (status && status !== 'All') {
      filter.certificationStatus = status;
    }

    if (startDate || endDate) {
      filter.productionDate = {};
      if (startDate) filter.productionDate.$gte = new Date(startDate);
      if (endDate)   filter.productionDate.$lte = new Date(endDate);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [batches, total] = await Promise.all([
      Batch.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Batch.countDocuments(filter),
    ]);

    // Attach events to each batch
    const batchesWithEvents = await Promise.all(
      batches.map(async (b) => {
        const events = await SupplyChainEvent.find({ batchId: b.batchId })
          .sort({ timestamp: 1 })
          .lean();
        return {
          ...b,
          id: b._id.toString(),
          producerId: b.createdBy?.toString() || '',
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
        };
      })
    );

    res.json({
      batches: batchesWithEvents,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/batches/code/:batchCode   (public)
// ─────────────────────────────────────────────────────────────────────────────
async function getBatchByCode(req, res, next) {
  try {
    const { batchCode } = req.params;
    const batch = await Batch.findOne({ batchId: batchCode.toUpperCase() });
    if (!batch) {
      return res.status(404).json({ error: `No batch found with code ${batchCode}.` });
    }
    const result = await withEvents(batch);
    res.json({ batch: result });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/batches/:id
// ─────────────────────────────────────────────────────────────────────────────
async function getBatch(req, res, next) {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }
    const result = await withEvents(batch);
    res.json({ batch: result });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/batches/:id   (producer can update own batch)
// ─────────────────────────────────────────────────────────────────────────────
async function updateBatch(req, res, next) {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    // Only the creator or certifier can update
    const isOwner = batch.createdBy.toString() === req.user._id.toString();
    const isCertifier = req.user.role === 'certifier';
    if (!isOwner && !isCertifier) {
      return res.status(403).json({ error: 'You do not have permission to update this batch.' });
    }

    const allowed = ['productName', 'farmName', 'category', 'origin', 'quantity', 'notes',
                     'productionDate', 'expiryDate'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) batch[field] = req.body[field];
    });

    await batch.save();
    const result = await withEvents(batch);
    res.json({ batch: result });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/batches/:id/certify   (certifier only)
// ─────────────────────────────────────────────────────────────────────────────
async function certifyBatch(req, res, next) {
  try {
    const { decision, notes = '' } = req.body;
    const VALID = ['Approved', 'Certified', 'Rejected', 'Under Review'];

    if (!VALID.includes(decision)) {
      return res.status(400).json({ error: `Invalid decision. Must be one of: ${VALID.join(', ')}` });
    }

    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    batch.certificationStatus = decision;
    batch.certifierNotes = notes.trim();
    batch.reviewedAt = new Date();
    batch.reviewedBy = req.user._id;
    await batch.save();

    // Update Certification document
    await Certification.findOneAndUpdate(
      { batch: batch._id },
      {
        $set: { status: decision, certifier: req.user._id, remarks: notes.trim() },
        $push: {
          history: {
            status: decision,
            remarks: notes.trim(),
            changedBy: req.user._id,
            changedByName: req.user.name,
            changedAt: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      batch: {
        id: batch._id.toString(),
        batchId: batch.batchId,
        certificationStatus: batch.certificationStatus,
        certifierNotes: batch.certifierNotes,
        reviewedAt: batch.reviewedAt,
        reviewedBy: req.user.name,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBatch,
  listBatches,
  getBatch,
  getBatchByCode,
  updateBatch,
  certifyBatch,
};
