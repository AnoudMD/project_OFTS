const crypto = require('crypto-js');
const ipfsService = require('./ipfsService');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
    this.ipfsHash = null; // IPFS CID for block data
  }

  /**
   * Calculate hash of the block
   * @returns {string} SHA256 hash
   */
  calculateHash() {
    return crypto.SHA256(
      this.index +
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.data) +
      this.nonce
    ).toString();
  }

  /**
   * Mine block with proof of work
   * @param {number} difficulty - Mining difficulty
   */
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }

  /**
   * Store block data to IPFS
   * @returns {Promise<string>} IPFS hash
   */
  async storeToIPFS() {
    try {
      const blockData = {
        index: this.index,
        timestamp: this.timestamp,
        data: this.data,
        previousHash: this.previousHash,
        hash: this.hash,
        nonce: this.nonce
      };
      this.ipfsHash = await ipfsService.uploadToIPFS(blockData);
      return this.ipfsHash;
    } catch (error) {
      throw new Error(`Failed to store block to IPFS: ${error.message}`);
    }
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  /**
   * Create the genesis block
   * @returns {Block} Genesis block
   */
  createGenesisBlock() {
    return new Block(0, Date.now(), 'Genesis Block', '0');
  }

  /**
   * Get the latest block in the chain
   * @returns {Block} Latest block
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a new block to the chain
   * @param {Block} newBlock - New block to add
   * @returns {Promise<Block>} Added block
   */
  async addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);

    // Store block to IPFS
    await newBlock.storeToIPFS();

    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Create and add a new block with data
   * @param {Object} data - Block data
   * @returns {Promise<Block>} Created block
   */
  async createBlock(data) {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      data,
      this.getLatestBlock().hash
    );
    return await this.addBlock(newBlock);
  }

  /**
   * Add a transaction to pending transactions
   * @param {Object} transaction - Transaction data
   */
  addTransaction(transaction) {
    if (!transaction.from || !transaction.to) {
      throw new Error('Transaction must include from and to address');
    }

    this.pendingTransactions.push(transaction);
  }

  /**
   * Mine pending transactions
   * @param {string} miningRewardAddress - Address to receive mining reward
   * @returns {Promise<Block>} Mined block
   */
  async minePendingTransactions(miningRewardAddress) {
    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    await this.addBlock(block);

    // Reset pending transactions and add mining reward
    this.pendingTransactions = [
      {
        from: null,
        to: miningRewardAddress,
        amount: this.miningReward,
        timestamp: Date.now()
      }
    ];

    return block;
  }

  /**
   * Get balance of an address
   * @param {string} address - Address to check
   * @returns {number} Balance
   */
  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      if (Array.isArray(block.data)) {
        for (const trans of block.data) {
          if (trans.from === address) {
            balance -= trans.amount;
          }
          if (trans.to === address) {
            balance += trans.amount;
          }
        }
      }
    }

    return balance;
  }

  /**
   * Validate the blockchain
   * @returns {boolean} True if valid
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Verify link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all blocks in the chain
   * @returns {Array<Block>} Array of blocks
   */
  getAllBlocks() {
    return this.chain;
  }

  /**
   * Get block by index
   * @param {number} index - Block index
   * @returns {Block|null} Block or null if not found
   */
  getBlockByIndex(index) {
    return this.chain[index] || null;
  }

  /**
   * Get block by hash
   * @param {string} hash - Block hash
   * @returns {Block|null} Block or null if not found
   */
  getBlockByHash(hash) {
    return this.chain.find(block => block.hash === hash) || null;
  }

  /**
   * Store entire blockchain to IPFS
   * @returns {Promise<string>} IPFS hash of the blockchain
   */
  async storeBlockchainToIPFS() {
    try {
      const chainData = this.chain.map(block => ({
        index: block.index,
        timestamp: block.timestamp,
        data: block.data,
        previousHash: block.previousHash,
        hash: block.hash,
        nonce: block.nonce,
        ipfsHash: block.ipfsHash
      }));

      const ipfsHash = await ipfsService.uploadToIPFS({
        chain: chainData,
        difficulty: this.difficulty,
        timestamp: Date.now()
      });

      return ipfsHash;
    } catch (error) {
      throw new Error(`Failed to store blockchain to IPFS: ${error.message}`);
    }
  }

  /**
   * Load blockchain from IPFS
   * @param {string} ipfsHash - IPFS hash of the blockchain
   * @returns {Promise<void>}
   */
  async loadBlockchainFromIPFS(ipfsHash) {
    try {
      const data = await ipfsService.getFromIPFS(ipfsHash);

      if (data.chain && Array.isArray(data.chain)) {
        this.chain = data.chain.map(blockData => {
          const block = new Block(
            blockData.index,
            blockData.timestamp,
            blockData.data,
            blockData.previousHash
          );
          block.hash = blockData.hash;
          block.nonce = blockData.nonce;
          block.ipfsHash = blockData.ipfsHash;
          return block;
        });

        if (data.difficulty) {
          this.difficulty = data.difficulty;
        }
      }
    } catch (error) {
      throw new Error(`Failed to load blockchain from IPFS: ${error.message}`);
    }
  }
}

// Create singleton instance
const blockchain = new Blockchain();

module.exports = {
  Block,
  Blockchain,
  blockchain
};
