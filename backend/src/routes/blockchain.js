const express = require('express');
const router = express.Router();
const { blockchain } = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const BlockchainRecord = require('../models/BlockchainRecord');
const Transaction = require('../models/Transaction');
const crypto = require('crypto-js');

/**
 * GET /api/blockchain
 * Get the entire blockchain
 */
router.get('/', async (req, res) => {
  try {
    const chain = blockchain.getAllBlocks();
    res.json({
      success: true,
      length: chain.length,
      chain: chain,
      isValid: blockchain.isChainValid()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain/validate
 * Validate the blockchain
 */
router.get('/validate', async (req, res) => {
  try {
    const isValid = blockchain.isChainValid();
    res.json({
      success: true,
      isValid: isValid,
      message: isValid ? 'Blockchain is valid' : 'Blockchain is invalid'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain/block/:index
 * Get block by index
 */
router.get('/block/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const block = blockchain.getBlockByIndex(index);

    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      });
    }

    res.json({
      success: true,
      block: block
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain/block/hash/:hash
 * Get block by hash
 */
router.get('/block/hash/:hash', async (req, res) => {
  try {
    const block = blockchain.getBlockByHash(req.params.hash);

    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      });
    }

    res.json({
      success: true,
      block: block
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain/block
 * Create a new block with data
 */
router.post('/block', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Block data is required'
      });
    }

    const newBlock = await blockchain.createBlock(data);

    // Save to MongoDB
    await BlockchainRecord.create({
      blockIndex: newBlock.index,
      blockHash: newBlock.hash,
      previousHash: newBlock.previousHash,
      ipfsHash: newBlock.ipfsHash,
      data: newBlock.data,
      timestamp: newBlock.timestamp,
      nonce: newBlock.nonce,
      difficulty: blockchain.difficulty
    });

    res.status(201).json({
      success: true,
      message: 'Block created successfully',
      block: newBlock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain/transaction
 * Create a new transaction
 */
router.post('/transaction', async (req, res) => {
  try {
    const { from, to, amount, data } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({
        success: false,
        message: 'From, to, and amount are required'
      });
    }

    const transaction = {
      from,
      to,
      amount: parseFloat(amount),
      data,
      timestamp: Date.now()
    };

    // Generate transaction hash
    const transactionHash = crypto.SHA256(JSON.stringify(transaction)).toString();

    // Add to blockchain pending transactions
    blockchain.addTransaction(transaction);

    // Save to MongoDB
    const savedTransaction = await Transaction.create({
      ...transaction,
      transactionHash,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Transaction added to pending pool',
      transaction: savedTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain/mine
 * Mine pending transactions
 */
router.post('/mine', async (req, res) => {
  try {
    const { miningRewardAddress } = req.body;

    if (!miningRewardAddress) {
      return res.status(400).json({
        success: false,
        message: 'Mining reward address is required'
      });
    }

    const block = await blockchain.minePendingTransactions(miningRewardAddress);

    // Save block to MongoDB
    await BlockchainRecord.create({
      blockIndex: block.index,
      blockHash: block.hash,
      previousHash: block.previousHash,
      ipfsHash: block.ipfsHash,
      data: block.data,
      timestamp: block.timestamp,
      nonce: block.nonce,
      miner: miningRewardAddress,
      difficulty: blockchain.difficulty
    });

    // Update transactions status
    if (Array.isArray(block.data)) {
      for (const trans of block.data) {
        if (trans.from && trans.to) {
          const transHash = crypto.SHA256(JSON.stringify(trans)).toString();
          await Transaction.updateMany(
            { transactionHash: transHash },
            {
              status: 'confirmed',
              blockHash: block.hash,
              blockIndex: block.index
            }
          );
        }
      }
    }

    res.json({
      success: true,
      message: 'Block mined successfully',
      block: block
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain/balance/:address
 * Get balance of an address
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const balance = blockchain.getBalanceOfAddress(req.params.address);

    res.json({
      success: true,
      address: req.params.address,
      balance: balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain/transactions/pending
 * Get all pending transactions
 */
router.get('/transactions/pending', async (req, res) => {
  try {
    const pending = await Transaction.getPending();

    res.json({
      success: true,
      count: pending.length,
      transactions: pending
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain/transactions/:address
 * Get all transactions for an address
 */
router.get('/transactions/:address', async (req, res) => {
  try {
    const transactions = await Transaction.getByAddress(req.params.address);

    res.json({
      success: true,
      count: transactions.length,
      transactions: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain/ipfs/upload
 * Upload data to IPFS
 */
router.post('/ipfs/upload', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required'
      });
    }

    const ipfsHash = await ipfsService.uploadToIPFS(data);

    res.json({
      success: true,
      message: 'Data uploaded to IPFS',
      ipfsHash: ipfsHash,
      url: `https://ipfs.io/ipfs/${ipfsHash}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain/ipfs/:cid
 * Retrieve data from IPFS
 */
router.get('/ipfs/:cid', async (req, res) => {
  try {
    const data = await ipfsService.getFromIPFS(req.params.cid);

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain/ipfs/pin/:cid
 * Pin content on IPFS
 */
router.post('/ipfs/pin/:cid', async (req, res) => {
  try {
    await ipfsService.pinContent(req.params.cid);

    res.json({
      success: true,
      message: 'Content pinned successfully',
      cid: req.params.cid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain/backup
 * Backup entire blockchain to IPFS
 */
router.post('/backup', async (req, res) => {
  try {
    const ipfsHash = await blockchain.storeBlockchainToIPFS();

    res.json({
      success: true,
      message: 'Blockchain backed up to IPFS',
      ipfsHash: ipfsHash,
      url: `https://ipfs.io/ipfs/${ipfsHash}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain/restore
 * Restore blockchain from IPFS
 */
router.post('/restore', async (req, res) => {
  try {
    const { ipfsHash } = req.body;

    if (!ipfsHash) {
      return res.status(400).json({
        success: false,
        message: 'IPFS hash is required'
      });
    }

    await blockchain.loadBlockchainFromIPFS(ipfsHash);

    res.json({
      success: true,
      message: 'Blockchain restored from IPFS',
      chain: blockchain.getAllBlocks()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain/stats
 * Get blockchain statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const chain = blockchain.getAllBlocks();
    const totalBlocks = chain.length;
    const pendingTransactions = blockchain.pendingTransactions.length;

    // Calculate total transactions
    let totalTransactions = 0;
    for (const block of chain) {
      if (Array.isArray(block.data)) {
        totalTransactions += block.data.length;
      }
    }

    const dbBlocks = await BlockchainRecord.countDocuments();
    const dbTransactions = await Transaction.countDocuments();
    const confirmedTransactions = await Transaction.countDocuments({ status: 'confirmed' });

    res.json({
      success: true,
      stats: {
        totalBlocks,
        totalTransactions,
        pendingTransactions,
        difficulty: blockchain.difficulty,
        miningReward: blockchain.miningReward,
        isValid: blockchain.isChainValid(),
        database: {
          blocks: dbBlocks,
          transactions: dbTransactions,
          confirmedTransactions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
