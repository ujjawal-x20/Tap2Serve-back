const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/v1/auth';

async function testIntegration() {
    console.log("Starting Integration Test...");

    // 1. Health Check
    try {
        const health = await fetch('http://localhost:3000/health');
        const healthData = await health.json();
        console.log(`[Health Check]: ${health.status} - ${JSON.stringify(healthData)}`);
    } catch (e) {
        console.error(`[Health Check] FAILED: ${e.message}`);
    }

    // 2. Register User
    const testUser = {
        name: "Integration Test User",
        email: `test_${Date.now()}@example.com`,
        password: "password123",
        role: "owner"
    };

    let token = null;

    try {
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.json();
        console.log(`[Register]: ${regRes.status} - Success: ${regData.success}`);

        if (regData.success) {
            token = regData.token;
        }
    } catch (e) {
        console.error(`[Register] FAILED: ${e.message}`);
    }

    // 3. Login User
    try {
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password,
                role: testUser.role
            })
        });
        const loginData = await loginRes.json();
        console.log(`[Login]: ${loginRes.status} - Success: ${loginData.success} - Token received: ${!!loginData.token}`);
    } catch (e) {
        console.error(`[Login] FAILED: ${e.message}`);
    }
}

testIntegration();
