const User = require('../models/User');
const Menu = require('../models/Menu');
const AuditLog = require('../models/AuditLog');
const Config = require('../models/Config');

// @desc    Approve user
// @route   PUT /api/v1/admin/users/:id/approve
const approveUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await AuditLog.create({
        userId: req.user._id,
        action: 'User Approved',
        details: `Approved user ID ${user._id} (${user.email})`,
        severity: 'success'
    });

    res.json({ success: true });
};

// @desc    Get pending menu items
// @route   GET /api/v1/admin/menu/pending
const getPendingMenu = async (req, res) => {
    const menu = await Menu.find({ status: 'pending' }).populate('restaurantId', 'name');
    const formattedMenu = menu.map(m => ({
        ...m.toObject(),
        id: m._id
    }));
    res.json(formattedMenu);
};

// @desc    Approve menu item
// @route   PUT /api/v1/admin/menu/:id/approve
const approveMenu = async (req, res) => {
    const { image_url } = req.body;
    const menu = await Menu.findByIdAndUpdate(req.params.id, {
        status: 'approved',
        imageUrl: image_url
    }, { new: true });

    if (!menu) return res.status(404).json({ message: 'Item not found' });
    res.json({ success: true });
};

// @desc    Reject menu item
// @route   DELETE /api/v1/admin/menu/:id/reject
const rejectMenu = async (req, res) => {
    const menu = await Menu.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!menu) return res.status(404).json({ message: 'Item not found' });
    res.json({ success: true });
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
const getUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    const formattedUsers = users.map(u => ({
        ...u.toObject(),
        id: u._id
    }));
    res.json(formattedUsers);
};

// @desc    Get audit logs
// @route   GET /api/v1/admin/logs
const getLogs = async (req, res) => {
    const logs = await AuditLog.find({}).sort('-createdAt').limit(50).populate('userId', 'name email');
    res.json(logs);
};

// @desc    Get system configuration
// @route   GET /api/v1/admin/config
const getConfig = async (req, res) => {
    const configs = await Config.find({});
    const configMap = {};
    configs.forEach(c => configMap[c.key] = c.value);
    res.json(configMap);
};

// @desc    Update system configuration
// @route   POST /api/v1/admin/config
const updateConfig = async (req, res) => {
    const { key, value } = req.body;
    await Config.findOneAndUpdate(
        { key },
        { value, updatedAt: Date.now() },
        { upsert: true, new: true }
    );
    res.json({ success: true });
};

// @desc    Create new user (Admin)
// @route   POST /api/v1/admin/users
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'owner',
        status: 'active' // Admin users are active by default
    });

    await AuditLog.create({
        userId: req.user._id,
        action: 'User Created',
        details: `Created user ${name} (${email}) as ${role}`,
        severity: 'success'
    });

    res.status(201).json({ success: true, user: { ...user.toObject(), id: user._id } });
};

// @desc    Delete user (Admin)
// @route   DELETE /api/v1/admin/users/:id
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    await AuditLog.create({
        userId: req.user._id,
        action: 'User Deleted',
        details: `Deleted user ${user.name} (${user.email})`,
        severity: 'important'
    });

    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
};

module.exports = {
    approveUser,
    getPendingMenu,
    approveMenu,
    rejectMenu,
    getUsers,
    createUser,
    deleteUser,
    getLogs,
    getConfig,
    updateConfig
};
