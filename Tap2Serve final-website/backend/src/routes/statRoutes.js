const express = require('express');
const { getDashboardStats, getReports, getAdminStats } = require('../controllers/statController');
const { protect, authorize } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const router = express.Router();

router.use(protect);

router.get('/dashboard', tenantHandler, getDashboardStats);
router.get('/reports', tenantHandler, getReports);
router.get('/admin', authorize('admin'), getAdminStats);

module.exports = router;
