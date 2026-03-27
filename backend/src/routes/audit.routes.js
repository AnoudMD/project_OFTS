const express = require('express');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');

const router = express.Router();

router.get('/', auth, allowRoles('Certifier'), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;