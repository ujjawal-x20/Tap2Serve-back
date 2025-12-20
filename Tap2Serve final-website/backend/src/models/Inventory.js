const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
    quantity: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

inventorySchema.index({ restaurantId: 1, menuId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
