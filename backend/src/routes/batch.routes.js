const validateBatch = require('../middleware/validateBatch');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Batch = require('../models/Batch');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');
const upload = require('../middleware/upload');
const { generateBatchQr } = require('../utils/qr');

const router = express.Router();

router.post(
  '/',
  auth,
  allowRoles('Producer'),
  upload.array('documents', 5),
  validateBatch, 
  async (req, res) => {
    try {
      const { productName, farmName, productionDate, expiryDate, notes } = req.body;
      const batchId = `OFTS-${uuidv4().slice(0, 8).toUpperCase()}`;
      const qrPayload = `${process.env.BASE_URL}/api/trace/${batchId}`;
      const qrCodeUrl = await generateBatchQr(qrPayload);

      const documents = (req.files || []).map((file) => ({
        originalName: file.originalname,
        fileName: file.filename,
        filePath: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
      }));

      const batch = await Batch.create({
        batchId,
        productName,
        farmName,
        productionDate,
        expiryDate,
        notes,
        certificationDocuments: documents,
        qrCodeUrl,
        createdBy: req.user._id,
      });

      res.status(201).json(batch);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get('/', auth, async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/pending', auth, allowRoles('Certifier'), async (_req, res) => {
  try {
    const batches = await Batch.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:batchId/review', auth, allowRoles('Certifier'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const batch = await Batch.findOne({ batchId: req.params.batchId });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    if (status === 'Approved') {
      batch.status = 'Approved';
      batch.certificationStatus = 'Certified Organic';
      batch.approvedBy = req.user._id;
      batch.rejectionReason = '';
    } else if (status === 'Rejected') {
      batch.status = 'Rejected';
      batch.certificationStatus = 'Rejected';
      batch.approvedBy = req.user._id;
      batch.rejectionReason = rejectionReason || 'Rejected by certifier';
    } else {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await batch.save();
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/:batchId', auth, async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId })
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
