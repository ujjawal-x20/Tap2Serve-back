const mongoose = require('mongoose');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const Inventory = require('../models/Inventory');
const { checkStock } = require('./inventoryController');
const { emitEvent } = require('../utils/socket');

// @desc    Get all orders for a restaurant
// @route   GET /api/v1/orders
// @access  Private
// @desc    Get all orders for a restaurant
// @route   GET /api/v1/orders
// @access  Private
const getOrders = async (req, res) => {
    const { status, dateFrom, dateTo, table, branchId, restaurantId } = req.query;
    let query = {};

    // Tenant Isolation: If user has a restaurantId, force it.
    if (req.restaurantId) {
        query.restaurantId = req.restaurantId;
    } else if (restaurantId) {
        // Admin viewing specific restaurant
        query.restaurantId = restaurantId;
    }

    // Branch Filtering for Staff/Manager
    if (req.user && req.user.branchId) {
        query.branchId = req.user.branchId;
    } else if (branchId) {
        // Sanitize branchId to prevent injection if it's an object
        query.branchId = String(branchId);
    }

    if (status) query.status = String(status);
    if (table) query.tableNo = String(table);
    if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const orders = await Order.find(query).sort('-createdAt');
    const formattedOrders = orders.map(order => ({
        ...order.toObject(),
        id: order._id
    }));
    res.json(formattedOrders);
};

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
const createOrder = async (req, res) => {
    const { table_no, items, total, restaurantId, paymentId, branchId, idempotencyKey } = req.body;
    const finalRestaurantId = req.restaurantId || restaurantId;
    const userId = req.user ? req.user._id : null;

    // 1. Idempotency Check
    if (idempotencyKey) {
        const existingOrder = await Order.findOne({ idempotencyKey, restaurantId: finalRestaurantId });
        if (existingOrder) {
            return res.json({ success: true, id: existingOrder._id, message: "Order already processed" });
        }
    }

    const formattedItems = items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.qty || item.quantity || 1,
        menuId: item.menuId
    }));

    // Start Session for Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. Validate & Deduct Stock Atomically per item
        for (const item of formattedItems) {
            if (item.menuId) {
                const result = await Inventory.findOneAndUpdate(
                    {
                        restaurantId: finalRestaurantId,
                        menuId: item.menuId,
                        quantity: { $gte: item.quantity }
                    },
                    { $inc: { quantity: -item.quantity } },
                    { session, new: true }
                );

                if (!result) {
                    throw new Error(`Insufficient stock for ${item.name}`);
                }
            }
        }

        // 3. Create Order
        const order = await Order.create([{
            restaurantId: finalRestaurantId,
            branchId: branchId || null,
            userId: userId,
            tableNo: table_no,
            items: formattedItems,
            total,
            status: 'New',
            idempotencyKey,
            paymentId: paymentId || null
        }], { session });

        await session.commitTransaction();
        session.endSession();

        if (req.user) {
            await AuditLog.create({
                userId: req.user._id,
                restaurantId: finalRestaurantId,
                action: 'New Order',
                details: `Order #${order[0]._id} placed for Table ${table_no}`,
                severity: 'info'
            });
        }

        res.status(201).json({ success: true, id: order[0]._id });

        // 4. Emit Socket Event for real-time dashboard
        emitEvent(finalRestaurantId.toString(), 'new_order', {
            id: order[0]._id,
            tableNo: table_no,
            total: total
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Order Transaction Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Order processing failed"
        });
    }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
        { _id: req.params.id, restaurantId: req.restaurantId },
        { status },
        { new: true }
    );

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
        success: true,
        order: {
            ...order.toObject(),
            id: order._id
        }
    });

    // Emit Status Update
    emitEvent(order.restaurantId.toString(), 'order_status_updated', {
        id: order._id,
        status: status
    });
};

// @desc    Generate Invoice ID
// @route   PUT /api/v1/orders/:id/invoice
// @access  Private (Staff)
const generateInvoice = async (req, res) => {
    try {
        let order = await Order.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.invoiceId) return res.json(order);

        // Robust ID generation using crypto
        const crypto = require('crypto');
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
        const newInvoiceId = `INV-${dateStr}-${randomSuffix}`;

        order = await Order.findOneAndUpdate(
            {
                _id: req.params.id,
                restaurantId: req.restaurantId,
                invoiceId: { $exists: false }
            },
            { $set: { invoiceId: newInvoiceId } },
            { new: true }
        );

        if (!order) {
            order = await Order.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getOrders, createOrder, updateOrderStatus, generateInvoice };
