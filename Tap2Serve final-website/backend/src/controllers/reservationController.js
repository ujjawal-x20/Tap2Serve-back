const Reservation = require('../models/Reservation');

// @desc    Get all reservations
// @route   GET /api/v1/reservations
const getReservations = async (req, res) => {
    const query = { restaurantId: req.restaurantId };
    if (req.user.branchId) query.branchId = req.user.branchId;

    const reservations = await Reservation.find(query).sort('time');
    res.json(reservations);
};

// @desc    Create a reservation
// @route   POST /api/v1/reservations
const createReservation = async (req, res) => {
    const { tableNo, customerName, contactNumber, time, guests, restaurantId, branchId } = req.body;

    // Support public reservation (no req.user)
    const finalRestaurantId = req.restaurantId || restaurantId;

    // Auto-assign branch if public, or use Staff's branch
    let finalBranchId = branchId;
    if (req.user && req.user.branchId) finalBranchId = req.user.branchId;

    const reservation = await Reservation.create({
        restaurantId: finalRestaurantId,
        branchId: finalBranchId,
        tableNo,
        customerName,
        contactNumber,
        time,
        guests
    });

    res.status(201).json({ success: true, reservation });
};

// @desc    Update reservation status
// @route   PUT /api/v1/reservations/:id
const updateReservationStatus = async (req, res) => {
    const { status } = req.body;

    const query = { _id: req.params.id, restaurantId: req.restaurantId };
    if (req.user.branchId) query.branchId = req.user.branchId;

    const reservation = await Reservation.findOneAndUpdate(
        query,
        { status },
        { new: true }
    );
    res.json(reservation);
};

module.exports = { getReservations, createReservation, updateReservationStatus };
