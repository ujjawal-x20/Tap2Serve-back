# Tap2Serve - Multi-Restaurant QR Ordering System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-Proprietary-red.svg) ![Stack](https://img.shields.io/badge/stack-MERN-green.svg)

**Tap2Serve** is an enterprise-grade, SaaS-ready platform designed to digitize dining experiences. It enables restaurants to offer seamless QR-based ordering, manage multiple branches, handle reservations, and track kitchen operations—all from a single, unified dashboard. It is built for rigorous consistency, high concurrency, and zero-downtime reliability.

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
9. [Deployment Guide](#-deployment-guide)
10. [Usage Guide](#-usage-guide)
11. [Testing & Validation](#-testing)
12. [Future Roadmap](#-future-roadmap)

---

## 🚀 Project Overview

**The Problem:** Traditional dining is plagued by wait times, order errors, and inefficient communication between front-of-house (waiters) and back-of-house (kitchen). Managing inventory across multiple branches and reconciling payments is often a manual, error-prone process.

**The Solution:** Tap2Serve provides a **Digital Operating System** for restaurants.
- **Customers**: Scan a QR code, view a multi-language menu, place orders directly to the kitchen, and pay online or via cash.
- **Kitchen**: Receives orders instantly on a **Kitchen Display System (KDS)**, reducing turnaround time.
- **Management**: Tracks real-time sales, inventory usage, and staff performance across all branches.
- **Waiters**: Receive alerts on a dedicated panel when guests need assistance.

**End-to-End Flow:**
1. **Scan**: Guest scans table-specific QR code.
2. **Order**: Guest selects items (customizable), adds to cart, and confirms.
3. **Process**: Backend verifies inventory (atomic transactions), generates unique Order ID, and pushes to KDS.
4. **Prepare**: Chef marks order 'Cooking' → 'Ready'.
5. **Serve**: Waiter serves food; updates status to 'Served'.
6. **Pay**: Guest pays; Invoice is generated (unique ID); Inventory is permanently debited.

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Winston, Morgan
- **Payments**: Stripe API

### Frontend
- **Core**: HTML5, Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS (Utility-first)
- **Icons**: Google Material Symbols
- **Fonts**: Inter (Google Fonts)
- **PWA**: Service Workers with Cache API for offline resilience

### DevOps & Tools
- **Containerization**: Docker, Docker Compose
- **Process Manager**: PM2 (Production)
- **Version Control**: Git
- **Linting**: ESLint

---

## 📂 Folder Structure

The project follows a modular MVC (Model-View-Controller) architecture, separating concerns for scalability.

```
/
├── backend/                  # Server-side logic
│   ├── postman/              # Postman Collections for API testing
│   ├── src/
│   │   ├── config/           # Database & App Configuration
│   │   │   └── db.js         # MongoDB Connection Utility
│   │   ├── controllers/      # Business Logic (Request Handlers)
│   │   │   ├── authController.js       # Login/Register
│   │   │   ├── orderController.js      # Order Lifecycle & Inventory Transactions
│   │   │   └── branchController.js     # Branch Management
│   │   ├── middleware/       # Express Middleware
│   │   │   ├── authMiddleware.js       # JWT Verification & RBAC
│   │   │   └── tenantMiddleware.js     # Multi-tenancy (Restaurant Scoping)
│   │   ├── models/           # Mongoose Schemas (Data Layer)
│   │   │   ├── Order.js      # Order Schema with Indices
│   │   │   └── Inventory.js  # Inventory with Optimistic Locking
│   │   ├── routes/           # API Route Definitions
│   │   │   ├── orderRoutes.js
│   │   │   └── webhooks.js
│   │   ├── utils/            # Helper Functions
│   │   │   ├── generateToken.js
│   │   │   └── emailService.js
│   │   └── services/         # Complex Business Logic (Optional)
│   └── server.js             # Entry Point (App Mounting)
├── testing-page/             # Frontend Client (PWA)
│   ├── css/                  # Custom Styles
│   ├── js/                   # Frontend Logic
│   ├── sw.js                 # Service Worker (Offline Support)
│   ├── dashboard.html        # Admin/Staff Dashboard
│   └── menu.html             # Customer QR Menu Interface
├── .env.example              # Environment Variable Template
├── docker-compose.yml        # Container Orchestration
└── README.md                 # Project Documentation
```

---

## ✨ Key Features

### 1. **Multi-Restaurant & Multi-Branch Architecture**
- **Single SaaS Instance**: Can host thousands of restaurants.
- **Data Isolation**: `tenantMiddleware` ensures `restaurantId` is injected into every query.
- **Branch Scoping**: Managers only see data for their specific `branchId`.

### 2. **QR Code Ordering (Contactless)**
- **Dynamic Menus**: Menus update instantly based on stock.
- **Table Awareness**: Every order is tagged with `tableNo` for precise delivery.
- **Multi-Language**: Instant toggle between English and Hindi (extensible).

### 3. **Kitchen Display System (KDS)**
- **Real-Time Polling**: Auto-refreshes every 3-5 seconds.
- **Kanban View**: Visual flow: New → Cooking → Ready.
- **Timer Alerts**: Cards turn red if prep time exceeds 15 minutes.

### 4. **Inventory Management (Atomic)**
- **Race Condition Proof**: Uses MongoDB atomic operators (`$inc`, `$gte`) to prevent negative stock.
- **Saga Pattern**: Implements manual rollback if an order partially fails (e.g., 2 items succeed, 1 fails).
- **Low Stock Alerts**: Visual indicators on Dashboard.

### 5. **Waiter Calling System**
- **Guest Panel**: "Call Waiter", "Request Bill", "Need Water".
- **Staff Panel**: Floating Alert Box on Dashboard with "Resolve" action.
- **Audible/Visual Alerts**: Pulse animations for unread calls.

### 6. **Reservations & Tables**
- **Floor Plan**: Visual grid of tables with status (Empty, Occupied, Reserved).
- **Merge/Split**: Logic to combine tables for large parties.
- **Booking Engine**: Guests can book slots; Managers confirm/reject.

### 7. **Robust Security & Idempotency**
- **Idempotency Keys**: Prevents double-charging if a user clicks "Pay" twice.
- **RBAC**: 
    - `Admin`: Full System Access
    - `Owner`: Manage Restaurant & Branches
    - `Manager`: Manage specific Branch
    - `Cashier`: Process Payments only
- **Sanitization**: Inputs validated to prevent NoSQL injection.

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api/v1`

| Resource | Method | Endpoint | Purpose | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/auth/login` | Login & get JWT | Public |
| | POST | `/auth/register` | Register new restaurant | Public |
| **Orders** | GET | `/orders` | List orders (Scoped) | Staff |
| | POST | `/orders` | Place new order | Public/Guest |
| | PUT | `/orders/:id/status` | Update (Cooking/Served) | Staff |
| | PUT | `/orders/:id/invoice` | Generate Invoice ID | Cashier |
| **Menu** | GET | `/menu` | Fetch active items | Public |
| | POST | `/menu` | Add item | Owner |
| **Branch** | GET | `/branches` | List branches | Owner |
| | PUT | `/branches/:id/prep` | Update prep time | Manager |
| **Waiters** | POST | `/waiter` | Create call | Guest |

**Authentication Header:**  
`Authorization: Bearer <token>`

---

## 🗄 Database Schema

The system uses a normalized-like schema in a NoSQL environment (MongoDB) for flexibility.

*   **Restaurant**: Root entity. Contains `name`, `ownerId`.
*   **Branch**: Children of Restaurant. `address`, `contact`, `prepTime`.
*   **User**: Admin or Staff. Linked to `restaurantId` and optional `branchId`.
*   **Menu**: `name`, `price`, `category`, `stock`, `inventoryId`.
*   **Order**:
    *   `items`: Array of snapshots (price at time of order).
    *   `status`: Enum (New, Cooking, Ready, Served, Paid).
    *   `idempotencyKey`: Unique index (Sparse).
    *   `paymentId`: Link to Stripe.
*   **Inventory**: `menuId`, `quantity`, `lowStockThreshold`.
*   **Reservation**: `customerName`, `time`, `guests`, `tableNo`.

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` root:

```env
# Server Config
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/tap2serve

# Security
JWT_SECRET=super_secret_key_change_in_production

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000

# Email (Optional)
EMAIL_USER=admin@tap2serve.com
EMAIL_PASS=smtp_password
```

---

## 💿 Installation & Setup

### Prerequisites
*   Node.js v16+
*   MongoDB (Local or Atlas)
*   Git

### 1. Clone & Install
```bash
git clone https://github.com/StartUp-2025/Tap2Serve.git
cd Tap2Serve

# Backend Setup
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your MongoDB URI.

### 3. Run Locally
**Backend:**
```bash
# Inside /backend
npm run dev
# Server runs on port 5000
```

**Frontend:**
The frontend is a static PWA. You can serve it using specialized tools or simply open `testing-page/dashboard.html` in a browser. For production behavior, use `extensions` or `live-server`.

---

## 🚢 Deployment Guide (Docker)

**1. Build Image:**
```bash
docker build -t tap2serve-backend ./backend
```

**2. Run Container:**
```bash
docker run -d -p 5000:5000 --env-file ./backend/.env tap2serve-backend
```

**3. Production (PM2):**
On a VPS (Ubuntu/DigitalOcean):
```bash
# Install PM2
npm install -g pm2

# Start App
pm2 start server.js --name "tap2serve-api" -i max
```

---

## 📱 Usage Guide

### Customer (Guest)
1.  Open camera, scan QR code.
2.  Browser opens `menu.html?table=5&restaurantId=...`.
3.  Browse items, add to cart, click "Place Order".
4.  Wait for food; use "Call Waiter" button if needed.

### Kitchen Staff
1.  Log in to Dashboard.
2.  Navigate to **Kitchen Panel**.
3.  View "New" tickets. Click "Start Cooking" → moves to "Cooking".
4.  When done, click "Mark Ready".

### Manager / Admin
1.  Log in to Dashboard.
2.  **Overview**: View live revenue, active guests.
3.  **Inventory**: Edit stock levels; system auto-hides out-of-stock items.
4.  **Reports**: Check "Sales Reports" for weekly trends.

---

## 🧪 Testing

### Manual Test Flow (Branch Isolation)
1.  Create 2 branches (B1, B2).
2.  Create User U1 (Branch B1) and User U2 (Branch B2).
3.  Log in as U1.
4.  Create an order for B1.
5.  Log in as U2.
6.  **Verify**: U2 should **NOT** see the order for B1.

### Offline Mode Test
1.  Load `menu.html`.
2.  Turn off WiFi / Network.
3.  Refresh page.
4.  **Verify**: Page still loads (Service Worker).
5.  Try to place order → Should show "Offline" alert.

---

## 🔮 Future Roadmap

*   [ ] **Socket.io Integration**: Replace polling with real-time WebSocket events.
*   [ ] **Redis Caching**: Cache menu items to reduce DB load.
*   [ ] **AI Recommendations**: "Customers who ate this also ordered..."
*   [ ] **Driver App**: For delivery management.

---

## 📄 License

Proprietary Software. All rights reserved.
Developed by **Tap2Serve Team**.
