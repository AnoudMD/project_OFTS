const express = require('express');
const Batch = require('../models/Batch');
const SupplyChainEvent = require('../models/SupplyChainEvent');

const router = express.Router();

router.get('/:batchId', async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId })
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role');

    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const events = await SupplyChainEvent.find({ batch: batch._id })
      .populate('createdBy', 'name role')
      .sort({ eventDateTime: 1 });

    res.json({ batch, events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
