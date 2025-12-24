const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Menu = require('./src/models/Menu');
const Restaurant = require('./src/models/Restaurant');

dotenv.config();

const createTestMenu = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const restaurant = await Restaurant.findOne({ name: 'Test Restaurant' });

        if (!restaurant) {
            console.log('❌ Test restaurant not found. Run create-test-owner.js first');
            process.exit(1);
        }

        // Check if menu items already exist
        const existingMenu = await Menu.findOne({ restaurantId: restaurant._id });

        if (existingMenu) {
            console.log('⚠️  Menu items already exist for Test Restaurant');
            const count = await Menu.countDocuments({ restaurantId: restaurant._id });
            console.log(`Found ${count} menu items`);
            process.exit(0);
        }

        const menuItems = [
            {
                restaurantId: restaurant._id,
                name: 'Margherita Pizza',
                name_hi: 'मार्घेरिटा पिज़्ज़ा',
                description_en: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
                description_hi: 'टमाटर सॉस, मोज़ेरेला और ताजा तुलसी के साथ क्लासिक पिज्जा',
                category: 'Main',
                price: 350,
                available: true,
                status: 'approved'
            },
            {
                restaurantId: restaurant._id,
                name: 'Caesar Salad',
                name_hi: 'सीजर सलाद',
                description_en: 'Fresh romaine lettuce with Caesar dressing and croutons',
                description_hi: 'सीजर ड्रेसिंग और क्रूटन के साथ ताजा रोमेन लेटस',
                category: 'Starter',
                price: 200,
                available: true,
                status: 'approved'
            },
            {
                restaurantId: restaurant._id,
                name: 'Grilled Chicken',
                name_hi: 'ग्रिल्ड चिकन',
                description_en: 'Tender grilled chicken breast with herbs',
                description_hi: 'जड़ी-बूटियों के साथ कोमल ग्रिल्ड चिकन ब्रेस्ट',
                category: 'Main',
                price: 450,
                available: true,
                status: 'approved'
            },
            {
                restaurantId: restaurant._id,
                name: 'Chocolate Lava Cake',
                name_hi: 'चॉकलेट लावा केक',
                description_en: 'Warm chocolate cake with molten center',
                description_hi: 'पिघले हुए केंद्र के साथ गर्म चॉकलेट केक',
                category: 'Dessert',
                price: 180,
                available: true,
                status: 'approved'
            },
            {
                restaurantId: restaurant._id,
                name: 'Fresh Lemonade',
                name_hi: 'ताजा नींबू पानी',
                description_en: 'Refreshing homemade lemonade',
                description_hi: 'ताज़ा घर का बना नींबू पानी',
                category: 'Drink',
                price: 80,
                available: true,
                status: 'approved'
            }
        ];

        await Menu.insertMany(menuItems);

        console.log('\n✅ Test menu created successfully!');
        console.log(`Added ${menuItems.length} items to ${restaurant.name}`);
        console.log('\nMenu Items:');
        menuItems.forEach((item, i) => {
            console.log(`${i + 1}. ${item.name} - ₹${item.price} (${item.category})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createTestMenu();
