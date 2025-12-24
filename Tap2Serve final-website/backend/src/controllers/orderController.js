const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const Inventory = require('../models/Inventory');
const { checkStock } = require('./inventoryController');

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
const createOrder = async (req, res) => {
    // Frontend sends table_no and qty; Backend expects tableNo and quantity
    const { table_no, items, total, restaurantId, paymentId, branchId, idempotencyKey } = req.body;

    // Idempotency Check (Spacecraft Reliability)
    if (idempotencyKey) {
        const existingOrder = await Order.findOne({ idempotencyKey, restaurantId });
        if (existingOrder) {
            return res.json({ success: true, id: existingOrder._id, message: "Order already processed" });
        }
    }

    const formattedItems = items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.qty || item.quantity || 1, // Support both formats
        menuId: item.menuId // Ensure menuId is passed from frontend
    }));

    // Support public orders (no req.user) or private orders (req.restaurantId from token)
    const finalRestaurantId = req.restaurantId || restaurantId;
    const userId = req.user ? req.user._id : null;

    // Concurrency Safe Inventory Deduction
    // We iterate and deduct atomically. If one fails, we'd ideally rollback (requires transactions).
    // For this implementation, we will check availability one last time then deduct.

    // 1. Validate all stock first (Check phase)
    const stockCheck = await checkStock(finalRestaurantId, formattedItems);
    if (!stockCheck.available) {
        return res.status(400).json({
            success: false,
            message: `Out of stock: ${stockCheck.item}. Remaining: ${stockCheck.current}`
        });
    }

    // 2. Atomic Deduct (Execute phase)
    // Using simple loop with atomic check to minimize race window
    // 2. Atomic Deduct (Execute phase) with Manual Rollback (Saga Pattern)
    const deductedItems = [];
    try {
        for (const item of formattedItems) {
            if (item.menuId) {
                const result = await Inventory.updateOne(
                    {
                        restaurantId: finalRestaurantId,
                        menuId: item.menuId,
                        quantity: { $gte: item.quantity } // Atomic check
                    },
                    { $inc: { quantity: -item.quantity } }
                );

                if (result.matchedCount === 0 || result.modifiedCount === 0) {
                    // Force error to trigger rollback of previous items
                    throw new Error(`Stock changed during processing for ${item.name}`);
                }
                deductedItems.push(item);
            }
        }
    } catch (error) {
        // ROLLBACK: Re-add quantity for successful items
        console.warn("Order failed, rolling back inventory for items:", deductedItems.map(i => i.name));
        for (const item of deductedItems) {
            await Inventory.updateOne(
                { restaurantId: finalRestaurantId, menuId: item.menuId },
                { $inc: { quantity: item.quantity } }
            );
        }
        return res.status(400).json({
            success: false,
            message: error.message + ". Please try again."
        });
    }

    const order = await Order.create({
        restaurantId: finalRestaurantId,
        branchId: branchId || null,
        userId: userId,
        tableNo: table_no,
        items: formattedItems,
        total,
        status: 'New', // Force 'New' status for all created orders
        idempotencyKey,
        paymentId: paymentId || null // Optional payment
    });

    if (req.user) {
        await AuditLog.create({
            userId: req.user._id,
            restaurantId: finalRestaurantId,
            action: 'New Order',
            details: `Order #${order._id} placed for Table ${table_no}`,
            severity: 'info'
        });
    }

    res.status(201).json({ success: true, id: order._id });
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
};

// @desc    Generate Invoice ID
// @route   PUT /api/v1/orders/:id/invoice
// @access  Private (Staff)
const generateInvoice = async (req, res) => {
    try {
        // Atomic Check-and-Set to prevent duplicate invoices
        // If invoiceId exists, return it. If not, generate new one.

        // 1. Check existing
        let order = await Order.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.invoiceId) return res.json(order);

        // 2. Generate robust ID (Timestamp + Random + BranchCode suffix if needed)
        // Format: INV-YYYYMMDD-HHMMSS-RAND
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        const newInvoiceId = `INV-${dateStr}-${timeStr}-${random}`;

        // 3. Atomic Update: Only file the invoice ID if it is currently null
        order = await Order.findOneAndUpdate(
            {
                _id: req.params.id,
                restaurantId: req.restaurantId,
                invoiceId: { $exists: false } // Crucial: ensure it wasn't set by another process ms ago
            },
            { $set: { invoiceId: newInvoiceId } },
            { new: true }
        );

        // If null, it means race condition beat us (invoiceId became existant), fetch again
        if (!order) {
            order = await Order.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getOrders, createOrder, updateOrderStatus, generateInvoice };
