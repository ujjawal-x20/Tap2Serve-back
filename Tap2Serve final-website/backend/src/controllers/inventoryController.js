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

// @desc    Check stock availability (Internal Helper) - Fixed N+1 query
const checkStock = async (restaurantId, items) => {
    const menuIds = items.map(i => i.menuId).filter(id => id);
    if (menuIds.length === 0) return { available: true };

    const invRecords = await Inventory.find({
        restaurantId,
        menuId: { $in: menuIds }
    });

    const invMap = {};
    invRecords.forEach(r => invMap[r.menuId.toString()] = r.quantity);

    for (const item of items) {
        if (!item.menuId) continue;
        const currentQty = invMap[item.menuId.toString()];

        // If inventory record exists, check stock. If not, assume unlimited.
        if (currentQty !== undefined && currentQty < item.quantity) {
            return { available: false, item: item.name, current: currentQty };
        }
    }
    return { available: true };
};

module.exports = { getInventory, updateStock, checkStock };
