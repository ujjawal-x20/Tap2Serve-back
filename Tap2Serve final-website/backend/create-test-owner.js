const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');

dotenv.config();

const createTestOwner = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if test owner exists first
        let owner = await User.findOne({ email: 'owner@test.com' });

        if (!owner) {
            // Create owner first
            const hashedPassword = await bcrypt.hash('owner123', 10);

            owner = await User.create({
                name: 'Test Owner',
                email: 'owner@test.com',
                password: hashedPassword,
                role: 'owner',
                status: 'active'
            });
            console.log('✅ Test owner created');
        } else {
            console.log('⚠️  Test owner already exists');
        }

        // Check if test restaurant exists
        let restaurant = await Restaurant.findOne({ name: 'Test Restaurant' });

        if (!restaurant) {
            restaurant = await Restaurant.create({
                name: 'Test Restaurant',
                location: '123 Test Street',
                ownerId: owner._id,
                tableCount: 10,
                status: 'Active',
                plan: 'Premium'
            });
            console.log('✅ Test restaurant created');

            // Update owner with restaurantId
            owner.restaurantId = restaurant._id;
            await owner.save();
            console.log('✅ Owner linked to restaurant');
        } else {
            console.log('⚠️  Test restaurant already exists');

            // Ensure owner is linked
            if (!owner.restaurantId) {
                owner.restaurantId = restaurant._id;
                await owner.save();
                console.log('✅ Owner linked to restaurant');
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Test Account Ready!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email: owner@test.com');
        console.log('Password: owner123');
        console.log('Restaurant:', restaurant.name);
        console.log('Restaurant ID:', restaurant._id);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createTestOwner();
