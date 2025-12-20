const WaiterCall = require('../models/WaiterCall');
const Branch = require('../models/Branch');

// Guest: Create a call
const createCall = async (req, res) => {
    try {
        const { restaurantId, tableNo, type, branchId } = req.body;

        // Auto-assign first branch if not provided (Backward compatibility)
        let finalBranchId = branchId;
        if (!finalBranchId) {
            const mainBranch = await Branch.findOne({ restaurantId });
            if (mainBranch) finalBranchId = mainBranch._id;
        }

        const call = await WaiterCall.create({
            restaurantId,
            branchId: finalBranchId,
            tableNo,
            type
        });
        res.status(201).json(call);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Staff: List calls
const getCalls = async (req, res) => {
    try {
        const query = { restaurantId: req.restaurantId, status: 'Pending' };
        if (req.user.branchId) query.branchId = req.user.branchId;

        const calls = await WaiterCall.find(query).sort({ createdAt: 1 });
        res.json(calls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Staff: Resolve call
const resolveCall = async (req, res) => {
    try {
        const call = await WaiterCall.findOneAndUpdate(
            { _id: req.params.id, restaurantId: req.restaurantId },
            { status: 'Resolved', resolvedAt: new Date() },
            { new: true }
        );
        res.json(call);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCall, getCalls, resolveCall };
