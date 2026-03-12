const mongoose = require('mongoose');

const supplyChainEventSchema = new mongoose.Schema(
{
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },

  eventType: {
    type: String,
    enum: ['Harvest','Processing','Quality Check','Packaging','Shipment','Distribution'],
    required: true
  },

  location: { type: String, required: true },

  eventDateTime: { type: Date, required: true },

  notes: { type: String, default: '' },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  role: {
    type: String,
    enum: ['Producer','Certifier','Distributor','Retailer'],
    required: true
  }

},
{ timestamps: true }
);

module.exports = mongoose.model('SupplyChainEvent', supplyChainEventSchema);