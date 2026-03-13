const express = require('express');
const router = express.Router();
const { addEvent, getEvents, updateEvent, deleteEvent } = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const EVENT_ROLES = ['producer', 'certifier', 'distributor', 'retailer'];

// POST /api/events — add event to a batch
router.post('/', protect, authorize(...EVENT_ROLES), addEvent);

// GET /api/events/:batchId — get all events for a batch (any authenticated user)
router.get('/:batchId', protect, getEvents);

// PATCH /api/events/:id
router.patch('/:id', protect, authorize(...EVENT_ROLES), updateEvent);

// DELETE /api/events/:id
router.delete('/:id', protect, authorize(...EVENT_ROLES), deleteEvent);

module.exports = router;
