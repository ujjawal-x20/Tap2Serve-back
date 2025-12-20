const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const { getStats } = require('../controllers/analyticsController');

const router = express.Router();

router.use(protect);
router.use(tenantHandler);

router.get('/dashboard', getStats);

module.exports = router;
