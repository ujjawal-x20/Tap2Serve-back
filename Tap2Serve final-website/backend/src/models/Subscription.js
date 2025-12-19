const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
        unique: true
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    planId: {
        type: String,
        enum: ['price_basic', 'price_standard', 'price_premium'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'past_due', 'canceled', 'incomplete'],
        default: 'active'
    },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
