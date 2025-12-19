const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function startInMemoryServer() {
    try {
        console.log('🚀 Starting MongoDB Memory Server...');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        // Set Env Vars BEFORE requiring server.js
        process.env.MONGO_URI = uri;
        process.env.MONGODB_URI = uri;
        process.env.PORT = 3002;
        process.env.NODE_ENV = 'development'; // Ensure morgan logs
        process.env.JWT_SECRET = 'test_secret_for_memory_db';

        console.log(`✅ In-Memory DB running at: ${uri}`);

        // Seed Data
        await mongoose.connect(uri);
        console.log('🌱 Seeding Admin User...');

        // Model has pre-save hook that hashes password, so pass plain text
        await User.create({
            name: 'Super Admin',
            email: 'admin@tap2serve.com',
            password: 'admin123',
            role: 'admin',
            status: 'active'
        });
        console.log('👤 Admin Created: admin@tap2serve.com / admin123');

        // Start the Main App
        console.log('🔌 Starting Express Server...');
        require('./server.js');

    } catch (err) {
        console.error('❌ Failed to start memory server:', err);
    }
}

startInMemoryServer();
