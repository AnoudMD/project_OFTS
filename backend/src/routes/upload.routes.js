const express = require('express');
const router = express.Router();
const { uploadCertification, uploadGeneric } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { upload } = require('../middleware/upload.middleware');

// POST /api/uploads/certification — attach cert document to a batch (producer)
router.post(
  '/certification',
  protect,
  authorize('producer'),
  upload.single('file'),
  uploadCertification
);

// POST /api/uploads/generic — general upload (any authenticated user)
router.post(
  '/generic',
  protect,
  upload.single('file'),
  uploadGeneric
);

module.exports = router;
