const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }, // Make optional initially for backward compatibility
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tableNo: { type: String, required: true },
    items: [{
        menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 }
    }],
    paymentId: { type: String },
    invoiceId: { type: String }, // For printable bills
    transactionId: { type: String },
    idempotencyKey: { type: String }, // For preventing double submission
    status: { type: String, enum: ['New', 'Cooking', 'Ready', 'Served', 'Paid', 'Pending', 'Preparing', 'Completed', 'Cancelled'], default: 'New' },
    total: { type: Number, required: true },
}, { timestamps: true });

orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ branchId: 1 });
orderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Order', orderSchema);
