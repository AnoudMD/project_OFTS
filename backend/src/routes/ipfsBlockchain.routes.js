const express = require('express');
const { storeOnIpfs, blockchain } = require('../utils/ipfsBlockchain');

const router = express.Router();

router.post('/store', (req, res) => {
  try {
    const payload = req.body || {};
    const result = storeOnIpfs(payload);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/chain', (_req, res) => {
  res.json({ chain: blockchain.chain });
});

router.get('/block/:index', (req, res) => {
  const index = Number(req.params.index);
  if (Number.isNaN(index)) {
    return res.status(400).json({ message: 'Invalid block index' });
  }

  const block = blockchain.getBlockByIndex(index);
  if (!block) {
    return res.status(404).json({ message: 'Block not found' });
  }

  return res.json({ block });
});

module.exports = router;
