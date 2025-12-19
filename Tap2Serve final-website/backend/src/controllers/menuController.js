const Menu = require('../models/Menu');
const AuditLog = require('../models/AuditLog');

// @desc    Get menu for a restaurant
// @route   GET /api/v1/menu
// @access  Private
const getMenu = async (req, res) => {
    const menu = await Menu.find({ restaurantId: req.restaurantId });
    const formattedMenu = menu.map(item => ({
        ...item.toObject(),
        id: item._id
    }));
    res.json(formattedMenu);
};

// @desc    Add menu item
// @route   POST /api/v1/menu
// @access  Private
const createMenuItem = async (req, res) => {
    const { name, category, price, image_url } = req.body;

    const menuItem = await Menu.create({
        restaurantId: req.restaurantId,
        name,
        category,
        price,
        imageUrl: image_url,
        status: 'pending'
    });

    await AuditLog.create({
        userId: req.user._id,
        restaurantId: req.restaurantId,
        action: 'Menu Request',
        details: `Requested: ${name} (${category}) for approval`,
        severity: 'warning'
    });

    res.status(201).json({ success: true, id: menuItem._id });
};

// @desc    Delete menu item
// @route   DELETE /api/v1/menu/:id
// @access  Private
const deleteMenuItem = async (req, res) => {
    const menuItem = await Menu.findOne({ _id: req.params.id, restaurantId: req.restaurantId });

    if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
    }

    await AuditLog.create({
        userId: req.user._id,
        restaurantId: req.restaurantId,
        action: 'Menu Item Deleted',
        details: `Deleted ${menuItem.name}`,
        severity: 'warning'
    });

    await menuItem.deleteOne();
    res.json({ success: true, message: 'Item deleted' });
};

module.exports = { getMenu, createMenuItem, deleteMenuItem };
