const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    name_hi: { type: String },
    description_en: { type: String },
    description_hi: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    imageUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' }
}, { timestamps: true });

menuSchema.index({ restaurantId: 1 });
menuSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Menu', menuSchema);
