const express = require('express');
const router = express.Router();
const {
  createCertification,
  getCertification,
  updateCertification,
} = require('../controllers/certification.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// POST /api/certifications — submit or update a certification (certifier)
router.post('/', protect, authorize('certifier'), createCertification);

// GET /api/certifications/:batchId — get certification status for a batch
router.get('/:batchId', protect, getCertification);

// PATCH /api/certifications/:id — update certification decision (certifier)
router.patch('/:id', protect, authorize('certifier'), updateCertification);

module.exports = router;
