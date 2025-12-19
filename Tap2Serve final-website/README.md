# Tap2Serve - Restaurant Management SaaS Platform

Tap2Serve is a comprehensive SaaS solution designed to streamline restaurant operations. It provides a platform for restaurant owners to manage menus, orders, and payments, while offering a super-admin panel for system-wide oversight.

## 🚀 Technology Stack

### Frontend
- **HTML5**: Semantic and accessible structure.
- **Tailwind CSS**: Utility-first CSS framework for rapid and responsive UI design.
- **GSAP (GreenSock)**: High-performance animations (modals, stair-effects, scroll triggers).
- **Vanta.js**: WebGL-based animated backgrounds (Birds effect).
- **Material Symbols**: Modern iconography by Google.

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated web framework for Node.js.
- **MongoDB**: NoSQL database for flexible data storage.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.

### Security & Authentication
- **JWT (JSON Web Tokens)**: Secure stateless authentication.
- **Bcryptjs**: Password hashing.
- **Helmet**: Http headers security (optional config).
- **Rate Limiting**: Protects against brute-force and DDoS attacks.

---

## 📦 Dependencies (Backend)

| Package | Purpose |
|O|---|
| `express` | Web server framework |
| `mongoose` | Database ODM |
| `dotenv` | Environment variable management |
| `cors` | Cross-Origin Resource Sharing support |
| `bcryptjs` | Password encryption |
| `jsonwebtoken` | User authentication tokens |
| `stripe` | Payment processing integration |
| `nodemailer` | Email sending service |
| `winston` | Logging library |
| `morgan` | HTTP request logger |
| `express-validator`| Request data validation |

---

## 📡 API Documentation

The backend exposes a RESTful API versioned at `/api/v1`.

### Status
- **Health Check**: `GET /health`

### Authentication (`/api/v1/auth`)
- `POST /register`: Register a new restaurant owner (or user).
- `POST /login`: Authenticate user and receive JWT.

### API Routes
- **Admin** (`/api/v1/admin`): User management, approval workflows, system configuration.
- **Restaurants** (`/api/v1/restaurants`): Create, read, update, delete restaurant profiles.
- **Menu** (`/api/v1/menu`): Manage menu items, categories, and prices.
- **Orders** (`/api/v1/orders`): Place orders, update status (pending, cooking, ready, delivered).
- **Stats** (`/api/v1/stats`): Dashboard analytics (sales, order counts).
- **Payments** (`/api/v1/payments`): Stripe payment session creation and webhooks.

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas Connection)

### 1. Clone & Install
```bash
# Clone the repository
git clone <repository-url>

# Navigate to backend
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/tap2serve
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 3. Running the Server
```bash
# Development mode (with nodemon)
npm run dev

# Production start
npm start
```
The server will run on `http://localhost:3000`.

### 4. Running the Frontend
- The frontend is served statically by the backend for simpler deployment.
- **Landing Page**: http://localhost:3000/
- **Login Page**: http://localhost:3000/login

---

## 📂 Project Structure

```
Tap2Serve/
├── backend/                # Node.js API Server
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route logic
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   └── routes/         # API endpoints
│   ├── server.js           # Entry point
│   └── package.json
│
├── testing-page/           # Landing Page (Frontend)
│   ├── index.html
│   └── ...
│
└── FInal-login-Page/       # Login/Signup/Admin (Frontend)
    ├── index.html
    └── script.js
```
