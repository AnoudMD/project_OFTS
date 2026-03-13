const mongoose = require('mongoose');

const EVENT_TYPES = [
  'Harvest',
  'Processing',
  'Quality Check',
  'Packaging',
  'Shipment',
  'Distribution',
];

const ACTOR_ROLES = ['producer', 'certifier', 'distributor', 'retailer', 'consumer'];

const supplyChainEventSchema = new mongoose.Schema(
  {
    // References the Batch by its _id (ObjectId)
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },

    // Denormalized batchId string (e.g. "OT-2025-001234") for quick lookup
    batchId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    eventType: {
      type: String,
      enum: { values: EVENT_TYPES, message: 'Invalid event type: {VALUE}' },
      required: [true, 'Event type is required'],
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      default: '',
    },

    actorRole: {
      type: String,
      enum: { values: ACTOR_ROLES, message: 'Invalid actor role: {VALUE}' },
      required: true,
    },

    // Ref to the User who added this event
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Denormalized actor name for quick display
    actorName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        if (ret.actor && typeof ret.actor === 'object') {
          ret.actorId = ret.actor._id?.toString() || ret.actor.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Sort by timestamp ascending by default (oldest event first = correct trace order)
supplyChainEventSchema.index({ batchId: 1, timestamp: 1 });

module.exports = mongoose.model('SupplyChainEvent', supplyChainEventSchema);
