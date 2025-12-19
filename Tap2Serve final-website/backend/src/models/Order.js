const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tableNo: { type: String, required: true },
    items: [{
        menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 }
    }],
    status: { type: String, enum: ['New', 'Cooking', 'Ready', 'Served', 'Paid'], default: 'New' },
    total: { type: Number, required: true },
}, { timestamps: true });

orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
