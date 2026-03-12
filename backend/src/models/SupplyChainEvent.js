const mongoose = require('mongoose');

const supplyChainEventSchema = new mongoose.Schema(
  {
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    eventType: {
      type: String,
      enum: ['Harvest', 'Processing', 'Quality Check', 'Packaging', 'Shipment', 'Distribution'],
      required: true,
    },
    location: { type: String, required: true },
    eventDateTime: { type: Date, required: true },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['Producer', 'Certifier', 'Distributor', 'Retailer'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupplyChainEvent', supplyChainEventSchema);
backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
