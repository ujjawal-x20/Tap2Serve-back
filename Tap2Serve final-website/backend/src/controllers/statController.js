const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');
const os = require('os');

// @desc    Get dashboard stats for owner
// @route   GET /api/v1/dashboard/stats
const getDashboardStats = async (req, res) => {
    const restaurantId = req.restaurantId;

    const orders = await Order.find({ restaurantId });
    const paidOrders = orders.filter(o => ['Paid', 'Served'].includes(o.status));

    const revenue = paidOrders.reduce((acc, curr) => acc + curr.total, 0);
    const activeGuests = orders.filter(o => !['Paid', 'Served'].includes(o.status)).length * 2;

    res.json({
        revenue,
        orders: orders.length,
        active_guests: activeGuests
    });
};

// @desc    Get detailed reports with aggregation
// @route   GET /api/v1/stats/reports
const getReports = async (req, res) => {
    const restaurantId = req.user.restaurantId;

    try {
        const stats = await Order.aggregate([
            {
                $match: {
                    restaurantId: new mongoose.Types.ObjectId(restaurantId),
                    status: { $in: ['Paid', 'Served'] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$total" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { $limit: 30 }
        ]);

        const sources = await Order.aggregate([
            { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({ trends: stats, statusDistribution: sources });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin global stats
// @route   GET /api/v1/admin/stats
const getAdminStats = async (req, res) => {
    try {
        const total_users = await User.countDocuments();
        const active_restaurants = await Restaurant.countDocuments({ status: 'Active' });

        // Subscription Analytics
        const subscriptionStats = await Restaurant.aggregate([
            { $group: { _id: "$plan", count: { $sum: 1 } } }
        ]);

        const totalRevenue = await Order.aggregate([
            { $match: { status: { $in: ['Paid', 'Served'] } } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);

        const freeMem = os.freemem();
        const totalMem = os.totalmem();
        const usedMemPercentage = ((totalMem - freeMem) / totalMem) * 100;

        res.json({
            total_users,
            active_restaurants,
            subscriptions: subscriptionStats,
            total_revenue: totalRevenue[0]?.total || 0,
            mrr: totalRevenue[0]?.total || 0, // Alias for Admin Dashboard
            server_health: {
                summary: `${(100 - usedMemPercentage).toFixed(0)}% Free`,
                memory: { used_percentage: usedMemPercentage.toFixed(1) }
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, getReports, getAdminStats };
