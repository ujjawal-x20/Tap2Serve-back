const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const { createFeedback, getFeedback, getFeedbackStats } = require('../controllers/feedbackController');

const router = express.Router();

// Public (Guest)
router.post('/public', createFeedback);

// Protected (Staff)
router.use(protect);
router.use(tenantHandler);
router.get('/', getFeedback);
router.get('/stats', getFeedbackStats);

module.exports = router;
