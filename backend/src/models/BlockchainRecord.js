const mongoose = require('mongoose');

const blockchainRecordSchema = new mongoose.Schema({
  blockIndex: {
    type: Number,
    required: true,
    unique: true
  },
  blockHash: {
    type: String,
    required: true,
    unique: true
  },
  previousHash: {
    type: String,
    required: true
  },
  ipfsHash: {
    type: String,
    required: true,
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  nonce: {
    type: Number,
    default: 0
  },
  miner: {
    type: String
  },
  difficulty: {
    type: Number,
    default: 2
  }
}, {
  timestamps: true
});

// Index for faster queries
blockchainRecordSchema.index({ timestamp: -1 });
blockchainRecordSchema.index({ blockIndex: 1 });

// Virtual for block age
blockchainRecordSchema.virtual('age').get(function() {
  return Date.now() - this.timestamp;
});

// Method to verify block integrity
blockchainRecordSchema.methods.verifyIntegrity = function(previousBlock) {
  if (previousBlock && this.previousHash !== previousBlock.blockHash) {
    return false;
  }
  return true;
};

const BlockchainRecord = mongoose.model('BlockchainRecord', blockchainRecordSchema);

module.exports = BlockchainRecord;
