const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Mock Payment Init
router.post('/init', (req, res) => {
    // In production, create Stripe Intent here
    res.json({
        success: true,
        clientSecret: 'mock_client_secret_dev',
        paymentId: 'pay_' + Math.random().toString(36).substr(2, 9)
    });
});

// Mock Confirm Payment (Actually updates order)
router.post('/confirm', async (req, res) => {
    const { orderId, paymentId } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = 'Paid';
        order.paymentId = paymentId;
        order.transactionId = 'txn_' + Math.random().toString(36).substr(2, 9);
        await order.save();

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
