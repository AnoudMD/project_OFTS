const { validateTransaction } = require('../utils/blockchainUtils');

/**
 * Middleware to validate blockchain transactions
 */
const validateBlockchainTransaction = (req, res, next) => {
  const { from, to, amount } = req.body;

  const transaction = { from, to, amount, timestamp: Date.now() };
  const validation = validateTransaction(transaction);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid transaction',
      errors: validation.errors
    });
  }

  next();
};

/**
 * Middleware to validate wallet address format
 */
const validateWalletAddress = (req, res, next) => {
  const address = req.params.address || req.body.address;

  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'Wallet address is required'
    });
  }

  // Basic validation for address format (0x followed by 40 hex characters)
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;

  if (!addressRegex.test(address)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid wallet address format'
    });
  }

  next();
};

/**
 * Middleware to check if IPFS is available
 */
const checkIPFSAvailability = async (req, res, next) => {
  try {
    const ipfsService = require('../services/ipfsService');
    const isOnline = await ipfsService.isOnline();

    if (!isOnline) {
      return res.status(503).json({
        success: false,
        message: 'IPFS service is not available'
      });
    }

    next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'Failed to connect to IPFS service',
      error: error.message
    });
  }
};

/**
 * Middleware to validate IPFS CID format
 */
const validateIPFSCID = (req, res, next) => {
  const cid = req.params.cid || req.body.ipfsHash;

  if (!cid) {
    return res.status(400).json({
      success: false,
      message: 'IPFS CID is required'
    });
  }

  // Basic CID validation (simplified)
  if (cid.length < 46) {
    return res.status(400).json({
      success: false,
      message: 'Invalid IPFS CID format'
    });
  }

  next();
};

/**
 * Middleware to rate limit mining operations
 */
const rateLimitMining = (() => {
  const miningAttempts = new Map();
  const MAX_ATTEMPTS = 5;
  const TIME_WINDOW = 60000; // 1 minute

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!miningAttempts.has(ip)) {
      miningAttempts.set(ip, []);
    }

    const attempts = miningAttempts.get(ip);
    const recentAttempts = attempts.filter(time => now - time < TIME_WINDOW);

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many mining attempts. Please try again later.'
      });
    }

    recentAttempts.push(now);
    miningAttempts.set(ip, recentAttempts);

    next();
  };
})();

module.exports = {
  validateBlockchainTransaction,
  validateWalletAddress,
  checkIPFSAvailability,
  validateIPFSCID,
  rateLimitMining
};
