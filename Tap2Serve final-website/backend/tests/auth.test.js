const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../src/models/User');

describe('Auth API', () => {
    beforeAll(async () => {
        // Connect to a test database or just use existing connection
        // For simplicity in this environment, we assume the DB is available
    });

    afterAll(async () => {
        await User.deleteMany({ email: /test@example.com/ });
        await mongoose.connection.close();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'owner'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
    });

    it('should not register an existing user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(400);
    });

    it('should login a registered user', async () => {
        // First manually approve the user in DB if necessary, 
        // but for test we can just mock or use a user with 'Active' status
        await User.findOneAndUpdate({ email: 'test@example.com' }, { status: 'active' });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
                role: 'owner'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
    });
});
