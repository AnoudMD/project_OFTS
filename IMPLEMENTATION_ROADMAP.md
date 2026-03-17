# OFTS Implementation Roadmap

## Executive Summary

The current OFTS implementation is a **functional database-backed prototype** that successfully implements the core user workflows but **lacks the critical blockchain infrastructure** specified in the requirements document.

**Gap:** No blockchain, no IPFS, no cryptographic verification
**Impact:** System lacks immutability, decentralization, and tamper-proof guarantees

---

## Quick Wins (1-2 Days) 🚀

These features can be implemented quickly to improve the current system:

### 1. QR Code Scanner ⭐ HIGH IMPACT
**Location:** `/frontend/src/screens/ConsumerLookupScreen.js`

```bash
# Install dependency
cd frontend
npm install expo-camera

# Implementation steps:
# 1. Request camera permissions
# 2. Add BarcodeScanningResult handler
# 3. Parse QR code data
# 4. Navigate to traceability screen
```

**Files to modify:**
- `frontend/src/screens/ConsumerLookupScreen.js`
- `frontend/package.json`

**Estimated time:** 2-3 hours

---

### 2. Document Viewer in Certifier Review ⭐ HIGH IMPACT
**Location:** `/frontend/src/screens/CertifierReviewScreen.js`

```bash
# Implementation steps:
# 1. Display document list in review screen
# 2. Add download/preview buttons
# 3. Show document metadata (name, size, type)
# 4. Link to document URLs
```

**Files to modify:**
- `frontend/src/screens/CertifierReviewScreen.js`
- `frontend/src/components/DocumentList.js` (new)

**Estimated time:** 3-4 hours

---

### 3. Cryptographic File Hashing
**Location:** `/backend/src/routes/batch.routes.js`

```bash
# Install dependency
cd backend
npm install crypto

# Implementation steps:
# 1. Generate SHA256 hash for each uploaded file
# 2. Store hash in certificationDocuments array
# 3. Add verification endpoint
# 4. Display hash in frontend
```

**Files to modify:**
- `backend/src/routes/batch.routes.js`
- `backend/src/models/Batch.js` (add hash field)
- `backend/src/utils/hash.js` (new)

**Estimated time:** 4-6 hours

---

## Short-Term Improvements (1 Week) 📊

### 4. Enhanced Dashboard Analytics
**Location:** `/frontend/src/screens/DashboardScreen.js`

- Total batches created
- Approval/rejection rates
- Recent activity feed
- Pending certifications count

**Estimated time:** 1-2 days

---

### 5. Document Download/Preview
**Location:** `/backend/src/routes/batch.routes.js`

- Add endpoint to download specific document
- Implement file streaming
- Add document preview support (PDF, images)

**Estimated time:** 1 day

---

### 6. Batch Search and Filtering
**Location:** `/frontend/src/screens/` (various)

- Search batches by product name, farm, date
- Filter by status (Pending, Approved, Rejected)
- Sort by creation date, expiry date

**Estimated time:** 1-2 days

---

## Blockchain Integration (2-4 Weeks) ⛓️

This is the **CRITICAL MISSING COMPONENT** to meet document requirements.

### Phase A: Hyperledger Fabric Setup (Week 1)

#### Prerequisites
```bash
# Install required tools
docker --version  # Docker Engine 20+
docker-compose --version  # Docker Compose 2+
node --version  # Node.js 18+
```

#### Steps

1. **Install Hyperledger Fabric**
```bash
cd backend
mkdir blockchain
cd blockchain

# Download Fabric binaries
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.5

# Verify installation
./bin/peer version
./bin/orderer version
```

2. **Create Network Configuration**
```bash
# Generate crypto material
./bin/cryptogen generate --config=./crypto-config.yaml

# Generate genesis block and channel artifacts
./bin/configtxgen -profile OrdererGenesis -outputBlock ./channel-artifacts/genesis.block
./bin/configtxgen -profile Channel -outputCreateChannelTx ./channel-artifacts/channel.tx
```

3. **Start Fabric Network**
```bash
docker-compose -f docker-compose.yml up -d

# Verify containers running
docker ps
# Should see: orderer, peer0.org1, peer0.org2, ca.org1, ca.org2
```

4. **Create and Join Channel**
```bash
./bin/peer channel create -o orderer:7050 -c oftschannel -f ./channel-artifacts/channel.tx
./bin/peer channel join -b oftschannel.block
```

**Files to create:**
- `backend/blockchain/crypto-config.yaml`
- `backend/blockchain/configtx.yaml`
- `backend/blockchain/docker-compose.yml`
- `backend/blockchain/network.sh`

**Estimated time:** 3-5 days

---

### Phase B: Smart Contract Development (Week 2)

#### 1. Batch Smart Contract

**Location:** `backend/blockchain/chaincode/batch/`

```javascript
// batch-contract.js
'use strict';

const { Contract } = require('fabric-contract-api');

class BatchContract extends Contract {

    async createBatch(ctx, batchId, productName, farmName, metadata) {
        const batch = {
            batchId,
            productName,
            farmName,
            metadata: JSON.parse(metadata),
            status: 'Pending',
            createdAt: new Date().toISOString(),
            createdBy: ctx.clientIdentity.getID()
        };

        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    async certifyBatch(ctx, batchId, certifierID, decision, documentHashes) {
        const batchBytes = await ctx.stub.getState(batchId);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchBytes.toString());

        batch.status = decision; // 'Approved' or 'Rejected'
        batch.certifiedBy = certifierID;
        batch.certificationDate = new Date().toISOString();
        batch.documentHashes = JSON.parse(documentHashes);

        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batch)));

        // Emit certification event
        ctx.stub.setEvent('BatchCertified', Buffer.from(JSON.stringify({
            batchId,
            status: decision,
            timestamp: batch.certificationDate
        })));

        return JSON.stringify(batch);
    }

    async queryBatch(ctx, batchId) {
        const batchBytes = await ctx.stub.getState(batchId);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }
        return batchBytes.toString();
    }

    async getBatchHistory(ctx, batchId) {
        const iterator = await ctx.stub.getHistoryForKey(batchId);
        const history = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const record = {
                    txId: res.value.txId,
                    timestamp: res.value.timestamp,
                    isDelete: res.value.isDelete,
                    value: JSON.parse(res.value.value.toString())
                };
                history.push(record);
            }

            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return JSON.stringify(history);
    }
}

module.exports = BatchContract;
```

#### 2. Event Smart Contract

**Location:** `backend/blockchain/chaincode/event/`

```javascript
// event-contract.js
'use strict';

const { Contract } = require('fabric-contract-api');

class EventContract extends Contract {

    async addEvent(ctx, eventId, batchId, eventType, location, metadata) {
        // Verify batch exists and is approved
        const batchBytes = await ctx.stub.getState(batchId);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchBytes.toString());
        if (batch.status !== 'Approved') {
            throw new Error(`Can only add events to approved batches`);
        }

        const event = {
            eventId,
            batchId,
            eventType,
            location,
            metadata: JSON.parse(metadata),
            recordedAt: new Date().toISOString(),
            recordedBy: ctx.clientIdentity.getID()
        };

        await ctx.stub.putState(eventId, Buffer.from(JSON.stringify(event)));

        // Create composite key for batch-event relationship
        const compositeKey = ctx.stub.createCompositeKey('batch-event', [batchId, eventId]);
        await ctx.stub.putState(compositeKey, Buffer.from('\u0000'));

        return JSON.stringify(event);
    }

    async queryEventsByBatch(ctx, batchId) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('batch-event', [batchId]);
        const events = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.key) {
                const splitKey = ctx.stub.splitCompositeKey(res.value.key);
                const eventId = splitKey.attributes[1];
                const eventBytes = await ctx.stub.getState(eventId);
                events.push(JSON.parse(eventBytes.toString()));
            }

            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return JSON.stringify(events);
    }
}

module.exports = EventContract;
```

#### 3. Deploy Smart Contracts

```bash
# Package chaincode
./bin/peer lifecycle chaincode package batch.tar.gz --path ./chaincode/batch --lang node --label batch_1.0

# Install on peers
./bin/peer lifecycle chaincode install batch.tar.gz

# Approve chaincode
./bin/peer lifecycle chaincode approveformyorg \
    --channelID oftschannel \
    --name batch \
    --version 1.0 \
    --package-id batch_1.0:hash \
    --sequence 1

# Commit chaincode
./bin/peer lifecycle chaincode commit \
    --channelID oftschannel \
    --name batch \
    --version 1.0 \
    --sequence 1
```

**Files to create:**
- `backend/blockchain/chaincode/batch/index.js`
- `backend/blockchain/chaincode/batch/batch-contract.js`
- `backend/blockchain/chaincode/batch/package.json`
- `backend/blockchain/chaincode/event/index.js`
- `backend/blockchain/chaincode/event/event-contract.js`
- `backend/blockchain/chaincode/event/package.json`

**Estimated time:** 4-6 days

---

### Phase C: Backend Integration (Week 3)

#### 1. Install Fabric SDK

```bash
cd backend
npm install fabric-network fabric-ca-client
```

#### 2. Create Blockchain Service Layer

**Location:** `backend/src/services/blockchain.service.js`

```javascript
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

class BlockchainService {
    constructor() {
        this.gateway = null;
        this.wallet = null;
        this.contract = null;
    }

    async connect(userId, orgName) {
        // Load connection profile
        const ccpPath = path.resolve(__dirname, '..', '..', 'blockchain',
            `connection-org${orgName}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Load wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        this.wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check user identity
        const identity = await this.wallet.get(userId);
        if (!identity) {
            throw new Error(`Identity ${userId} not found in wallet`);
        }

        // Connect to gateway
        this.gateway = new Gateway();
        await this.gateway.connect(ccp, {
            wallet: this.wallet,
            identity: userId,
            discovery: { enabled: true, asLocalhost: true }
        });

        // Get network and contract
        const network = await this.gateway.getNetwork('oftschannel');
        this.contract = network.getContract('batch');

        return this.contract;
    }

    async createBatch(batchId, productName, farmName, metadata) {
        const result = await this.contract.submitTransaction(
            'createBatch',
            batchId,
            productName,
            farmName,
            JSON.stringify(metadata)
        );
        return JSON.parse(result.toString());
    }

    async certifyBatch(batchId, certifierID, decision, documentHashes) {
        const result = await this.contract.submitTransaction(
            'certifyBatch',
            batchId,
            certifierID,
            decision,
            JSON.stringify(documentHashes)
        );
        return JSON.parse(result.toString());
    }

    async queryBatch(batchId) {
        const result = await this.contract.evaluateTransaction('queryBatch', batchId);
        return JSON.parse(result.toString());
    }

    async getBatchHistory(batchId) {
        const result = await this.contract.evaluateTransaction('getBatchHistory', batchId);
        return JSON.parse(result.toString());
    }

    async disconnect() {
        if (this.gateway) {
            await this.gateway.disconnect();
        }
    }
}

module.exports = new BlockchainService();
```

#### 3. Update Batch Routes

**Location:** `backend/src/routes/batch.routes.js`

```javascript
const blockchainService = require('../services/blockchain.service');

// Modify POST / endpoint
router.post('/', auth, allowRoles('Producer'), upload.array('documents', 5), async (req, res) => {
    try {
        const { productName, farmName, productionDate, expiryDate, notes } = req.body;
        const batchId = `OFTS-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Generate document hashes
        const documentHashes = (req.files || []).map(file => ({
            filename: file.filename,
            hash: crypto.createHash('sha256').update(fs.readFileSync(file.path)).digest('hex')
        }));

        // Submit to blockchain
        await blockchainService.connect(req.user._id.toString(), '1');
        const blockchainBatch = await blockchainService.createBatch(
            batchId,
            productName,
            farmName,
            { productionDate, expiryDate, notes, documentHashes }
        );
        await blockchainService.disconnect();

        // Store in MongoDB (for fast queries)
        const batch = await Batch.create({
            batchId,
            productName,
            farmName,
            productionDate,
            expiryDate,
            notes,
            certificationDocuments: documentHashes,
            createdBy: req.user._id,
        });

        res.status(201).json({ batch, blockchain: blockchainBatch });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

**Files to create/modify:**
- `backend/src/services/blockchain.service.js` (new)
- `backend/src/routes/batch.routes.js` (modify)
- `backend/src/routes/event.routes.js` (modify)
- `backend/src/utils/hash.js` (new)

**Estimated time:** 5-7 days

---

### Phase D: IPFS Integration (Week 3-4)

#### 1. Install IPFS Dependencies

```bash
cd backend
npm install ipfs-http-client
```

#### 2. Create IPFS Service

**Location:** `backend/src/services/ipfs.service.js`

```javascript
const { create } = require('ipfs-http-client');
const fs = require('fs');

class IPFSService {
    constructor() {
        // Connect to local IPFS node or Infura
        this.client = create({
            host: process.env.IPFS_HOST || 'ipfs.infura.io',
            port: process.env.IPFS_PORT || 5001,
            protocol: process.env.IPFS_PROTOCOL || 'https'
        });
    }

    async uploadFile(filePath) {
        const file = fs.readFileSync(filePath);
        const result = await this.client.add(file);
        return result.cid.toString(); // Return IPFS hash (CID)
    }

    async uploadJSON(data) {
        const result = await this.client.add(JSON.stringify(data));
        return result.cid.toString();
    }

    async retrieveFile(cid) {
        const chunks = [];
        for await (const chunk of this.client.cat(cid)) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    getGatewayUrl(cid) {
        return `https://ipfs.io/ipfs/${cid}`;
    }
}

module.exports = new IPFSService();
```

#### 3. Update File Upload

**Location:** `backend/src/routes/batch.routes.js`

```javascript
const ipfsService = require('../services/ipfs.service');

// In POST / endpoint, after file upload:
const documents = await Promise.all((req.files || []).map(async (file) => {
    // Upload to IPFS
    const ipfsCid = await ipfsService.uploadFile(file.path);

    // Generate hash
    const fileHash = crypto.createHash('sha256')
        .update(fs.readFileSync(file.path))
        .digest('hex');

    // Delete local file after IPFS upload
    fs.unlinkSync(file.path);

    return {
        originalName: file.originalname,
        ipfsCid: ipfsCid,
        fileHash: fileHash,
        mimeType: file.mimetype,
        gatewayUrl: ipfsService.getGatewayUrl(ipfsCid)
    };
}));
```

**Files to create/modify:**
- `backend/src/services/ipfs.service.js` (new)
- `backend/src/routes/batch.routes.js` (modify)
- `backend/src/models/Batch.js` (add ipfsCid field)

**Estimated time:** 3-4 days

---

## Testing Plan (1 Week)

### Unit Tests
```bash
# Install testing framework
npm install --save-dev mocha chai sinon

# Test structure
backend/test/
  ├── unit/
  │   ├── blockchain.service.test.js
  │   ├── ipfs.service.test.js
  │   └── hash.test.js
  ├── integration/
  │   ├── batch.routes.test.js
  │   └── event.routes.test.js
  └── e2e/
      └── full-workflow.test.js
```

### Smart Contract Tests
```bash
# Install Fabric test framework
npm install --save-dev @hyperledger/fabric-network fabric-shim-api

# Test chaincode
backend/blockchain/chaincode/batch/test/batch-contract.test.js
```

### End-to-End Testing
- Producer creates batch → blockchain record created
- Certifier approves batch → blockchain updated
- Distributor adds event → event recorded on-chain
- Consumer scans QR → retrieves blockchain data

---

## Deployment Checklist

### Production Blockchain Network
- [ ] Multi-organization Fabric network (at least 2 orgs)
- [ ] Orderer nodes (Raft consensus)
- [ ] Peer nodes with CouchDB state database
- [ ] Certificate Authorities for each org
- [ ] TLS enabled for all communications

### IPFS Deployment
- [ ] IPFS cluster for redundancy
- [ ] Pinning service (Pinata/Infura) configured
- [ ] CDN integration for fast retrieval

### Backend Deployment
- [ ] Environment variables configured
- [ ] MongoDB replica set
- [ ] Load balancer for API
- [ ] SSL/TLS certificates

### Frontend Deployment
- [ ] Expo build for iOS and Android
- [ ] App store deployment
- [ ] Analytics integration

### Monitoring
- [ ] Blockchain network monitoring
- [ ] IPFS node health checks
- [ ] API performance metrics
- [ ] Error logging (Sentry/LogRocket)

---

## Summary Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Quick Wins | 1-2 days | QR scanner, document viewer, hashing |
| Short-term | 1 week | Dashboard, search, filtering |
| Blockchain Setup | 1 week | Fabric network running |
| Smart Contracts | 1 week | Chaincode deployed |
| Backend Integration | 1 week | API connected to blockchain |
| IPFS Integration | 3-4 days | Decentralized file storage |
| Testing | 1 week | All tests passing |
| **Total** | **5-6 weeks** | Production-ready OFTS |

---

## Resource Requirements

### Development Team
- 1 Blockchain Developer (Hyperledger Fabric expertise)
- 1 Backend Developer (Node.js/Express)
- 1 Frontend Developer (React Native)
- 1 DevOps Engineer (Docker, deployment)

### Infrastructure
- Development: Docker containers on local/cloud
- Production:
  - 4-6 VMs for Fabric nodes
  - IPFS pinning service subscription
  - MongoDB Atlas cluster
  - CDN for frontend assets

### Third-party Services
- Infura/Pinata (IPFS pinning): ~$50-200/month
- MongoDB Atlas: ~$50-100/month
- Cloud hosting (AWS/Azure): ~$300-500/month

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Blockchain complexity | Start with simple network, expand gradually |
| IPFS latency | Use pinning service + CDN |
| Smart contract bugs | Extensive testing, code review, audit |
| Production downtime | Redundant nodes, automated failover |
| Data migration | Keep MongoDB as cache, blockchain as source of truth |

---

## Success Metrics

- [ ] All 10 functional requirements met
- [ ] All 8 non-functional requirements met
- [ ] Blockchain transactions < 3 seconds
- [ ] IPFS file retrieval < 5 seconds
- [ ] QR code scan to traceability < 2 seconds
- [ ] 99.9% API uptime
- [ ] Zero data tampering incidents

---

**Document Version:** 1.0
**Last Updated:** 2026-03-17
**Status:** Ready for Implementation
