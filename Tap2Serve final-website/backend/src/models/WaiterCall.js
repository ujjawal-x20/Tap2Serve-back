const mongoose = require('mongoose');

const waiterCallSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    tableNo: { type: String, required: true },
    type: { type: String, enum: ['General', 'Bill', 'Water', 'Custom'], default: 'General' },
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
    resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('WaiterCall', waiterCallSchema);
