const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');

const createFeedback = async (req, res) => {
    try {
        const { restaurantId, branchId, orderId, tableNo, rating, comment, tags } = req.body;
        const feedback = await Feedback.create({
            restaurantId,
            branchId,
            orderId,
            tableNo,
            rating,
            comment,
            tags
        });
        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFeedback = async (req, res) => {
    try {
        const query = { restaurantId: req.restaurantId };
        if (req.user.branchId) query.branchId = req.user.branchId;

        const feedbacks = await Feedback.find(query).sort('-createdAt');
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFeedbackStats = async (req, res) => {
    try {
        const query = { restaurantId: req.restaurantId };
        if (req.user.branchId) query.branchId = req.user.branchId;

        const matchStage = { restaurantId: new mongoose.Types.ObjectId(req.restaurantId) };
        if (req.user.branchId) matchStage.branchId = new mongoose.Types.ObjectId(req.user.branchId);

        const stats = await Feedback.aggregate([
            { $match: matchStage },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        res.json(stats.length ? stats[0] : { avgRating: 0, count: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createFeedback, getFeedback, getFeedbackStats };
