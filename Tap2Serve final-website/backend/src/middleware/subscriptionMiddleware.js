const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');

const PLAN_LIMITS = {
    Basic: { maxItems: 10 },
    Standard: { maxItems: 50 },
    Premium: { maxItems: Infinity }
};

exports.checkFeatureLimit = async (req, res, next) => {
    try {
        const restaurantId = req.user.restaurantId;
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const plan = restaurant.plan || 'Basic';
        const limits = PLAN_LIMITS[plan];

        // Check menu item limit if attempting to add an item
        if (req.method === 'POST' && req.originalUrl.includes('/menu')) {
            const itemCount = await Menu.countDocuments({ restaurantId });
            if (itemCount >= limits.maxItems) {
                return res.status(403).json({
                    message: `Limit reached: Your ${plan} plan allows only ${limits.maxItems} items. Upgrade to add more.`
                });
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};
