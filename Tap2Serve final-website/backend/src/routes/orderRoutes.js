const express = require('express');
const { getOrders, createOrder, updateOrderStatus, generateInvoice } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const router = express.Router();

router.post('/public', createOrder); // Public access

router.use(protect);
router.use(tenantHandler);

router.route('/')
    .get(getOrders)
    .post(createOrder);

router.route('/:id/status')
    .put(updateOrderStatus);

router.route('/:id/invoice')
    .put(generateInvoice);

module.exports = router;
