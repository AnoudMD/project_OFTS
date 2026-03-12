const express = require('express');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');
const Batch = require('../models/Batch');
const SupplyChainEvent = require('../models/SupplyChainEvent');

const router = express.Router();

router.post('/', auth, allowRoles('Producer', 'Distributor', 'Retailer'), async (req, res) => {
  try {
    const { batchId, eventType, location, eventDateTime, notes } = req.body;

    const batch = await Batch.findOne({ batchId });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    if (batch.status !== 'Approved') {
      return res.status(400).json({ message: 'Only approved batches can receive supply-chain events' });
    }

    const event = await SupplyChainEvent.create({
      batch: batch._id,
      eventType,
      location,
      eventDateTime,
      notes,
      createdBy: req.user._id,
      role: req.user.role,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
