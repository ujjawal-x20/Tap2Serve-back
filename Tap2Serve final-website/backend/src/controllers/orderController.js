const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');

// @desc    Get all orders for a restaurant
// @route   GET /api/v1/orders
// @access  Private
const getOrders = async (req, res) => {
    const orders = await Order.find({ restaurantId: req.restaurantId }).sort('-createdAt');
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
    const { table_no, items, total } = req.body;

    const formattedItems = items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.qty
    }));

    const order = await Order.create({
        restaurantId: req.restaurantId,
        userId: req.user._id,
        tableNo: table_no,
        items: formattedItems,
        total,
        status: 'New'
    });

    await AuditLog.create({
        userId: req.user._id,
        restaurantId: req.restaurantId,
        action: 'New Order',
        details: `Order #${order._id} placed for Table ${tableNo}`,
        severity: 'info'
    });

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

module.exports = { getOrders, createOrder, updateOrderStatus };
