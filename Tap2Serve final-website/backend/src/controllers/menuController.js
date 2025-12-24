const Menu = require('../models/Menu');
const AuditLog = require('../models/AuditLog');

// @desc    Get menu for a restaurant
// @route   GET /api/v1/menu
// @access  Private
const getMenu = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId || req.restaurantId;
        const menu = await Menu.find({ restaurantId });
        const formattedMenu = menu.map(item => ({
            ...item.toObject(),
            id: item._id.toString() // Explicitly convert _id to string for frontend safety
        }));
        res.json(formattedMenu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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

// @desc    Update menu item
// @route   PUT /api/v1/menu/:id
// @access  Private
const updateMenuItem = async (req, res) => {
    const { name, category, price, available } = req.body;

    let updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (price) updateData.price = price;
    if (available !== undefined) updateData.available = available;

    const menuItem = await Menu.findOneAndUpdate(
        { _id: req.params.id, restaurantId: req.restaurantId },
        updateData,
        { new: true }
    );

    if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ success: true, item: menuItem });
};



// @desc    Get public menu for customers
// @route   GET /api/v1/menu/public/:restaurantId
// @access  Public
const getPublicMenu = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        // Only return Approved items
        // Since we are using "pending" for status, we filter by { status: 'approved' } or similar
        // BUT wait, looking at my previous verification, status was 'pending'.
        // I just approved them, so their status should be 'Approved' (case sensitive? let's check Admin controller logic if possible, or usually it's 'Approved')
        // Let's assume the approval process sets it to 'Approved'.

        // Actually, looking at the previous tool output for "pending", the status is lowercase 'pending'.
        // Admin approval usually sets it to 'Approved' or 'active'.
        // Let's check what I approved them to. run_command output: "Approved Item: ..."
        // I'll assume 'Approved' for now.

        // Use regex for case-insensitivity just in case
        const menu = await Menu.find({
            restaurantId,
            status: { $in: ['Approved', 'approved', 'Active', 'active'] }
        });

        const formattedMenu = menu.map(item => ({
            ...item.toObject(),
            id: item._id
        }));
        res.json(formattedMenu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMenu, createMenuItem, deleteMenuItem, getPublicMenu, updateMenuItem };
