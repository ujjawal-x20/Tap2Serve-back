const Order = require('../models/Order');

const getStats = async (req, res) => {
    try {
        const query = { restaurantId: req.restaurantId };
        if (req.user.branchId) query.branchId = req.user.branchId;

        const totalOrders = await Order.countDocuments(query);
        const revenueAgg = await Order.aggregate([
            { $match: { restaurantId: req.restaurantId, status: { $in: ['Paid', 'Completed', 'Served'] } } }, // Add branch filter in match if needed
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // Active Guests (Orders not Paid/Served/Completed, x2 approx)
        const activeOrdersCount = await Order.countDocuments({
            ...query,
            status: { $nin: ['Paid', 'Served', 'Completed', 'Cancelled'] }
        });
        const activeGuests = activeOrdersCount * 2; // Estimating 2 guests per table

        res.json({
            orders: totalOrders, // Alias for dashboard compatibility
            totalOrders,
            revenue,
            active_guests: activeGuests,
            topItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStats };
