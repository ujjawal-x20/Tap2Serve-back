# Tap2Serve - Multi-Restaurant QR Ordering System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-Proprietary-red.svg) ![Stack](https://img.shields.io/badge/stack-MERN-green.svg) ![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)

**Tap2Serve** is an enterprise-grade, SaaS-ready platform designed to digitize dining experiences. It enables restaurants to offer seamless QR-based ordering, manage multiple branches, handle reservations, and track kitchen operations—all from a single, unified dashboard. Built for rigorous consistency, high concurrency, and zero-downtime reliability.

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Folder Structure](#-folder-structure)
4. [Key Features](#-key-features)
5. [API Documentation](#-api-documentation)
6. [Database Schema](#-database-schema)
7. [Environment Variables](#-environment-variables)
8. [Installation & Setup](#-installation--setup)
9. [Quick Start Guide](#-quick-start-guide)
10. [Dashboard Features](#-dashboard-features)
11. [Testing & Validation](#-testing--validation)
12. [Deployment Guide](#-deployment-guide)
13. [Troubleshooting](#-troubleshooting)
14. [Future Roadmap](#-future-roadmap)

---

## 🚀 Project Overview

### The Problem
Traditional dining is plagued by:
- Long wait times for ordering and payment
- Order errors between waiters and kitchen
- Inefficient inventory tracking
- Poor communication between front-of-house and back-of-house
- Manual, error-prone payment reconciliation

### The Solution
Tap2Serve provides a **Digital Operating System** for restaurants:

#### For Customers:
- 📱 Scan QR code → instant menu access
- 🌐 Multi-language support (English/Hindi)
- 🛒 Direct-to-kitchen ordering
- 💳 Multiple payment options

#### For Kitchen:
- 🖥️ Real-time Kitchen Display System (KDS)
- ⏱️ Timer-based order tracking
- 📊 Kanban workflow (New → Cooking → Ready → Served)

#### For Management:
- 📈 Live analytics and sales reports
- 📦 Automated inventory tracking
- 🏪 Multi-branch support
- 👥 Staff performance metrics

### End-to-End Flow
```
1. SCAN → Guest scans table QR code
2. ORDER → Select items, customize, add to cart
3. PROCESS → Backend validates inventory (atomic transactions)
4. PREPARE → Kitchen receives order on KDS
5. SERVE → Waiter delivers food, updates status
6. PAY → Invoice generated, payment processed
```

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB 9.x (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, express-validator, express-rate-limit
- **Logging**: Winston, Morgan
- **Payments**: Stripe API v20+

### Frontend
- **Core**: HTML5, Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS 3.x (CDN/CLI)
- **Icons**: Google Material Symbols
- **Fonts**: Inter (Google Fonts)
- **PWA**: Service Workers for offline support

### DevOps & Tools
- **Containerization**: Docker, Docker Compose
- **Process Manager**: PM2 (Production)
- **Version Control**: Git
- **Testing**: Jest, Supertest
- **Database**: MongoDB Atlas / Local MongoDB

---

## 📂 Folder Structure

```
Tap2Serve/
├── backend/                      # Server-side application
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   │   └── db.js             # MongoDB connection
│   │   ├── controllers/          # Business logic
│   │   │   ├── authController.js
│   │   │   ├── orderController.js
│   │   │   ├── menuController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── statController.js
│   │   │   └── restaurantController.js
│   │   ├── middleware/           # Express middleware
│   │   │   ├── authMiddleware.js     # JWT verification & RBAC
│   │   │   ├── tenantMiddleware.js   # Multi-tenancy
│   │   │   └── errorMiddleware.js    # Global error handler
│   │   ├── models/               # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Restaurant.js
│   │   │   ├── Order.js
│   │   │   ├── Menu.js
│   │   │   ├── Inventory.js
│   │   │   ├── Reservation.js
│   │   │   ├── Branch.js
│   │   │   └── WaiterCall.js
│   │   ├── routes/               # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── menuRoutes.js
│   │   │   ├── inventoryRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── waiterRoutes.js
│   │   └── utils/                # Helper functions
│   │       ├── logger.js
│   │       └── generateToken.js
│   ├── server.js                 # Express app entry point
│   ├── create-admin.js           # Admin user creation script
│   ├── create-test-owner.js      # Test data creation
│   ├── create-test-menu.js       # Test menu population
│   ├── package.json
│   ├── .env                      # Environment variables
│   └── Dockerfile
│
├── testing-page/                 # Frontend application
│   ├── dashboard.html            # Restaurant owner dashboard
│   ├── admin.html                # System admin panel
│   ├── menu.html                 # Customer QR menu
│   ├── index.html                # Landing page
│   ├── diagnostic.html           # Debug tool
│   ├── service-worker.js         # PWA offline support
│   └── manifest.json             # PWA manifest
│
├── FInal-login-Page/             # Authentication UI
│   ├── index.html                # Login page
│   ├── style.css
│   └── script.js
│
├── docs/                         # Documentation
│   ├── TESTING_GUIDE.md
│   ├── DASHBOARD_FIX_SUMMARY.md
│   └── API.md
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ✨ Key Features

### 1. Multi-Restaurant & Multi-Branch Architecture
- **SaaS-Ready**: Single instance hosts multiple restaurants
- **Data Isolation**: Automatic tenant scoping via `restaurantId`
- **Branch Management**: Support for restaurant chains
- **Role-Based Access Control (RBAC)**:
  - `admin`: Full system access
  - `owner`: Restaurant management
  - `manager`: Branch operations
  - `staff`: Limited operational access

### 2. QR Code Ordering System
- **Contactless Ordering**: Table-specific QR codes
- **Dynamic Menus**: Auto-hide out-of-stock items
- **Real-Time Updates**: 3-second polling interval
- **Multi-Language**: Instant EN/HI toggle
- **Customization**: Add special instructions per item

### 3. Kitchen Display System (KDS)
- **Kanban Board**: Visual workflow (New → Cooking → Ready)
- **Timer Alerts**: Red highlight for orders > 15min
- **FIFO Queue**: First-in-first-out processing
- **One-Click Actions**: Start Cooking, Mark Ready, Serve
- **Auto-Refresh**: 5-second update cycle

### 4. Advanced Inventory Management
- **Atomic Transactions**: MongoDB `$inc` operations prevent race conditions
- **Saga Pattern**: Auto-rollback on partial failures
- **Low Stock Alerts**: Visual warnings at customizable thresholds
- **Historical Tracking**: Audit trail for all stock changes
- **Menu-Inventory Linking**: Auto-deduct on order confirmation

### 5. Comprehensive Dashboard
- **Real-Time Stats**:
  - Total Revenue (with growth %)
  - Order Count (daily/weekly/monthly)
  - Active Guests
  - Kitchen Load %
  - Average Prep Time
- **Charts & Analytics**:
  - Revenue trends (weekly)
  - Order source distribution
  - Top-selling items
- **Quick Actions**:
  - Create orders from table manager
  - Edit menu items
  - Update inventory
  - Generate reports

### 6. Waiter Call System
- **Guest Panel**: Call Waiter, Request Bill, Need Service
- **Staff Alerts**: Real-time notification panel with resolve action
- **Visual Indicators**: Pulse animations for pending calls
- **Auto-Polling**: 10-second refresh interval

### 7. Table & Floor Management
- **Visual Floor Plan**: Drag-and-drop table layout
- **Status Tracking**: Empty/Occupied/Reserved states
- **QR Code Generation**: Bulk print for table ranges
- **Table Merging**: Combine tables for large parties
- **Capacity Management**: Set max guests per table

### 8. Reservation System
- **Online Booking**: Customer-facing reservation form
- **Conflict Prevention**: Double-booking checks
- **Confirmation Workflow**: Pending → Confirmed → Seated
- **SMS/Email Notifications**: Automated reminders
- **Cancellation Management**: Grace period handling

### 9. Robust Security
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs with salt rounds
- **Input Validation**: express-validator on all endpoints
- **Rate Limiting**: 10,000 requests per 10min window
- **CORS Protection**: Configurable allowed origins
- **Idempotency**: Prevent duplicate orders/payments
- **SQL Injection Prevention**: Mongoose parameterization

### 10. Payment Integration
- **Stripe Integration**: Full PCI-compliant processing
- **Multiple Methods**: Card, UPI, Cash
- **Invoice Generation**: Unique IDs with timestamp
- **Receipt Printing**: Browser-based receipt generation
- **Transaction History**: Exportable CSV reports

---

## 📡 API Documentation

**Base URL**: `http://localhost:3000/api/v1`

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/login` | Login with email/password | Public |
| POST | `/auth/register` | Register new restaurant | Public |
| GET | `/auth/me` | Get current user | Private |

### Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/orders` | List all orders (scoped) | Staff |
| GET | `/orders/:id` | Get single order | Staff |
| POST | `/orders` | Create new order | Public/Guest |
| PUT | `/orders/:id/status` | Update order status | Staff |
| PUT | `/orders/:id/invoice` | Generate invoice | Cashier |

### Menu
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/menu` | List menu items | Public |
| GET | `/menu/:id` | Get single item | Public |
| POST | `/menu` | Add menu item | Owner |
| PUT | `/menu/:id` | Update item | Owner |
| DELETE | `/menu/:id` | Delete item | Owner |

### Inventory
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/inventory` | List inventory | Staff |
| PUT | `/inventory/:menuId` | Update stock | Staff |

### Restaurants
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/restaurants` | List restaurants | Owner |
| POST | `/restaurants` | Create restaurant | Owner |
| PUT | `/restaurants/:id` | Update restaurant | Owner |
| DELETE | `/restaurants/:id` | Delete restaurant | Admin |

### Statistics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/stats/dashboard` | Dashboard metrics | Staff |
| GET | `/stats/reports` | Detailed reports | Owner |
| GET | `/stats/admin` | Global stats | Admin |

### Waiter Calls
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/waiter/calls` | List pending calls | Staff |
| POST | `/waiter/calls` | Create call | Guest |
| PUT | `/waiter/calls/:id/resolve` | Mark resolved | Staff |

### Reservations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/reservations` | List bookings | Staff |
| POST | `/reservations` | Create booking | Guest |
| PUT | `/reservations/:id` | Update status | Staff |

**Authentication Header**:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🗄 Database Schema

### User
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: Enum ['admin', 'owner', 'manager', 'staff'],
  restaurantId: ObjectId (ref: Restaurant),
  branchId: ObjectId (ref: Branch),
  status: Enum ['active', 'inactive'],
  createdAt: Date,
  updatedAt: Date
}
```

### Restaurant
```javascript
{
  name: String (required),
  location: String,
  ownerId: ObjectId (ref: User, required),
  plan: Enum ['Basic', 'Standard', 'Premium'],
  tableCount: Number (default: 10),
  prepTime: Number (default: 20),
  status: Enum ['Active', 'Inactive', 'Suspended'],
  revenue: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  restaurantId: ObjectId (ref: Restaurant, required),
  branchId: ObjectId (ref: Branch),
  userId: ObjectId (ref: User),
  tableNo: String (required),
  items: [{
    menuId: ObjectId (ref: Menu),
    name: String,
    price: Number,
    quantity: Number
  }],
  status: Enum ['New', 'Cooking', 'Ready', 'Served', 'Paid'],
  total: Number (required),
  paymentId: String,
  invoiceId: String,
  idempotencyKey: String (unique, sparse),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { restaurantId: 1, createdAt: -1 }
- { status: 1 }
- { idempotencyKey: 1 } (unique, sparse)
```

### Menu
```javascript
{
  restaurantId: ObjectId (ref: Restaurant, required),
  name: String (required),
  name_hi: String,
  description_en: String,
  description_hi: String,
  category: String (required),
  price: Number (required),
  imageUrl: String,
  available: Boolean (default: true),
  status: Enum ['pending', 'approved'],
  createdAt: Date,
  updatedAt: Date
}
```

### Inventory
```javascript
{
  restaurantId: ObjectId (ref: Restaurant, required),
  branchId: ObjectId (ref: Branch),
  menuId: ObjectId (ref: Menu, required),
  quantity: Number (required, default: 0),
  lowStockThreshold: Number (default: 5),
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { restaurantId: 1, menuId: 1 } (unique)
```

---

## 🔑 Environment Variables

Create `/backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tap2serve
# Or for local:
# MONGO_URI=mongodb://localhost:27017/tap2serve

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d

# Stripe Payments (Optional)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email (Optional)
EMAIL_USER=noreply@tap2serve.com
EMAIL_PASS=app_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX_REQUESTS=10000
```

---

## 💿 Installation & Setup

### Prerequisites
- **Node.js**: v16.0.0 or higher
- **MongoDB**: Local instance or MongoDB Atlas account
- **Git**: Latest version
- **npm**: v7.0.0 or higher

### 1. Clone Repository
```bash
git clone https://github.com/your-org/tap2serve.git
cd tap2serve
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your MongoDB URI and other configs
nano .env  # or use any text editor
```

### 4. Initialize Database
```bash
# Create admin user
node create-admin.js

# Create test data (optional)
node create-test-owner.js
node create-test-menu.js
```

### 5. Start Development Server
```bash
# Backend
npm run dev

# Or for production
npm start
```

Server will start on `http://localhost:3000`

### 6. Access Application
- **Landing Page**: `http://localhost:3000/`
- **Login**: `http://localhost:3000/login/`
- **Dashboard**: `http://localhost:3000/dashboard.html`
- **Admin Panel**: `http://localhost:3000/admin.html`

---

## 🚀 Quick Start Guide

### Step 1: Create Your Account
1. Navigate to `http://localhost:3000/login/`
2. Use test credentials:
   - **Email**: `owner@test.com`
   - **Password**: `owner123`
3. Click **Login**

### Step 2: Explore Dashboard
After login, you'll see:
- **Stats Cards**: Revenue, Orders, Guests, Prep Time
- **Recent Orders**: Last 5 orders
- **Charts**: Revenue analytics

### Step 3: Manage Menu
1. Click **Menu Management** in sidebar
2. View existing menu items
3. Click **Add New Item** to create items
4. Toggle availability with switch
5. Edit/Delete as needed

### Step 4: Place Test Order
1. Go to **Tables & Zones**
2. Click any **green table** (e.g., T-01)
3. Select menu item from dropdown
4. Enter quantity
5. Click **Place Order**

### Step 5: View in Kitchen
1. Click **Live Orders** in sidebar
2. Order appears in **New Orders** column
3. Click **Start Cooking** → moves to Cooking
4. Click **Mark Ready** → moves to Ready
5. Click **Serve** → order completes

### Step 6: Check Statistics
1. Return to **Dashboard**
2. Stats should update:
   - Revenue increased
   - Order count +1
   - Recent orders shows your order

---

## 📊 Dashboard Features

### Overview Tab
- **Revenue Card**: Total earnings with growth percentage
- **Orders Card**: Order count with trend
- **Active Guests**: Current diners
- **Kitchen Load**: Preparation capacity %
- **Revenue Chart**: 7-day trend visualization
- **Recent Orders Table**: Last 5 orders with details
- **Trending Dishes**: Top 3 popular items

### Live Orders (Kanban)
- **Three Columns**: New | Cooking | Ready
- **Order Cards**: Show table, items, time
- **Action Buttons**: Status progression
- **Real-Time**: Auto-refresh every 3s
- **Color Coding**: Red alerts for delays

### Menu Management
- **Grid View**: Visual menu display
- **Quick Edit**: Inline price/name editing
- **Availability Toggle**: Enable/disable items
- **Category Filter**: Main, Starter, Dessert, Drink
- **Image Upload**: Photo upload for items
- **Multi-Language**: EN/HI fields

### Inventory
- **Stock Levels**: Current quantity display
- **Low Stock Alerts**: Red warnings
- **Quick Update**: Inline quantity editing
- **History**: Stock movement tracking

### Tables & Zones
- **Visual Floor Plan**: 3D table grid
- **Status Colors**:
  - 🟢 Green = Available
  - 🔴 Red = Occupied
  - 🟠 Orange = Reserved
- **Quick Order**: Click table to create order
- **QR Code Printing**: Bulk print for range

### Sales Reports
- **Weekly Charts**: Bar graph visualization
- **Order Distribution**: Status breakdown
- **Export Options**: CSV download

### Transactions
- **Payment History**: All completed orders
- **Date Filter**: Range selection
- **Method Tracking**: Cash/Card/UPI
- **Invoice Print**: Generate receipts

---

## 🧪 Testing & Validation

### Automated Diagnostic Tool
Use the built-in diagnostic tool to test all features:

```bash
# Open in browser
http://localhost:3000/diagnostic.html
```

Click **RUN FULL TEST** to verify:
1. ✅ Login authentication
2. ✅ Restaurant data loading
3. ✅ Menu fetching
4. ✅ Order creation
5. ✅ Order persistence
6. ✅ Status updates

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] JWT token persists in localStorage
- [ ] Auto-redirect to dashboard after login
- [ ] Logout clears session

#### Order Flow
- [ ] Click table creates modal
- [ ] Menu items populate dropdown
- [ ] Order creation succeeds
- [ ] Table status changes to occupied
- [ ] Order appears in Live Orders
- [ ] Status updates work (New → Cooking → Ready)
- [ ] Served order disappears from board

#### Menu Management
- [ ] Add new item saves correctly
- [ ] Edit item updates database
- [ ] Delete removes item
- [ ] Availability toggle works
- [ ] Images upload and display

#### Inventory
- [ ] Stock levels display correctly
- [ ] Low stock alert shows
- [ ] Quantity update persists
- [ ] Order creation decrements stock

#### Dashboard Stats
- [ ] Revenue displays correctly
- [ ] Order count accurate
- [ ] Charts render with data
- [ ] Real-time updates on order completion

### Test Data Creation
```bash
# Backend directory
cd backend

# Create admin
node create-admin.js

# Create test restaurant + owner
node create-test-owner.js

# Populate menu (5 items)
node create-test-menu.js
```

**Test Credentials**:
- Email: `owner@test.com`
- Password: `owner123`

---

## 🚢 Deployment Guide

### Option 1: Docker Deployment

#### Build Image
```bash
cd backend
docker build -t tap2serve-backend .
```

#### Run Container
```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name tap2serve \
  tap2serve-backend
```

#### Using Docker Compose
```bash
docker-compose up -d
```

### Option 2: VPS Deployment (Ubuntu)

#### 1. Setup Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MongoDB (or use Atlas)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 2. Deploy Application
```bash
# Clone repository
git clone https://github.com/your-org/tap2serve.git
cd tap2serve/backend

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env  # Configure for production

# Start with PM2
pm2 start server.js --name tap2serve -i max
pm2 save
pm2 startup
```

#### 3. Setup Nginx Reverse Proxy
```bash
# Install Nginx
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/tap2serve
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tap2serve /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### Option 3: Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create tap2serve-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongo_atlas_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# Open app
heroku open
```

---

## 🐛 Troubleshooting

### Issue: Login Returns 401 Unauthorized
**Cause**: Invalid credentials or expired token

**Solution**:
1. Clear browser localStorage
2. Verify credentials: `owner@test.com` / `owner123`
3. Check server logs for errors
4. Regenerate test user:
   ```bash
   cd backend
   node create-test-owner.js
   ```

### Issue: Orders Not Appearing in Live Orders
**Cause**: Authentication or restaurant context missing

**Solution**:
1. Run diagnostic tool: `http://localhost:3000/diagnostic.html`
2. Check console for errors (F12)
3. Verify `localStorage` has `token` and `user`
4. Confirm `restaurantId` in user object
5. Check server logs for API errors

### Issue: Menu Items Not Loading
**Cause**: Empty menu or network error

**Solution**:
```bash
cd backend
node create-test-menu.js
```

### Issue: Database Connection Failed
**Cause**: Invalid MongoDB URI or network issue

**Solution**:
1. Check `.env` for correct `MONGO_URI`
2. Verify MongoDB is running:
   ```bash
   # For local MongoDB
   sudo systemctl status mongod
   
   # For Atlas, check network access whitelist
   ```
3. Test connection:
   ```bash
   node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('OK'))"
   ```

### Issue: Port Already in Use
**Cause**: Another process using port 3000

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=5000
```

### Issue: JWT Malformed Error
**Cause**: Invalid or corrupted token

**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Log in again
3. Verify `JWT_SECRET` in `.env` matches deployment

### Common Error Codes
- **401**: Authentication required - log in
- **403**: Forbidden - insufficient permissions
- **404**: Resource not found - check IDs
- **500**: Server error - check logs
- **503**: Database unavailable - check connection

---

## 🔮 Future Roadmap

### v1.1 (Next Release)
- [ ] Socket.io real-time updates (replace polling)
- [ ] WhatsApp order notifications
- [ ] Customer loyalty program
- [ ] Staff shift scheduling

### v1.2
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics with charts
- [ ] Multi-currency support
- [ ] Tax customization per region

### v1.3
- [ ] AI-powered demand forecasting
- [ ] Delivery driver app
- [ ] Third-party integrations (Zomato, Swiggy)
- [ ] Voice ordering support

### v2.0
- [ ] Redis caching layer
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Kubernetes orchestration

---

## 📝 License

**Proprietary Software**. All rights reserved.

This software is the exclusive property of **Tap2Serve Team**. Unauthorized copying, modification, distribution, or use is strictly prohibited without explicit written permission.

---

## 👥 Support

### Documentation
- [API Reference](./docs/API.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Dashboard Fixes](./DASHBOARD_FIX_SUMMARY.md)

### Contact
- **Email**: support@tap2serve.com
- **Website**: https://tap2serve.com
- **GitHub**: https://github.com/StartUp-2025/Tap2Serve

### Contributing
This is a proprietary project. For partnership or licensing inquiries, contact the team directly.

---

## 📜 Changelog

### v1.0.0 (2025-12-24)
- ✨ Initial production release
- ✅ Complete dashboard with all features
- ✅ Multi-restaurant support
- ✅ Kitchen Display System
- ✅ Inventory management
- ✅ Waiter call system
- ✅ QR ordering
- ✅ Payment integration
- 🔧 Fixed JWT authentication issues
- 🔧 Fixed order flow from Tables to Live Orders
- 🔧 Fixed menu management bugs
- 🔧 Added diagnostic tools

---

**Built with ❤️ by Tap2Serve Team**

*Revolutionizing dining experiences, one restaurant at a time.*
