/**
 * Blockchain & IPFS Demo Script
 * Run this to test blockchain functionality
 */

const { blockchain } = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const { generateWalletAddress, formatBlock } = require('../utils/blockchainUtils');

async function runDemo() {
  console.log('='.repeat(50));
  console.log('BLOCKCHAIN & IPFS DEMO');
  console.log('='.repeat(50));

  // Step 1: Check blockchain initial state
  console.log('\n1. Initial Blockchain State:');
  console.log('   Blocks:', blockchain.getAllBlocks().length);
  console.log('   Valid:', blockchain.isChainValid());

  // Step 2: Create wallet addresses
  console.log('\n2. Generating Wallet Addresses:');
  const wallet1 = generateWalletAddress();
  const wallet2 = generateWalletAddress();
  const minerWallet = generateWalletAddress();

  console.log('   Wallet 1:', wallet1);
  console.log('   Wallet 2:', wallet2);
  console.log('   Miner:', minerWallet);

  // Step 3: Create some transactions
  console.log('\n3. Creating Transactions:');

  try {
    blockchain.addTransaction({
      from: wallet1,
      to: wallet2,
      amount: 100,
      timestamp: Date.now()
    });
    console.log('   ✓ Transaction 1 added (100 units)');

    blockchain.addTransaction({
      from: wallet2,
      to: wallet1,
      amount: 50,
      timestamp: Date.now()
    });
    console.log('   ✓ Transaction 2 added (50 units)');

    console.log('   Pending transactions:', blockchain.pendingTransactions.length);
  } catch (error) {
    console.error('   ✗ Error adding transactions:', error.message);
  }

  // Step 4: Mine a block
  console.log('\n4. Mining Block:');
  console.log('   Mining in progress...');

  try {
    const block = await blockchain.minePendingTransactions(minerWallet);
    console.log('   ✓ Block mined!');
    console.log('   Block hash:', block.hash);
    console.log('   Nonce:', block.nonce);
    console.log('   IPFS hash:', block.ipfsHash);
  } catch (error) {
    console.error('   ✗ Mining error:', error.message);
  }

  // Step 5: Check balances
  console.log('\n5. Checking Balances:');
  console.log('   Wallet 1:', blockchain.getBalanceOfAddress(wallet1));
  console.log('   Wallet 2:', blockchain.getBalanceOfAddress(wallet2));
  console.log('   Miner:', blockchain.getBalanceOfAddress(minerWallet));

  // Step 6: Create another block with custom data
  console.log('\n6. Creating Block with Custom Data:');

  try {
    const customData = {
      type: 'document',
      title: 'Important Document',
      content: 'This is stored on the blockchain and IPFS',
      timestamp: new Date().toISOString()
    };

    const dataBlock = await blockchain.createBlock(customData);
    console.log('   ✓ Block created with custom data');
    console.log('   Block index:', dataBlock.index);
    console.log('   Block hash:', dataBlock.hash);
    console.log('   IPFS hash:', dataBlock.ipfsHash);
  } catch (error) {
    console.error('   ✗ Error creating block:', error.message);
  }

  // Step 7: Display blockchain
  console.log('\n7. Current Blockchain:');
  const chain = blockchain.getAllBlocks();
  chain.forEach((block, index) => {
    console.log(`\n   Block #${index}:`);
    console.log('   Hash:', block.hash.substring(0, 20) + '...');
    console.log('   Previous:', block.previousHash.substring(0, 20) + '...');
    console.log('   Timestamp:', new Date(block.timestamp).toISOString());
    console.log('   Nonce:', block.nonce);
    if (block.ipfsHash) {
      console.log('   IPFS:', block.ipfsHash);
    }
  });

  // Step 8: Validate blockchain
  console.log('\n8. Blockchain Validation:');
  const isValid = blockchain.isChainValid();
  console.log('   Status:', isValid ? '✓ VALID' : '✗ INVALID');

  // Step 9: Test IPFS directly
  console.log('\n9. Testing IPFS Upload/Download:');

  try {
    const testData = {
      message: 'Hello from IPFS!',
      timestamp: Date.now()
    };

    console.log('   Uploading to IPFS...');
    const ipfsHash = await ipfsService.uploadToIPFS(testData);
    console.log('   ✓ Uploaded! Hash:', ipfsHash);
    console.log('   URL: https://ipfs.io/ipfs/' + ipfsHash);

    console.log('   Downloading from IPFS...');
    const retrievedData = await ipfsService.getFromIPFS(ipfsHash);
    console.log('   ✓ Retrieved data:', retrievedData);

    console.log('   Pinning content...');
    await ipfsService.pinContent(ipfsHash);
    console.log('   ✓ Content pinned');
  } catch (error) {
    console.error('   ✗ IPFS error:', error.message);
    console.log('   Note: Make sure IPFS daemon is running (ipfs daemon)');
  }

  // Step 10: Backup blockchain to IPFS
  console.log('\n10. Backing up Blockchain to IPFS:');

  try {
    const backupHash = await blockchain.storeBlockchainToIPFS();
    console.log('    ✓ Blockchain backed up!');
    console.log('    Backup hash:', backupHash);
    console.log('    URL: https://ipfs.io/ipfs/' + backupHash);
  } catch (error) {
    console.error('    ✗ Backup error:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('DEMO COMPLETED');
  console.log('='.repeat(50));
  console.log('Total Blocks:', blockchain.getAllBlocks().length);
  console.log('Blockchain Valid:', blockchain.isChainValid());
  console.log('Difficulty:', blockchain.difficulty);
  console.log('Mining Reward:', blockchain.miningReward);
  console.log('='.repeat(50));
}

// Run the demo
if (require.main === module) {
  console.log('Starting blockchain demo...\n');
  runDemo()
    .then(() => {
      console.log('\nDemo finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nDemo failed:', error);
      process.exit(1);
    });
}

module.exports = { runDemo };
