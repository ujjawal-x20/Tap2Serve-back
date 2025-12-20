const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    tableNo: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    tags: [{ type: String }], // e.g., "Food Quality", "Service", "Ambiance"
    isVisible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
