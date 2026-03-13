const express = require('express');
const router = express.Router();
const {
  createBatch,
  listBatches,
  getBatch,
  getBatchByCode,
  updateBatch,
  certifyBatch,
} = require('../controllers/batch.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// NOTE: specific routes must be declared before parameterized ones

// GET /api/batches/code/:batchCode — public (no auth required for consumer scan)
router.get('/code/:batchCode', optionalAuth, getBatchByCode);

// GET /api/batches — list all (authenticated)
router.get('/', protect, listBatches);

// POST /api/batches — create (producer only)
router.post('/', protect, authorize('producer'), createBatch);

// GET /api/batches/:id
router.get('/:id', protect, getBatch);

// PATCH /api/batches/:id
router.patch('/:id', protect, authorize('producer', 'certifier'), updateBatch);

// POST /api/batches/:id/certify — certifier only
router.post('/:id/certify', protect, authorize('certifier'), certifyBatch);

module.exports = router;
