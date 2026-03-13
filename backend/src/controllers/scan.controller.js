const ScanHistory = require('../models/ScanHistory');
const Batch = require('../models/Batch');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/scans   — record a QR/manual scan
// ─────────────────────────────────────────────────────────────────────────────
async function recordScan(req, res, next) {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ error: 'batchId is required.' });
    }

    const batch = await Batch.findOne({ batchId: batchId.toUpperCase() });
    if (!batch) {
      return res.status(404).json({ error: `Batch ${batchId} not found.` });
    }

    const scan = await ScanHistory.create({
      batch: batch._id,
      batchId: batch.batchId,
      productName: batch.productName,
      farmName: batch.farmName,
      certificationStatus: batch.certificationStatus,
      scannedBy: req.user?._id || null,
      scannedAt: new Date(),
    });

    res.status(201).json({
      record: {
        id: scan._id.toString(),
        batchId: scan.batchId,
        productName: scan.productName,
        farmName: scan.farmName,
        certificationStatus: scan.certificationStatus,
        scannedAt: scan.scannedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scans/user/:userId   — get scan history for a user
// ─────────────────────────────────────────────────────────────────────────────
async function getUserScans(req, res, next) {
  try {
    const { userId } = req.params;

    // Users can only see their own scan history (unless admin)
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const scans = await ScanHistory.find({ scannedBy: userId })
      .sort({ scannedAt: -1 })
      .limit(50)
      .lean();

    res.json({
      scanHistory: scans.map((s) => ({
        id: s._id.toString(),
        batchId: s.batchId,
        productName: s.productName,
        farmName: s.farmName,
        certificationStatus: s.certificationStatus,
        scannedAt: s.scannedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scans/me   — shortcut for the logged-in user's scan history
// ─────────────────────────────────────────────────────────────────────────────
async function getMyScan(req, res, next) {
  try {
    const scans = await ScanHistory.find({ scannedBy: req.user._id })
      .sort({ scannedAt: -1 })
      .limit(50)
      .lean();

    res.json({
      scanHistory: scans.map((s) => ({
        id: s._id.toString(),
        batchId: s.batchId,
        productName: s.productName,
        farmName: s.farmName,
        certificationStatus: s.certificationStatus,
        scannedAt: s.scannedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { recordScan, getUserScans, getMyScan };
