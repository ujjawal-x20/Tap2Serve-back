const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
    stripeEventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    payload: { type: Object, required: true },
    status: {
        type: String,
        enum: ['received', 'processed', 'failed'],
        default: 'received'
    },
    error: { type: String },
    retries: { type: Number, default: 0 },
    lastRetryAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
