const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');
const os = require('os');

const getDashboardStats = async (req, res) => {
    const restaurantId = req.restaurantId;

    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        let matchQuery = {};
        if (restaurantId) {
            matchQuery.restaurantId = new mongoose.Types.ObjectId(restaurantId);
        }

        const stats = await Order.aggregate([
            { $match: matchQuery },
            {
                $facet: {
                    todayStats: [
                        { $match: { createdAt: { $gt: today } } },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: { $cond: [{ $in: ["$status", ["Paid", "Served"]] }, "$total", 0] } },
                                count: { $sum: 1 },
                                items: { $push: "$items" }
                            }
                        }
                    ],
                    yesterdayStats: [
                        { $match: { createdAt: { $gt: yesterday, $lt: today } } },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: { $cond: [{ $in: ["$status", ["Paid", "Served"]] }, "$total", 0] } },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    activeStats: [
                        { $match: { status: { $in: ["New", "Cooking", "Ready", "Served"] } } },
                        { $group: { _id: null, count: { $sum: 1 } } }
                    ],
                    avgPrep: [
                        {
                            $match: {
                                createdAt: { $gt: today },
                                status: { $in: ["Served", "Paid"] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgMinutes: {
                                    $avg: {
                                        $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 60000]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const todayRes = stats[0].todayStats[0] || { revenue: 0, count: 0, items: [] };
        const yesterdayRes = stats[0].yesterdayStats[0] || { revenue: 0, count: 0 };
        const activeRes = stats[0].activeStats[0] || { count: 0 };
        const avgPrepRes = stats[0].avgPrep[0] || { avgMinutes: 0 };

        const revenueToday = todayRes.revenue;
        const revenueYesterday = yesterdayRes.revenue;
        const revenueDiff = revenueToday - revenueYesterday;
        const revenueGrowth = revenueYesterday > 0 ? (revenueDiff / revenueYesterday) * 100 : (revenueToday > 0 ? 100 : 0);

        const ordersDiff = todayRes.count - yesterdayRes.count;
        const ordersGrowth = yesterdayRes.count > 0 ? (ordersDiff / yesterdayRes.count) * 100 : (todayRes.count > 0 ? 100 : 0);

        // Trending Items manually from the todayRes.items (faceted small subset)
        const itemMap = {};
        todayRes.items.forEach(orderItems => {
            orderItems.forEach(i => {
                itemMap[i.name] = (itemMap[i.name] || 0) + (i.quantity || i.qty || 1);
            });
        });
        const trending = Object.entries(itemMap)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 3);

        res.json({
            revenue: revenueToday,
            revenue_growth: revenueGrowth.toFixed(1),
            revenue_diff: revenueDiff,
            orders: todayRes.count,
            orders_growth: ordersGrowth.toFixed(1),
            active_guests: activeRes.count * 2,
            avg_prep_time: Math.round(avgPrepRes.avgMinutes || 0),
            kitchen_load: {
                value: Math.min(Math.round((activeRes.count / 20) * 100), 100),
                active_count: activeRes.count
            },
            trending_items: trending
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Failed to calculate stats" });
    }
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
