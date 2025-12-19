const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Get all restaurants
// @route   GET /api/v1/restaurants
// @access  Private/Admin or Owner
const getRestaurants = async (req, res) => {
    let query = {};
    if (req.user.role !== 'admin') {
        query = { ownerId: req.user._id };
    }

    const restaurants = await Restaurant.find(query);
    const formattedRestaurants = restaurants.map(r => ({
        ...r.toObject(),
        id: r._id
    }));
    res.json(formattedRestaurants);
};

// @desc    Create a restaurant
// @route   POST /api/v1/restaurants
// @access  Private/Owner
const createRestaurant = async (req, res) => {
    const { name, location, plan } = req.body;

    const restaurant = await Restaurant.create({
        name,
        location,
        plan,
        ownerId: req.user._id,
        status: 'Active'
    });

    // Update user's restaurantId if it's their first one or default
    if (!req.user.restaurantId) {
        await User.findByIdAndUpdate(req.user._id, { restaurantId: restaurant._id });
    }

    res.status(201).json({
        success: true,
        restaurant: {
            ...restaurant.toObject(),
            id: restaurant._id
        }
    });
};

// @desc    Delete a restaurant
// @route   DELETE /api/v1/restaurants/:id
// @access  Private/Admin or Owner
const deleteRestaurant = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    await restaurant.deleteOne();
    res.json({ success: true, message: 'Restaurant removed' });
};

module.exports = { getRestaurants, createRestaurant, deleteRestaurant };
