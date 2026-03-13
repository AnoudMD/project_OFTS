const express = require('express');
const router = express.Router();
const { recordScan, getUserScans, getMyScan } = require('../controllers/scan.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// POST /api/scans — record a scan (optionally authenticated; anonymous is ok)
router.post('/', optionalAuth, recordScan);

// GET /api/scans/me — get my scan history (authenticated)
router.get('/me', protect, getMyScan);

// GET /api/scans/user/:userId — get scan history for a specific user
router.get('/user/:userId', protect, getUserScans);

module.exports = router;
