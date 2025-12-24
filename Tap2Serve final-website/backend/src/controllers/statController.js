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

        // Fetch all orders for this restaurant
        // Optimisation: In a real app, you'd index timestamps and only fetch needed range
        // Fetch all orders for this restaurant (or all if Admin/Support and no ID forced)
        let query = {};
        if (restaurantId) {
            query.restaurantId = restaurantId;
        }

        const allOrders = await Order.find(query);

        // --- CORE METRICS ---
        const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);
        const yesterdayOrders = allOrders.filter(o => {
            const d = new Date(o.createdAt);
            return d >= yesterday && d < today;
        });

        // 1. Revenue
        const calculateRevenue = (orders) => orders
            .filter(o => ['Paid', 'Served'].includes(o.status))
            .reduce((acc, curr) => acc + curr.total, 0);

        const revenueToday = calculateRevenue(todayOrders);
        const revenueYesterday = calculateRevenue(yesterdayOrders);
        const revenueDiff = revenueToday - revenueYesterday;
        const revenueGrowth = revenueYesterday > 0 ? (revenueDiff / revenueYesterday) * 100 : (revenueToday > 0 ? 100 : 0);

        // 2. Orders Count
        const ordersDiff = todayOrders.length - yesterdayOrders.length;
        const ordersGrowth = yesterdayOrders.length > 0 ? (ordersDiff / yesterdayOrders.length) * 100 : (todayOrders.length > 0 ? 100 : 0);

        // 3. Active Guests (approx 2 per active table/order)
        const activeOrders = allOrders.filter(o => ['New', 'Cooking', 'Ready', 'Served'].includes(o.status));
        const activeGuests = activeOrders.length * 2;

        // 4. Avg Prep Time (Mock logic based on status updates if timestamps missing, or real if available)
        // Since we don't strictly track status change timestamps in the simple schema, we'll estimate
        // active prep time for 'Cooking' items or average completed time.
        // For MVP: let's calc avg time for 'Served' orders today from createdAt to updatedAt
        const servedToday = todayOrders.filter(o => o.status === 'Served' || o.status === 'Paid');
        let avgPrepMinutes = 0;
        if (servedToday.length > 0) {
            const totalTime = servedToday.reduce((acc, o) => {
                // If updatedAt is accessible
                const start = new Date(o.createdAt);
                const end = new Date(o.updatedAt);
                return acc + (end - start);
            }, 0);
            avgPrepMinutes = Math.round((totalTime / servedToday.length) / 60000); // ms to min
        }

        // 5. Kitchen Load
        // Active orders count vs "Capacity" (mock capacity 20)
        const kitchenLoadValue = Math.min(Math.round((activeOrders.length / 20) * 100), 100);

        // 6. Trending Items (Top 3 today)
        const itemMap = {};
        todayOrders.forEach(o => {
            o.items.forEach(i => {
                itemMap[i.name] = (itemMap[i.name] || 0) + (i.quantity || i.qty || 1);
            });
        });
        const trending = Object.entries(itemMap)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 3);

        res.json({
            revenue: revenueToday,
            revenue_growth: revenueGrowth,
            revenue_diff: revenueDiff,
            orders: todayOrders.length,
            orders_growth: ordersGrowth,
            active_guests: activeGuests,
            avg_prep_time: avgPrepMinutes,
            kitchen_load: {
                value: kitchenLoadValue,
                active_count: activeOrders.length
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
