# IPFS Blockchain Implementation

A complete blockchain implementation with IPFS (InterPlanetary File System) integration for decentralized data storage.

## Features

### Blockchain
- ✅ Full blockchain implementation with proof-of-work
- ✅ Block mining with configurable difficulty
- ✅ Transaction management (pending, confirmed, failed)
- ✅ Wallet address generation and balance tracking
- ✅ Chain validation and integrity verification
- ✅ Merkle tree support for transactions
- ✅ Mining rewards system

### IPFS Integration
- ✅ Decentralized storage for block data
- ✅ Automatic block backup to IPFS
- ✅ Content pinning for persistence
- ✅ Direct file upload support
- ✅ Blockchain backup and restore via IPFS
- ✅ HTTP gateway access

### Database
- ✅ MongoDB integration for blockchain records
- ✅ Transaction history and status tracking
- ✅ Indexed queries for performance
- ✅ Persistent storage of chain data

## Architecture

```
backend/
├── src/
│   ├── services/
│   │   ├── ipfsService.js         # IPFS client wrapper
│   │   └── blockchainService.js   # Blockchain logic
│   ├── models/
│   │   ├── BlockchainRecord.js    # Block data schema
│   │   └── Transaction.js          # Transaction schema
│   ├── routes/
│   │   └── blockchain.js           # API endpoints
│   ├── middleware/
│   │   └── blockchainAuth.js       # Validation middleware
│   ├── utils/
│   │   └── blockchainUtils.js      # Helper functions
│   └── scripts/
│       └── blockchainDemo.js       # Demo script
└── BLOCKCHAIN_API.md               # API documentation
```

## Installation

### 1. Install IPFS

**macOS:**
```bash
brew install ipfs
```

**Linux:**
```bash
wget https://dist.ipfs.tech/go-ipfs/v0.18.1/go-ipfs_v0.18.1_linux-amd64.tar.gz
tar -xvzf go-ipfs_v0.18.1_linux-amd64.tar.gz
cd go-ipfs
sudo bash install.sh
```

**Windows:**
Download from https://dist.ipfs.tech/go-ipfs/

### 2. Initialize and Start IPFS

```bash
# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon
```

IPFS will run on `http://localhost:5001` by default.

### 3. Install Node Dependencies

```bash
cd backend
npm install
```

Dependencies installed:
- `ipfs-http-client` - IPFS client library
- `crypto-js` - Cryptographic functions
- `mongoose` - MongoDB ODM
- `express` - Web framework

### 4. Configure Environment

Add to your `.env` file:

```env
# IPFS Configuration
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/ofts

# Server
PORT=5000
```

### 5. Start the Server

```bash
npm run dev
```

## Usage

### Quick Start

#### 1. Run the Demo Script

```bash
node src/scripts/blockchainDemo.js
```

This will:
- Create wallet addresses
- Add transactions
- Mine blocks
- Upload data to IPFS
- Validate the blockchain
- Show balances

#### 2. Test the API

```bash
# Get blockchain
curl http://localhost:5000/api/blockchain

# Create a transaction
curl -X POST http://localhost:5000/api/blockchain/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x1234567890abcdef1234567890abcdef12345678",
    "to": "0xabcdef1234567890abcdef1234567890abcdef12",
    "amount": 100
  }'

# Mine pending transactions
curl -X POST http://localhost:5000/api/blockchain/mine \
  -H "Content-Type: application/json" \
  -d '{
    "miningRewardAddress": "0x1234567890abcdef1234567890abcdef12345678"
  }'

# Check balance
curl http://localhost:5000/api/blockchain/balance/0x1234567890abcdef1234567890abcdef12345678

# Upload to IPFS
curl -X POST http://localhost:5000/api/blockchain/ipfs/upload \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "title": "My Document",
      "content": "Hello IPFS!"
    }
  }'
```

## API Endpoints

### Blockchain Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blockchain` | Get entire blockchain |
| GET | `/api/blockchain/validate` | Validate blockchain |
| GET | `/api/blockchain/block/:index` | Get block by index |
| GET | `/api/blockchain/block/hash/:hash` | Get block by hash |
| POST | `/api/blockchain/block` | Create new block |
| GET | `/api/blockchain/stats` | Get blockchain statistics |

### Transaction Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/blockchain/transaction` | Create transaction |
| POST | `/api/blockchain/mine` | Mine pending transactions |
| GET | `/api/blockchain/transactions/pending` | Get pending transactions |
| GET | `/api/blockchain/transactions/:address` | Get transactions by address |
| GET | `/api/blockchain/balance/:address` | Get balance of address |

### IPFS Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/blockchain/ipfs/upload` | Upload data to IPFS |
| GET | `/api/blockchain/ipfs/:cid` | Retrieve data from IPFS |
| POST | `/api/blockchain/ipfs/pin/:cid` | Pin content on IPFS |
| POST | `/api/blockchain/backup` | Backup blockchain to IPFS |
| POST | `/api/blockchain/restore` | Restore blockchain from IPFS |

See [BLOCKCHAIN_API.md](backend/BLOCKCHAIN_API.md) for detailed documentation.

## How It Works

### 1. Blockchain Structure

Each block contains:
- **Index**: Position in the chain
- **Timestamp**: Block creation time
- **Data**: Transaction data or custom data
- **Previous Hash**: Hash of previous block
- **Hash**: Current block hash
- **Nonce**: Proof of work nonce
- **IPFS Hash**: CID of block data on IPFS

### 2. Proof of Work

Blocks are mined using proof-of-work algorithm:
- Difficulty determines the number of leading zeros required
- Miners increment nonce until valid hash is found
- Default difficulty is 2 (adjustable)

### 3. IPFS Integration

Every block is automatically stored on IPFS:
- Block data is uploaded to IPFS after mining
- Returns Content Identifier (CID)
- Data can be retrieved from any IPFS gateway
- Pinning ensures data persistence

### 4. Transaction Flow

1. Create transaction (from, to, amount)
2. Transaction added to pending pool
3. Miner mines pending transactions into block
4. Block is added to chain and stored on IPFS
5. Transactions marked as confirmed
6. Balances updated

### 5. Data Persistence

- **Blockchain**: In-memory chain + MongoDB backup
- **IPFS**: Decentralized storage for block data
- **MongoDB**: Transaction history and metadata

## Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api/blockchain';

// Create a transaction
async function createTransaction(from, to, amount) {
  const response = await axios.post(`${BASE_URL}/transaction`, {
    from,
    to,
    amount
  });
  return response.data;
}

// Mine transactions
async function mineBlock(minerAddress) {
  const response = await axios.post(`${BASE_URL}/mine`, {
    miningRewardAddress: minerAddress
  });
  return response.data;
}

// Check balance
async function getBalance(address) {
  const response = await axios.get(`${BASE_URL}/balance/${address}`);
  return response.data;
}

// Upload to IPFS
async function uploadToIPFS(data) {
  const response = await axios.post(`${BASE_URL}/ipfs/upload`, {
    data
  });
  return response.data;
}

// Usage
(async () => {
  const wallet1 = '0x1234567890abcdef1234567890abcdef12345678';
  const wallet2 = '0xabcdef1234567890abcdef1234567890abcdef12';

  // Create transaction
  await createTransaction(wallet1, wallet2, 100);

  // Mine block
  const block = await mineBlock(wallet1);
  console.log('Mined block:', block.block.hash);

  // Check balance
  const balance = await getBalance(wallet1);
  console.log('Balance:', balance.balance);

  // Upload document to IPFS
  const upload = await uploadToIPFS({
    title: 'Contract',
    content: 'Agreement details...'
  });
  console.log('IPFS URL:', upload.url);
})();
```

### Python

```python
import requests

BASE_URL = 'http://localhost:5000/api/blockchain'

# Create transaction
def create_transaction(from_addr, to_addr, amount):
    response = requests.post(f'{BASE_URL}/transaction', json={
        'from': from_addr,
        'to': to_addr,
        'amount': amount
    })
    return response.json()

# Mine block
def mine_block(miner_address):
    response = requests.post(f'{BASE_URL}/mine', json={
        'miningRewardAddress': miner_address
    })
    return response.json()

# Get blockchain
def get_blockchain():
    response = requests.get(BASE_URL)
    return response.json()

# Usage
wallet1 = '0x1234567890abcdef1234567890abcdef12345678'
wallet2 = '0xabcdef1234567890abcdef1234567890abcdef12'

# Create and mine
create_transaction(wallet1, wallet2, 50)
result = mine_block(wallet1)
print(f"Block mined: {result['block']['hash']}")

# Get chain
chain = get_blockchain()
print(f"Total blocks: {chain['length']}")
```

## Configuration

### Adjust Mining Difficulty

Edit `backend/src/services/blockchainService.js`:

```javascript
constructor() {
  this.chain = [this.createGenesisBlock()];
  this.difficulty = 4; // Increase for harder mining
  this.miningReward = 100;
}
```

Higher difficulty = longer mining time but more secure.

### Change IPFS Gateway

Edit `backend/src/utils/blockchainUtils.js`:

```javascript
function ipfsToHTTP(ipfsHash, gateway = 'ipfs.io') {
  return `https://${gateway}/ipfs/${ipfsHash}`;
}
```

Alternative gateways:
- `cloudflare-ipfs.com`
- `gateway.pinata.cloud`
- `dweb.link`

## Utilities

The blockchain implementation includes helper utilities:

```javascript
const {
  generateWalletAddress,
  hashData,
  createMerkleRoot,
  validateTransaction,
  ipfsToHTTP
} = require('./src/utils/blockchainUtils');

// Generate wallet
const wallet = generateWalletAddress();
// Returns: 0x1234567890abcdef...

// Hash data
const hash = hashData({ message: 'Hello' });
// Returns: SHA256 hash

// Validate transaction
const isValid = validateTransaction({
  from: '0x123...',
  to: '0xabc...',
  amount: 100
});
// Returns: { valid: true, errors: [] }

// Get IPFS URL
const url = ipfsToHTTP('QmHash123');
// Returns: https://ipfs.io/ipfs/QmHash123
```

## Monitoring

### Check IPFS Status

```bash
# Check IPFS is running
ipfs id

# View pinned content
ipfs pin ls

# Check IPFS stats
ipfs stats bw
```

### Blockchain Health

```bash
# Get stats
curl http://localhost:5000/api/blockchain/stats

# Validate chain
curl http://localhost:5000/api/blockchain/validate
```

## Troubleshooting

### IPFS Connection Error

```
Error: Failed to upload to IPFS
```

**Solution:**
```bash
# Make sure IPFS daemon is running
ipfs daemon

# Check IPFS is accessible
curl http://localhost:5001/api/v0/version
```

### Transaction Validation Error

```
Error: Transaction must include from and to address
```

**Solution:** Ensure transactions have valid `from`, `to`, and `amount` fields:
```javascript
{
  "from": "0x1234567890abcdef1234567890abcdef12345678",
  "to": "0xabcdef1234567890abcdef1234567890abcdef12",
  "amount": 100
}
```

### MongoDB Connection Error

```
Error: MongoServerError: connect ECONNREFUSED
```

**Solution:**
```bash
# Start MongoDB
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 mongo
```

## Security Considerations

1. **Private Keys**: This implementation uses simplified wallet addresses. For production, implement proper public/private key cryptography.

2. **API Authentication**: Add authentication middleware to protect endpoints.

3. **Rate Limiting**: Mining endpoints include basic rate limiting. Consider using `express-rate-limit` for production.

4. **Input Validation**: All inputs are validated. Review validators in `middleware/blockchainAuth.js`.

5. **IPFS Access**: Consider using private IPFS network for sensitive data.

## Performance

- **Mining Speed**: Depends on difficulty (2 = ~100ms, 4 = ~1s, 6 = ~10s)
- **IPFS Upload**: ~200-500ms per block
- **Transaction Throughput**: Limited by mining time
- **Storage**: Each block ~1-5KB in MongoDB, data stored on IPFS

## Future Enhancements

- [ ] Smart contract support
- [ ] Peer-to-peer networking
- [ ] Consensus mechanism (PoS, DPoS)
- [ ] Transaction fees
- [ ] Block explorer UI
- [ ] WebSocket real-time updates
- [ ] Multi-signature wallets
- [ ] NFT support

## License

MIT

## Support

For issues or questions, see the API documentation in `backend/BLOCKCHAIN_API.md`.
