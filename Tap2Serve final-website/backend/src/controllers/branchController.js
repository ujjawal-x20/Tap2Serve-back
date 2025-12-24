const Branch = require('../models/Branch');

const createBranch = async (req, res) => {
    try {
        const { name, address, contactNumber, prepTime, tableConfig } = req.body;
        const branch = await Branch.create({
            restaurantId: req.restaurantId,
            name,
            address,
            contactNumber,
            prepTime,
            tableConfig
        });
        res.status(201).json(branch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBranches = async (req, res) => {
    try {
        const branches = await Branch.find({ restaurantId: req.restaurantId });
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBranch = async (req, res) => {
    try {
        const { name, address, contactNumber, prepTime, tableConfig } = req.body;
        const branch = await Branch.findOneAndUpdate(
            { _id: req.params.id, restaurantId: req.restaurantId },
            { name, address, contactNumber, prepTime, tableConfig },
            { new: true }
        );
        if (!branch) return res.status(404).json({ message: 'Branch not found' });
        res.json(branch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBranch = async (req, res) => {
    try {
        await Branch.findOneAndDelete({ _id: req.params.id, restaurantId: req.restaurantId });
        res.json({ message: 'Branch deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePrepTime = async (req, res) => {
    try {
        // FIXED: Scoped to Branch instead of Global Restaurant
        const branchId = req.user.branchId;
        if (!branchId) return res.status(400).json({ message: "Branch context required" });

        await Branch.findByIdAndUpdate(branchId, { prepTime: req.body.prepTime });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { createBranch, getBranches, updateBranch, deleteBranch, updatePrepTime };
