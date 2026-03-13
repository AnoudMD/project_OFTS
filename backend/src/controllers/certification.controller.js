const Certification = require('../models/Certification');
const Batch = require('../models/Batch');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/certifications   — create or update certification record
// ─────────────────────────────────────────────────────────────────────────────
async function createCertification(req, res, next) {
  try {
    const { batchId, status = 'Under Review', remarks = '' } = req.body;

    if (!batchId) {
      return res.status(400).json({ error: 'batchId is required.' });
    }

    const batch = await Batch.findOne({ batchId: batchId.toUpperCase() });
    if (!batch) {
      return res.status(404).json({ error: `Batch ${batchId} not found.` });
    }

    const cert = await Certification.findOneAndUpdate(
      { batch: batch._id },
      {
        $set: {
          batchId: batch.batchId,
          status,
          remarks,
          certifier: req.user._id,
        },
        $push: {
          history: {
            status,
            remarks,
            changedBy: req.user._id,
            changedByName: req.user.name,
            changedAt: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    // Mirror status on the Batch document
    batch.certificationStatus = status;
    if (remarks) batch.certifierNotes = remarks;
    batch.reviewedBy = req.user._id;
    batch.reviewedAt = new Date();
    await batch.save();

    res.status(201).json({ certification: cert });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/certifications/:batchId
// ─────────────────────────────────────────────────────────────────────────────
async function getCertification(req, res, next) {
  try {
    const { batchId } = req.params;

    const cert = await Certification.findOne({ batchId: batchId.toUpperCase() })
      .populate('certifier', 'name email')
      .populate('history.changedBy', 'name');

    if (!cert) {
      return res.status(404).json({ error: `No certification record for batch ${batchId}.` });
    }

    res.json({ certification: cert });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/certifications/:id   (certifier only)
// ─────────────────────────────────────────────────────────────────────────────
async function updateCertification(req, res, next) {
  try {
    const { status, remarks = '' } = req.body;
    const VALID = ['Pending', 'Under Review', 'Approved', 'Certified', 'Rejected'];

    if (status && !VALID.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID.join(', ')}` });
    }

    const cert = await Certification.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ error: 'Certification not found.' });
    }

    if (status) cert.status = status;
    if (remarks) cert.remarks = remarks;
    cert.certifier = req.user._id;
    cert.history.push({
      status: cert.status,
      remarks,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedAt: new Date(),
    });

    await cert.save();

    // Mirror status on the Batch document
    await Batch.findOneAndUpdate(
      { batchId: cert.batchId },
      {
        certificationStatus: cert.status,
        certifierNotes: remarks,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      }
    );

    res.json({ certification: cert });
  } catch (err) {
    next(err);
  }
}

module.exports = { createCertification, getCertification, updateCertification };
