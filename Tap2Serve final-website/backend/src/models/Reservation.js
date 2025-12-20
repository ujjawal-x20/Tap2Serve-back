const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    tableNo: { type: String, required: true },
    customerName: { type: String, required: true },
    contactNumber: { type: String },
    time: { type: Date, required: true },
    guests: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' }
}, { timestamps: true });

reservationSchema.index({ restaurantId: 1, time: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
