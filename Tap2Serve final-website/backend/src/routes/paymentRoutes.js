const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Stripe webhook must use raw body (must be defined before other body parsers if possible, 
// or use express.raw({type: 'application/json'}) in the route)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protect other routes
router.post('/create-session', protect, createCheckoutSession);

module.exports = router;
