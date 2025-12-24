const Inventory = require('../models/Inventory');
const Menu = require('../models/Menu');

// @desc    Get inventory for a restaurant
// @route   GET /api/v1/inventory
const getInventory = async (req, res) => {
    const query = {};
    if (req.restaurantId) query.restaurantId = req.restaurantId;
    if (req.user.branchId) query.branchId = req.user.branchId;

    const inventory = await Inventory.find(query).populate('menuId', 'name');
    res.json(inventory);
};

// @desc    Update stock level
// @route   PUT /api/v1/inventory/:menuId
const updateStock = async (req, res) => {
    const { quantity, lowStockThreshold } = req.body;

    const query = { restaurantId: req.restaurantId, menuId: req.params.menuId };
    if (req.user.branchId) query.branchId = req.user.branchId;

    const updateData = {
        restaurantId: req.restaurantId,
        menuId: req.params.menuId,
        quantity,
        lowStockThreshold: lowStockThreshold || 5,
    };
    if (req.user.branchId) updateData.branchId = req.user.branchId;

    // Upsert inventory record
    const inventory = await Inventory.findOneAndUpdate(
        query,
        updateData,
        { new: true, upsert: true }
    );

    res.json({ success: true, inventory });
};

// @desc    Check stock availability (Internal Helper)
const checkStock = async (restaurantId, items) => {
    for (const item of items) {
        // Skip if no menuId (custom item?)
        if (!item.menuId) continue;

        const inv = await Inventory.findOne({ restaurantId, menuId: item.menuId });

        // If no inventory record exists, assume unlimited stock (or 0 depending on policy - here unlimited for backward compat unless set)
        if (inv && inv.quantity < item.quantity) {
            return { available: false, item: item.name, current: inv.quantity };
        }
    }
    return { available: true };
};

module.exports = { getInventory, updateStock, checkStock };
