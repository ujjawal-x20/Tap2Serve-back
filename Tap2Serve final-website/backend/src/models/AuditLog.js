const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    action: { type: String, required: true },
    details: { type: String },
    severity: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
