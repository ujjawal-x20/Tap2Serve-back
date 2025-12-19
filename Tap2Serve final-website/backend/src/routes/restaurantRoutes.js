const express = require('express');
const { getRestaurants, createRestaurant, deleteRestaurant } = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getRestaurants)
    .post(protect, authorize('owner', 'admin'), createRestaurant);

router.route('/:id')
    .delete(protect, authorize('owner', 'admin'), deleteRestaurant);

module.exports = router;
