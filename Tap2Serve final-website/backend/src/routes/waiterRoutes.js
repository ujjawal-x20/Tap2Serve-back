const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const { createCall, getCalls, resolveCall } = require('../controllers/waiterController');

const router = express.Router();

// Public route for creating calls (Guests) - No protect middleware, but requires restaurantId in body
router.post('/public', createCall);

// Protected routes for Staff
router.get('/', protect, tenantHandler, getCalls);
router.put('/:id/resolve', protect, tenantHandler, resolveCall);

module.exports = router;
