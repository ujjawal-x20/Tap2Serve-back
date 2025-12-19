// Create Admin User Script
// Run this with: node create-admin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@tap2serve.com' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            console.log('Status:', existingAdmin.status);
            process.exit(0);
        }

        // Hash password manually
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Insert directly into MongoDB collection to bypass pre-save hook
        const result = await mongoose.connection.collection('users').insertOne({
            name: 'Admin',
            email: 'admin@tap2serve.com',
            password: hashedPassword,
            role: 'admin',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const adminUser = await User.findById(result.insertedId);

        console.log('✅ Admin user created successfully!');
        console.log('-----------------------------------');
        console.log('Email:', adminUser.email);
        console.log('Password: admin123');
        console.log('Role:', adminUser.role);
        console.log('Status:', adminUser.status);
        console.log('-----------------------------------');
        console.log('You can now log in at: http://localhost:3000/login');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdminUser();
