# Blockchain & IPFS API Documentation

This document describes the blockchain and IPFS integration API endpoints.

## Table of Contents
1. [Overview](#overview)
2. [Setup](#setup)
3. [Blockchain Endpoints](#blockchain-endpoints)
4. [IPFS Endpoints](#ipfs-endpoints)
5. [Transaction Endpoints](#transaction-endpoints)
6. [Examples](#examples)

## Overview

This API provides a complete blockchain implementation with IPFS integration for decentralized storage. Features include:

- **Blockchain**: Full blockchain with proof-of-work mining
- **IPFS Integration**: Decentralized storage for block data
- **Transactions**: Create and track transactions
- **Wallet Management**: Address-based balance tracking
- **Data Persistence**: MongoDB storage for blockchain records

## Setup

### IPFS Configuration

Add to your `.env` file:

```env
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http
```

### Start IPFS Node

Make sure you have IPFS running locally:

```bash
# Install IPFS
# https://docs.ipfs.tech/install/

# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon
```

## Blockchain Endpoints

### Get Entire Blockchain

```http
GET /api/blockchain
```

**Response:**
```json
{
  "success": true,
  "length": 5,
  "chain": [...],
  "isValid": true
}
```

### Validate Blockchain

```http
GET /api/blockchain/validate
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "message": "Blockchain is valid"
}
```

### Get Block by Index

```http
GET /api/blockchain/block/:index
```

**Example:**
```http
GET /api/blockchain/block/0
```

**Response:**
```json
{
  "success": true,
  "block": {
    "index": 0,
    "timestamp": 1234567890,
    "data": "Genesis Block",
    "previousHash": "0",
    "hash": "abc123...",
    "nonce": 0,
    "ipfsHash": "Qm..."
  }
}
```

### Get Block by Hash

```http
GET /api/blockchain/block/hash/:hash
```

**Example:**
```http
GET /api/blockchain/block/hash/abc123...
```

### Create New Block

```http
POST /api/blockchain/block
Content-Type: application/json

{
  "data": {
    "message": "Your data here",
    "metadata": "Additional information"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Block created successfully",
  "block": {
    "index": 1,
    "hash": "def456...",
    "ipfsHash": "Qm...",
    ...
  }
}
```

### Get Blockchain Statistics

```http
GET /api/blockchain/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalBlocks": 10,
    "totalTransactions": 45,
    "pendingTransactions": 3,
    "difficulty": 2,
    "miningReward": 100,
    "isValid": true,
    "database": {
      "blocks": 10,
      "transactions": 45,
      "confirmedTransactions": 42
    }
  }
}
```

## IPFS Endpoints

### Upload Data to IPFS

```http
POST /api/blockchain/ipfs/upload
Content-Type: application/json

{
  "data": {
    "title": "My Document",
    "content": "Document content here"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data uploaded to IPFS",
  "ipfsHash": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "url": "https://ipfs.io/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
}
```

### Retrieve Data from IPFS

```http
GET /api/blockchain/ipfs/:cid
```

**Example:**
```http
GET /api/blockchain/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "My Document",
    "content": "Document content here"
  }
}
```

### Pin Content on IPFS

```http
POST /api/blockchain/ipfs/pin/:cid
```

**Example:**
```http
POST /api/blockchain/ipfs/pin/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
```

**Response:**
```json
{
  "success": true,
  "message": "Content pinned successfully",
  "cid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
}
```

### Backup Blockchain to IPFS

```http
POST /api/blockchain/backup
```

**Response:**
```json
{
  "success": true,
  "message": "Blockchain backed up to IPFS",
  "ipfsHash": "QmXyz...",
  "url": "https://ipfs.io/ipfs/QmXyz..."
}
```

### Restore Blockchain from IPFS

```http
POST /api/blockchain/restore
Content-Type: application/json

{
  "ipfsHash": "QmXyz..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blockchain restored from IPFS",
  "chain": [...]
}
```

## Transaction Endpoints

### Create Transaction

```http
POST /api/blockchain/transaction
Content-Type: application/json

{
  "from": "0x1234567890abcdef1234567890abcdef12345678",
  "to": "0xabcdef1234567890abcdef1234567890abcdef12",
  "amount": 100,
  "data": {
    "memo": "Payment for services"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction added to pending pool",
  "transaction": {
    "_id": "...",
    "from": "0x1234...",
    "to": "0xabcd...",
    "amount": 100,
    "status": "pending",
    "transactionHash": "abc123...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Mine Pending Transactions

```http
POST /api/blockchain/mine
Content-Type: application/json

{
  "miningRewardAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Block mined successfully",
  "block": {
    "index": 5,
    "hash": "000abc123...",
    "previousHash": "000def456...",
    "data": [...],
    "nonce": 12345,
    "ipfsHash": "Qm..."
  }
}
```

### Get Pending Transactions

```http
GET /api/blockchain/transactions/pending
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "transactions": [...]
}
```

### Get Transactions by Address

```http
GET /api/blockchain/transactions/:address
```

**Example:**
```http
GET /api/blockchain/transactions/0x1234567890abcdef1234567890abcdef12345678
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "transactions": [...]
}
```

### Get Balance of Address

```http
GET /api/blockchain/balance/:address
```

**Example:**
```http
GET /api/blockchain/balance/0x1234567890abcdef1234567890abcdef12345678
```

**Response:**
```json
{
  "success": true,
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "balance": 500
}
```

## Examples

### Complete Transaction Flow

```javascript
// 1. Create a transaction
const createTransaction = async () => {
  const response = await fetch('http://localhost:5000/api/blockchain/transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: '0xSenderAddress',
      to: '0xRecipientAddress',
      amount: 50,
      data: { memo: 'Payment' }
    })
  });
  return await response.json();
};

// 2. Mine the transaction
const minePendingTransactions = async () => {
  const response = await fetch('http://localhost:5000/api/blockchain/mine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      miningRewardAddress: '0xMinerAddress'
    })
  });
  return await response.json();
};

// 3. Check balance
const checkBalance = async (address) => {
  const response = await fetch(`http://localhost:5000/api/blockchain/balance/${address}`);
  return await response.json();
};
```

### Store and Retrieve Data via IPFS

```javascript
// Upload data to IPFS
const uploadToIPFS = async (data) => {
  const response = await fetch('http://localhost:5000/api/blockchain/ipfs/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  return await response.json();
};

// Retrieve data from IPFS
const getFromIPFS = async (cid) => {
  const response = await fetch(`http://localhost:5000/api/blockchain/ipfs/${cid}`);
  return await response.json();
};

// Example usage
const data = { title: 'My Document', content: 'Hello IPFS!' };
const uploadResult = await uploadToIPFS(data);
console.log('IPFS Hash:', uploadResult.ipfsHash);

const retrievedData = await getFromIPFS(uploadResult.ipfsHash);
console.log('Retrieved:', retrievedData.data);
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (IPFS offline)

## Notes

- The blockchain uses Proof of Work with configurable difficulty
- All blocks are automatically stored to IPFS
- Transactions require from, to, and amount fields
- Wallet addresses should be in the format: `0x` followed by 40 hexadecimal characters
- IPFS daemon must be running for IPFS operations
- Mining reward is currently set to 100 units per block
