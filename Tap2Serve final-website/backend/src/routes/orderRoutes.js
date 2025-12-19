const express = require('express');
const { getOrders, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const router = express.Router();

router.use(protect);
router.use(tenantHandler);

router.route('/')
    .get(getOrders)
    .post(createOrder);

router.route('/:id/status')
    .put(updateOrderStatus);

module.exports = router;
