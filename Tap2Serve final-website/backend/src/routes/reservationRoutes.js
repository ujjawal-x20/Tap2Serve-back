const express = require('express');
const { getReservations, createReservation, updateReservationStatus } = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const router = express.Router();

// Public route for creating reservation
router.post('/public', createReservation);

// Private routes
router.use(protect);
router.use(tenantHandler);

router.route('/')
    .get(getReservations)
    .post(createReservation);

router.route('/:id')
    .put(updateReservationStatus);

module.exports = router;
