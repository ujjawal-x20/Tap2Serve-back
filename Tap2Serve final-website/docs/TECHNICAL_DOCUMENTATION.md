# Tap2Serve - Complete Technical Documentation

## 📋 Table of Contents
1. [Architecture Deep Dive](#architecture-deep-dive)
2. [API Examples](#api-request--response-examples)
3. [Code Snippets](#code-implementation-examples)
4. [Security Implementation](#security-implementation-details)
5. [Performance Optimization](#performance-optimization-guide)
6. [Development Workflow](#development-workflow)
7. [Database Indexing Strategy](#database-indexing-strategy)
8. [Error Handling](#error-handling-patterns)
9. [Testing Strategies](#testing-strategies)
10. [Production Checklist](#production-deployment-checklist)

---

## Architecture Deep Dive

### System Architecture Flow

```
┌─────────────┐
│   Customer  │ Scans QR Code
│   (Guest)   │────────────────┐
└─────────────┘                │
                               ▼
                        ┌──────────────┐
                        │   Frontend   │
                        │  (menu.html) │
                        └──────┬───────┘
                               │ POST /api/v1/orders
                               ▼
┌──────────────────────────────────────────────┐
│           Express.js Backend                 │
│  ┌────────────────────────────────────────┐  │
│  │  1. authMiddleware (JWT Verify)        │  │
│  │  2. tenantMiddleware (Scope by Rest)   │  │
│  │  3. orderController                    │  │
│  │     - Validate stock (atomic)          │  │
│  │     - Create order                     │  │
│  │     - Deduct inventory                 │  │
│  └────────────────────────────────────────┘  │
└───────────────────┬──────────────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │   MongoDB     │
            │   Atlas/Local │
            └───────┬───────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌──────────┐
│ Orders  │   │  Menu   │   │Inventory │
│Collection   │Collection   │Collection│
└─────────┘   └─────────┘   └──────────┘

                    │ Real-time Polling
                    ▼
            ┌───────────────┐
            │   Dashboard   │
            │ (dashboard.html)
            │   - KDS       │
            │   - Stats     │
            │   - Reports   │
            └───────────────┘
```

### Multi-Tenancy Architecture

```javascript
// Every request flows through tenantMiddleware
Request → authMiddleware → tenantMiddleware → Controller

// tenantMiddleware adds restaurantId to req
app.use('/api/v1/orders', protect, tenantHandler, orderRoutes);

// How it works:
function tenantHandler(req, res, next) {
    if (req.user.role === 'admin') {
        // Admins can view all
        return next();
    }
    
    // Force restaurantId based on user's token
    req.restaurantId = req.user.restaurantId;
    
    if (!req.restaurantId) {
        return res.status(403).json({ 
            message: 'No restaurant associated' 
        });
    }
    
    next();
}

// Now all queries automatically filter by restaurant
const orders = await Order.find({ 
    restaurantId: req.restaurantId  // Injected automatically
});
```

---

## API Request & Response Examples

### 1. User Login

**Request:**
```http
POST /api/v1/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "owner@test.com",
  "password": "owner123"
}
```

**Response (Success):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "694b5c5790e37a02206706c3",
    "name": "Test Owner",
    "email": "owner@test.com",
    "role": "owner",
    "restaurantId": "694b5c5790e37a02206706c4",
    "status": "active"
  }
}
```

**Response (Failure):**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "message": "Invalid credentials"
}
```

### 2. Create Order

**Request:**
```http
POST /api/v1/orders HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "table_no": "T-05",
  "restaurantId": "694b5c5790e37a02206706c4",
  "items": [
    {
      "name": "Margherita Pizza",
      "price": 350,
      "quantity": 2,
      "menuId": "694b5c9a90e37a02206706c8"
    },
    {
      "name": "Fresh Lemonade",
      "price": 80,
      "quantity": 1,
      "menuId": "694b5c9a90e37a02206706cc"
    }
  ],
  "total": 780,
  "idempotencyKey": "order_1703409600_abc123"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "id": "694b5cfa90e37a02206706d1"
}
```

### 3. Get Dashboard Stats

**Request:**
```http
GET /api/v1/stats/dashboard HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "revenue": 15750,
  "revenue_growth": 23.5,
  "revenue_diff": 3000,
  "orders": 45,
  "orders_growth": 12.5,
  "active_guests": 18,
  "avg_prep_time": 18,
  "kitchen_load": {
    "value": 65,
    "active_count": 13
  },
  "trending_items": [
    {
      "name": "Margherita Pizza",
      "qty": 23
    },
    {
      "name": "Grilled Chicken",
      "qty": 18
    },
    {
      "name": "Caesar Salad",
      "qty": 15
    }
  ]
}
```

### 4. Update Order Status

**Request:**
```http
PUT /api/v1/orders/694b5cfa90e37a02206706d1/status HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "Cooking"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "order": {
    "_id": "694b5cfa90e37a02206706d1",
    "id": "694b5cfa90e37a02206706d1",
    "tableNo": "T-05",
    "status": "Cooking",
    "total": 780,
    "items": [...],
    "createdAt": "2025-12-24T03:30:00.000Z",
    "updatedAt": "2025-12-24T03:35:00.000Z"
  }
}
```

### 5. Update Inventory

**Request:**
```http
PUT /api/v1/inventory/694b5c9a90e37a02206706c8 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "quantity": 50,
  "lowStockThreshold": 10
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "inventory": {
    "_id": "694b5ca290e37a02206706ca",
    "restaurantId": "694b5c5790e37a02206706c4",
    "menuId": {
      "_id": "694b5c9a90e37a02206706c8",
      "name": "Margherita Pizza"
    },
    "quantity": 50,
    "lowStockThreshold": 10,
    "lastUpdated": "2025-12-24T03:40:00.000Z"
  }
}
```

---

## Code Implementation Examples

### Frontend: Placing an Order

```javascript
// dashboard.html - handleTableClick function
async function handleTableClick(tableId) {
    try {
        // 1. Fetch menu items
        const menuRes = await fetch("/api/v1/menu");
        const menuData = await menuRes.json();
        
        // 2. Show modal for order
        const data = await openModal({
            title: `New Order for ${tableId}`,
            fields: [
                { 
                    name: 'itemStr', 
                    label: 'Select Item', 
                    type: 'select', 
                    options: menuData.map(m => `${m.name} | ₹${m.price}`)
                },
                { 
                    name: 'qty', 
                    label: 'Quantity', 
                    type: 'number', 
                    defaultValue: '1' 
                }
            ],
            submitLabel: 'Place Order'
        });
        
        if (!data) return;
        
        // 3. Parse selection
        const [namePart, pricePart] = data.itemStr.split(' | ₹');
        const itemName = namePart.trim();
        const itemPrice = parseFloat(pricePart);
        const qty = parseInt(data.qty) || 1;
        
        // 4. Find menu item
        const selectedMenu = menuData.find(m => m.name === itemName);
        
        // 5. Create order
        const response = await fetch("/api/v1/orders", {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                table_no: tableId,
                restaurantId: currentRestaurant.id,
                items: [{
                    name: itemName,
                    quantity: qty,
                    price: itemPrice,
                    menuId: selectedMenu._id
                }],
                total: itemPrice * qty,
                idempotencyKey: 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 6. Refresh UI
            fetchOrders();
            fetchTables();
            fetchStats();
            showAlert('Order placed successfully!');
        } else {
            showAlert('Failed to place order: ' + result.message);
        }
        
    } catch (error) {
        console.error('Order creation error:', error);
        showAlert('Error placing order');
    }
}
```

### Backend: Atomic Inventory Deduction

```javascript
// orderController.js - createOrder function
const createOrder = async (req, res) => {
    const { table_no, items, total, restaurantId, idempotencyKey } = req.body;
    
    // 1. Idempotency check
    if (idempotencyKey) {
        const existing = await Order.findOne({ 
            idempotencyKey, 
            restaurantId 
        });
        if (existing) {
            return res.json({ 
                success: true, 
                id: existing._id, 
                message: "Order already processed" 
            });
        }
    }
    
    // 2. Format items
    const formattedItems = items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.qty || item.quantity || 1,
        menuId: item.menuId
    }));
    
    // 3. Check stock availability (read phase)
    for (const item of formattedItems) {
        if (!item.menuId) continue;
        
        const inv = await Inventory.findOne({ 
            restaurantId, 
            menuId: item.menuId 
        });
        
        if (inv && inv.quantity < item.quantity) {
            return res.status(400).json({
                success: false,
                message: `Out of stock: ${item.name}. Available: ${inv.quantity}`
            });
        }
    }
    
    // 4. Atomic deduction with rollback (write phase)
    const deductedItems = [];
    try {
        for (const item of formattedItems) {
            if (!item.menuId) continue;
            
            // Atomic operation: only succeeds if quantity is sufficient
            const result = await Inventory.updateOne(
                {
                    restaurantId,
                    menuId: item.menuId,
                    quantity: { $gte: item.quantity } // Critical: atomic check
                },
                { 
                    $inc: { quantity: -item.quantity } // Atomic decrement
                }
            );
            
            // If no document matched, stock changed between steps
            if (result.matchedCount === 0 || result.modifiedCount === 0) {
                throw new Error(`Stock changed for ${item.name}`);
            }
            
            deductedItems.push(item);
        }
    } catch (error) {
        // Rollback: re-add quantities
        console.warn("Rolling back inventory:", deductedItems.map(i => i.name));
        for (const item of deductedItems) {
            await Inventory.updateOne(
                { restaurantId, menuId: item.menuId },
                { $inc: { quantity: item.quantity } } // Add back
            );
        }
        return res.status(400).json({
            success: false,
            message: error.message + ". Please try again."
        });
    }
    
    // 5. Create order (only if inventory succeeded)
    const order = await Order.create({
        restaurantId,
        userId: req.user ? req.user._id : null,
        tableNo: table_no,
        items: formattedItems,
        total,
        status: 'New',
        idempotencyKey
    });
    
    // 6. Log action
    if (req.user) {
        await AuditLog.create({
            userId: req.user._id,
            restaurantId,
            action: 'New Order',
            details: `Order #${order._id} placed for Table ${table_no}`,
            severity: 'info'
        });
    }
    
    res.status(201).json({ success: true, id: order._id });
};
```

### Authentication Middleware

```javascript
// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
exports.protect = async (req, res, next) => {
    let token;
    
    // Extract token from header
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({ 
            message: 'Not authorized, no token' 
        });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user to request
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({ 
                message: 'User not found' 
            });
        }
        
        next();
    } catch (error) {
        return res.status(401).json({ 
            message: 'Not authorized, token failed' 
        });
    }
};

// Role-based authorization
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user.role}' is not authorized`
            });
        }
        next();
    };
};
```

---

## Security Implementation Details

### 1. Password Hashing

```javascript
// Before saving user
const bcrypt = require('bcryptjs');

const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verification
const isMatch = await bcrypt.compare(enteredPassword, user.password);
```

### 2. JWT Token Generation

```javascript
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};
```

### 3. Input Validation

```javascript
const { body, validationResult } = require('express-validator');

// Validation middleware
exports.validateOrder = [
    body('table_no').notEmpty().isString(),
    body('items').isArray({ min: 1 }),
    body('items.*.name').notEmpty(),
    body('items.*.price').isFloat({ min: 0 }),
    body('items.*.quantity').isInt({ min: 1 }),
    body('total').isFloat({ min: 0 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
```

### 4. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10000, // 10,000 requests per window
    message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

### 5. CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}));
```

---

## Performance Optimization Guide

### 1. Database Indexing

```javascript
// Order.js
orderSchema.index({ restaurantId: 1, createdAt: -1 }); // Compound index
orderSchema.index({ status: 1 });                       // Status queries
orderSchema.index({ tableNo: 1 });                      // Table lookups
orderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

// Menu.js
menuSchema.index({ restaurantId: 1 });
menuSchema.index({ name: 'text', description: 'text' }); // Full-text search

// Inventory.js
inventorySchema.index({ restaurantId: 1, menuId: 1 }, { unique: true });
```

### 2. Query Optimization

```javascript
// ❌ Bad: Fetches all fields
const orders = await Order.find({ restaurantId });

// ✅ Good: Select only needed fields
const orders = await Order.find({ restaurantId })
    .select('tableNo status total createdAt')
    .limit(50);

// ✅ Best: With pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const orders = await Order.find({ restaurantId })
    .select('tableNo status total createdAt')
    .sort('-createdAt')
    .limit(limit)
    .skip(skip);
```

### 3. Caching Strategy

```javascript
// Simple in-memory cache for menu items
const menuCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getMenu = async (restaurantId) => {
    const cacheKey = `menu_${restaurantId}`;
    const cached = menuCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }
    
    const menu = await Menu.find({ restaurantId, available: true });
    menuCache.set(cacheKey, {
        data: menu,
        timestamp: Date.now()
    });
    
    return menu;
};

// Invalidate on update
const updateMenuItem = async (id, updates) => {
    const item = await Menu.findByIdAndUpdate(id, updates, { new: true });
    menuCache.delete(`menu_${item.restaurantId}`); // Clear cache
    return item;
};
```

### 4. Frontend Optimization

```javascript
// Debounce API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Usage
const debouncedFetch = debounce(fetchOrders, 300);

// Event delegation for dynamic elements
document.getElementById('orders-container').addEventListener('click', (e) => {
    if (e.target.matches('.status-btn')) {
        const orderId = e.target.dataset.orderId;
        const status = e.target.dataset.status;
        updateOrderStatus(orderId, status);
    }
});
```

---

## Development Workflow

### 1. Feature Development Process

```bash
# 1. Create feature branch
git checkout -b feature/waiter-call-system

# 2. Develop locally
npm run dev

# 3. Test changes
npm test

# 4. Commit with descriptive message
git add .
git commit -m "feat: implement waiter call notification system"

# 5. Push to remote
git push origin feature/waiter-call-system

# 6. Create pull request
# (via GitHub/GitLab UI)

# 7. After review and merge
git checkout main
git pull origin main
git branch -d feature/waiter-call-system
```

### 2. Environment Setup

```bash
# Development
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/tap2serve-dev

# Staging
NODE_ENV=staging
PORT=3000
MONGO_URI=mongodb+srv://...@cluster.mongodb.net/tap2serve-staging

# Production
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...@cluster.mongodb.net/tap2serve-prod
```

### 3. Database Migrations

```javascript
// migrations/001_add_branch_support.js
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

async function up() {
    // Add branchId field to existing orders
    await Order.updateMany(
        { branchId: { $exists: false } },
        { $set: { branchId: null } }
    );
    
    console.log('Migration 001 completed');
}

async function down() {
    // Rollback
    await Order.updateMany(
        {},
        { $unset: { branchId: '' } }
    );
    
    console.log('Migration 001 rolled back');
}

module.exports = { up, down };
```

---

## Database Indexing Strategy

### Query Pattern Analysis

```javascript
// Most common queries
1. GET /api/v1/orders?restaurantId=X&status=New
   → Index: { restaurantId: 1, status: 1 }

2. GET /api/v1/orders?restaurantId=X ORDER BY createdAt DESC
   → Index: { restaurantId: 1, createdAt: -1 }

3. GET /api/v1/menu?restaurantId=X&available=true
   → Index: { restaurantId: 1, available: 1 }

4. GET /api/v1/inventory?restaurantId=X&menuId=Y
   → Index: { restaurantId: 1, menuId: 1 } (unique)
```

### Index Creation Script

```javascript
// scripts/create-indexes.js
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Menu = require('./src/models/Menu');
const Inventory = require('./src/models/Inventory');

async function createIndexes() {
    await Order.collection.createIndex({ restaurantId: 1, createdAt: -1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ idempotencyKey: 1 }, { unique: true, sparse: true });
    
    await Menu.collection.createIndex({ restaurantId: 1 });
    await Menu.collection.createIndex({ name: 'text' });
    
    await Inventory.collection.createIndex({ restaurantId: 1, menuId: 1 }, { unique: true });
    
    console.log('All indexes created successfully');
    process.exit(0);
}

createIndexes();
```

---

## Error Handling Patterns

### Global Error Handler

```javascript
// middleware/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    
    // Log error
    console.error(err);
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        error.statusCode = 404;
    }
    
    // Mongoose duplicate key
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        error.statusCode = 400;
    }
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        error.message = Object.values(err.errors).map(e => e.message);
        error.statusCode = 400;
    }
    
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
```

### Async Error Wrapper

```javascript
// utils/asyncHandler.js
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ restaurantId: req.restaurantId });
    res.json(orders);
});
```

---

## Testing Strategies

### Unit Tests (Jest)

```javascript
// tests/orderController.test.js
const request = require('supertest');
const app = require('../server');
const Order = require('../models/Order');

describe('Order Controller', () => {
    let token;
    
    beforeAll(async () => {
        // Login and get token
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'test@example.com',
                password: 'test123'
            });
        token = res.body.token;
    });
    
    describe('POST /api/v1/orders', () => {
        it('should create a new order', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    table_no: 'T-01',
                    items: [
                        { name: 'Pizza', price: 350, quantity: 1 }
                    ],
                    total: 350
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.id).toBeDefined();
        });
        
        it('should reject order without items', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    table_no: 'T-01',
                    items: [],
                    total: 0
                });
            
            expect(res.statusCode).toBe(400);
        });
    });
});
```

### Integration Tests

```javascript
// tests/orderFlow.integration.test.js
describe('Complete Order Flow', () => {
    it('should handle full order lifecycle', async () => {
        // 1. Create order
        const orderRes = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${token}`)
            .send(orderData);
        const orderId = orderRes.body.id;
        
        // 2. Update to Cooking
        const cookingRes = await request(app)
            .put(`/api/v1/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'Cooking' });
        expect(cookingRes.body.order.status).toBe('Cooking');
        
        // 3. Update to Ready
        const readyRes = await request(app)
            .put(`/api/v1/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'Ready' });
        expect(readyRes.body.order.status).toBe('Ready');
        
        // 4. Mark as Served
        const servedRes = await request(app)
            .put(`/api/v1/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'Served' });
        expect(servedRes.body.order.status).toBe('Served');
    });
});
```

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Environment variables configured in `.env.production`
- [ ] Database backups automated
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] CDN setup for static assets (optional)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Logging configured (Winston to file/service)
- [ ] Rate limiting tested under load
- [ ] CORS origins whitelisted

### Security Checklist

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] MongoDB user has minimal required permissions
- [ ] API keys stored in environment variables
- [ ] HTTPS enforced
- [ ] Helmet.js middleware enabled
- [ ] Input validation on all endpoints
- [ ] File upload limits configured
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

### Monitoring Setup

```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Monitor with external service
// Ping http://yourdomain.com/health every 5 minutes
```

### Performance Checklist

- [ ] Database indexes created
- [ ] API response times < 200ms
- [ ] Large payloads paginated
- [ ] Static files served via CDN
- [ ] Gzip compression enabled
- [ ] Browser caching headers set
- [ ] Database connection pooling configured
- [ ] PM2 cluster mode enabled (multi-core)

### Post-Deployment

- [ ] Smoke tests passed
- [ ] User acceptance testing completed
- [ ] Performance monitoring active
- [ ] Error alerts configured
- [ ] Backup restoration tested
- [ ] Rollback plan documented
- [ ] Team notified of deployment

---

**This comprehensive documentation covers all implementation details, code examples, and best practices for the Tap2Serve system.**

For questions or support, refer to the main README.md or contact the development team.
