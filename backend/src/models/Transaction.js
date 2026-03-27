const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    index: true
  },
  to: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  blockHash: {
    type: String,
    index: true
  },
  blockIndex: {
    type: Number,
    index: true
  },
  ipfsHash: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    unique: true,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ timestamp: -1 });
transactionSchema.index({ status: 1, timestamp: -1 });

// Virtual for transaction fee (example)
transactionSchema.virtual('fee').get(function() {
  return this.amount * 0.001; // 0.1% fee
});

// Method to mark transaction as confirmed
transactionSchema.methods.confirm = function(blockHash, blockIndex) {
  this.status = 'confirmed';
  this.blockHash = blockHash;
  this.blockIndex = blockIndex;
  return this.save();
};

// Method to mark transaction as failed
transactionSchema.methods.fail = function() {
  this.status = 'failed';
  return this.save();
};

// Static method to get pending transactions
transactionSchema.statics.getPending = function() {
  return this.find({ status: 'pending' }).sort({ timestamp: 1 });
};

// Static method to get transactions by address
transactionSchema.statics.getByAddress = function(address) {
  return this.find({
    $or: [{ from: address }, { to: address }]
  }).sort({ timestamp: -1 });
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
