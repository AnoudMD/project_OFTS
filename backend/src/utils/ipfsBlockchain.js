const crypto = require('crypto');

class Block {
  constructor(index, timestamp, ipfsHash, previousHash) {
    this.index = index;
    this.timestamp = timestamp;
    this.ipfsHash = ipfsHash;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const payload = `${this.index}${this.timestamp}${this.ipfsHash}${this.previousHash}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), 'GENESIS', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(ipfsHash) {
    const latest = this.getLatestBlock();
    const block = new Block(
      latest.index + 1,
      new Date().toISOString(),
      ipfsHash,
      latest.hash
    );
    this.chain.push(block);
    return block;
  }

  getBlockByIndex(index) {
    return this.chain.find((block) => block.index === index);
  }
}

const blockchain = new Blockchain();

const createIpfsHash = (data) => {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(payload).digest('hex');
};

const storeOnIpfs = (data) => {
  const ipfsHash = createIpfsHash(data);
  const block = blockchain.addBlock(ipfsHash);
  return { ipfsHash, block };
};

module.exports = {
  blockchain,
  storeOnIpfs,
};
