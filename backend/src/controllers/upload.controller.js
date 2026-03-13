const path = require('path');
const Batch = require('../models/Batch');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/uploads/certification   (producer only)
// ─────────────────────────────────────────────────────────────────────────────
async function uploadCertification(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { batchId } = req.body;
    const ext = path.extname(req.file.originalname).toLowerCase().slice(1).toUpperCase();
    const sizeKb = Math.round(req.file.size / 1024);
    const sizeStr = sizeKb > 1024
      ? `${(sizeKb / 1024).toFixed(1)} MB`
      : `${sizeKb} KB`;

    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = {
      name: req.file.originalname,
      type: ['PDF', 'PNG', 'JPG', 'JPEG'].includes(ext) ? ext : 'PDF',
      size: sizeStr,
      url: fileUrl,
      uploadedAt: new Date(),
    };

    // Attach to batch if batchId is provided
    if (batchId) {
      const batch = await Batch.findOne({ batchId: batchId.toUpperCase() });
      if (batch) {
        // Only the producer who owns this batch can upload docs
        if (batch.createdBy.toString() !== req.user._id.toString()) {
          return res.status(403).json({ error: 'You do not own this batch.' });
        }
        batch.certificationDocuments.push(doc);
        await batch.save();
      }
    }

    res.status(201).json({
      file: {
        name: doc.name,
        type: doc.type,
        size: doc.size,
        url: fileUrl,
        uploadedAt: doc.uploadedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/uploads/generic   — general-purpose upload (returns file URL)
// ─────────────────────────────────────────────────────────────────────────────
async function uploadGeneric(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const sizeKb = Math.round(req.file.size / 1024);
    const sizeStr = sizeKb > 1024
      ? `${(sizeKb / 1024).toFixed(1)} MB`
      : `${sizeKb} KB`;

    res.status(201).json({
      file: {
        name: req.file.originalname,
        filename: req.file.filename,
        size: sizeStr,
        mimetype: req.file.mimetype,
        url: fileUrl,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadCertification, uploadGeneric };
