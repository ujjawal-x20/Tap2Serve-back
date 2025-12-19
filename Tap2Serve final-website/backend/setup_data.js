const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002/api/v1';

async function setupData() {
    try {
        // 1. Register Owner
        console.log('🔄 1. Registering Native Owner...');
        await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Native Owner',
                email: 'native_owner@example.com',
                password: 'password123',
                role: 'owner'
            })
        });

        // 2. Login Admin
        console.log('🔄 2. Logging in as Admin...');
        const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@tap2serve.com',
                password: 'admin123',
                role: 'admin'
            })
        });
        const adminData = await adminLoginRes.json();
        const adminToken = adminData.token;
        if (!adminToken) throw new Error('Admin login failed');

        // 3. Get Users to find Owner ID
        console.log('🔄 3. Fetching Users...');
        const usersRes = await fetch(`${BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const users = await usersRes.json();
        const ownerUser = users.find(u => u.email === 'native_owner@example.com');
        if (!ownerUser) throw new Error('Owner user not found');

        // 4. Approve Owner
        console.log(`🔄 4. Approving Owner (ID: ${ownerUser.id})...`);
        const approveRes = await fetch(`${BASE_URL}/admin/users/${ownerUser.id}/approve`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const approveData = await approveRes.json();
        if (!approveData.success) throw new Error('Approval failed');
        console.log('✅ Owner Approved.');

        // 5. Login Owner
        console.log('🔄 5. Logging in as Native Owner...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'native_owner@example.com',
                password: 'password123',
                role: 'owner'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error('Owner login failed');
        console.log('✅ Owner Logged In.');

        // 6. Create Restaurant
        console.log('🔄 6. Creating Restaurant "Native Grill"...');
        const restRes = await fetch(`${BASE_URL}/restaurants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Native Grill',
                location: 'Downtown',
                plan: 'Premium'
            })
        });
        const restData = await restRes.json();
        console.log('Restaurant Creation Response:', restData.success ? 'Success' : restData.message);

        // 7. Add Menu Item
        console.log('🔄 7. Adding Menu Item "Integration Burger"...');
        const menuRes = await fetch(`${BASE_URL}/menu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Integration Burger',
                category: 'Mains',
                price: 150,
                image_url: 'https://via.placeholder.com/150'
            })
        });
        const menuData = await menuRes.json();
        console.log('Menu Item Response:', menuData.success ? 'Success' : menuData.message);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

setupData();
