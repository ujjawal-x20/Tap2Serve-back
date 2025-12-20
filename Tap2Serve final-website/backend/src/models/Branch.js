const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    address: { type: String },
    contactNumber: { type: String },
    prepTime: { type: Number, default: 20 }, // mins
    tableConfig: { type: Map, of: [String], default: {} }, // Merge config: "3-4": ["3", "4"]
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure unique branch name per restaurant
branchSchema.index({ restaurantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Branch', branchSchema);
