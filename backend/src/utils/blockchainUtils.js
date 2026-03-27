const crypto = require('crypto-js');

/**
 * Generate a unique wallet address
 * @returns {string} Wallet address
 */
function generateWalletAddress() {
  const randomBytes = crypto.lib.WordArray.random(32);
  return '0x' + crypto.SHA256(randomBytes).toString().substring(0, 40);
}

/**
 * Hash data using SHA256
 * @param {any} data - Data to hash
 * @returns {string} Hash string
 */
function hashData(data) {
  return crypto.SHA256(JSON.stringify(data)).toString();
}

/**
 * Verify hash of data
 * @param {any} data - Original data
 * @param {string} hash - Hash to verify
 * @returns {boolean} True if hash matches
 */
function verifyHash(data, hash) {
  return hashData(data) === hash;
}

/**
 * Create a Merkle tree from transactions
 * @param {Array} transactions - Array of transactions
 * @returns {string} Merkle root
 */
function createMerkleRoot(transactions) {
  if (!transactions || transactions.length === 0) {
    return crypto.SHA256('').toString();
  }

  let hashes = transactions.map(tx => hashData(tx));

  while (hashes.length > 1) {
    const newHashes = [];

    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        newHashes.push(crypto.SHA256(hashes[i] + hashes[i + 1]).toString());
      } else {
        newHashes.push(hashes[i]);
      }
    }

    hashes = newHashes;
  }

  return hashes[0];
}

/**
 * Calculate difficulty target
 * @param {number} difficulty - Difficulty level
 * @returns {string} Target string
 */
function getDifficultyTarget(difficulty) {
  return '0'.repeat(difficulty);
}

/**
 * Validate proof of work
 * @param {string} hash - Block hash
 * @param {number} difficulty - Difficulty level
 * @returns {boolean} True if valid
 */
function validateProofOfWork(hash, difficulty) {
  const target = getDifficultyTarget(difficulty);
  return hash.substring(0, difficulty) === target;
}

/**
 * Sign data with private key (simplified)
 * @param {any} data - Data to sign
 * @param {string} privateKey - Private key
 * @returns {string} Signature
 */
function signData(data, privateKey) {
  const hash = hashData(data);
  return crypto.HmacSHA256(hash, privateKey).toString();
}

/**
 * Verify signature (simplified)
 * @param {any} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} publicKey - Public key
 * @returns {boolean} True if valid
 */
function verifySignature(data, signature, publicKey) {
  const hash = hashData(data);
  const expectedSignature = crypto.HmacSHA256(hash, publicKey).toString();
  return signature === expectedSignature;
}

/**
 * Format blockchain data for display
 * @param {Object} block - Block object
 * @returns {Object} Formatted block
 */
function formatBlock(block) {
  return {
    index: block.index,
    timestamp: new Date(block.timestamp).toISOString(),
    hash: block.hash,
    previousHash: block.previousHash,
    nonce: block.nonce,
    dataCount: Array.isArray(block.data) ? block.data.length : 1,
    ipfsHash: block.ipfsHash || 'N/A'
  };
}

/**
 * Calculate average block time
 * @param {Array} blocks - Array of blocks
 * @returns {number} Average time in milliseconds
 */
function calculateAverageBlockTime(blocks) {
  if (blocks.length < 2) return 0;

  let totalTime = 0;
  for (let i = 1; i < blocks.length; i++) {
    totalTime += blocks[i].timestamp - blocks[i - 1].timestamp;
  }

  return totalTime / (blocks.length - 1);
}

/**
 * Estimate transaction fee
 * @param {number} amount - Transaction amount
 * @param {number} feeRate - Fee rate (percentage)
 * @returns {number} Fee amount
 */
function calculateTransactionFee(amount, feeRate = 0.001) {
  return amount * feeRate;
}

/**
 * Validate transaction structure
 * @param {Object} transaction - Transaction object
 * @returns {Object} Validation result
 */
function validateTransaction(transaction) {
  const errors = [];

  if (!transaction.from) {
    errors.push('Missing sender address');
  }

  if (!transaction.to) {
    errors.push('Missing recipient address');
  }

  if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
    errors.push('Invalid transaction amount');
  }

  if (!transaction.timestamp) {
    errors.push('Missing timestamp');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Convert IPFS hash to HTTP URL
 * @param {string} ipfsHash - IPFS CID
 * @param {string} gateway - IPFS gateway (default: ipfs.io)
 * @returns {string} HTTP URL
 */
function ipfsToHTTP(ipfsHash, gateway = 'ipfs.io') {
  return `https://${gateway}/ipfs/${ipfsHash}`;
}

/**
 * Format bytes to human readable size
 * @param {number} bytes - Bytes
 * @returns {string} Formatted size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate block explorer URL
 * @param {string} hash - Block or transaction hash
 * @param {string} type - Type ('block' or 'transaction')
 * @returns {string} Explorer URL
 */
function getExplorerURL(hash, type = 'block') {
  // This would be your actual block explorer URL
  return `http://localhost:3000/explorer/${type}/${hash}`;
}

module.exports = {
  generateWalletAddress,
  hashData,
  verifyHash,
  createMerkleRoot,
  getDifficultyTarget,
  validateProofOfWork,
  signData,
  verifySignature,
  formatBlock,
  calculateAverageBlockTime,
  calculateTransactionFee,
  validateTransaction,
  ipfsToHTTP,
  formatBytes,
  getExplorerURL
};
