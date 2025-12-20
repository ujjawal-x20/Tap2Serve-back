const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logger = require('../utils/logger');

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            // Check role
            if (role && role !== user.role) {
                return res.status(403).json({ message: `Role mismatch: registered as '${user.role}'` });
            }

            // Check status
            if (user.status === 'pending') {
                return res.status(403).json({ message: 'Account Pending Approval' });
            }
            if (user.status === 'suspended') {
                return res.status(403).json({ message: 'Account Suspended' });
            }

            res.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    restaurantId: user.restaurantId
                },
                token: generateToken(user._id),
                redirect: user.role === 'admin' ? '../testing-page/admin.html' : '../testing-page/dashboard.html'
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
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
        status: 'pending'
    });

    if (user) {
        res.status(201).json({
            success: true,
            message: 'Registration successful! Verification pending.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = { loginUser, registerUser };
