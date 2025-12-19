const tenantHandler = (req, res, next) => {
    // For Multi-Tenancy:
    // Every request that involves data should have a restaurantId.
    // If the user is an 'owner', they can only access their restaurantId.
    // If the user is 'staff', they are restricted to their assigned restaurantId.
    // Super Admin can access anything.

    if (req.user.role === 'admin') {
        return next();
    }

    const restaurantId = req.user.restaurantId;
    if (!restaurantId) {
        return res.status(403).json({ message: 'No restaurant associated with this account' });
    }

    // Attach restaurantId to request for use in controllers
    req.restaurantId = restaurantId;
    next();
};

module.exports = tenantHandler;
