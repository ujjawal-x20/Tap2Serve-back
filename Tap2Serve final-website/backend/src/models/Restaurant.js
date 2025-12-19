const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['Basic', 'Standard', 'Premium'], default: 'Basic' },
    status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
    revenue: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
