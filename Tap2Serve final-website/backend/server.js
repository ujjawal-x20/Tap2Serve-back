const express = require('express');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorMiddleware');
const logger = require('./src/utils/logger');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketUtil = require('./src/utils/socket');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const restaurantRoutes = require('./src/routes/restaurantRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const statRoutes = require('./src/routes/statRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use(helmet());

// Body parser
// Body parser with raw body preservation for webhooks
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        if (req.originalUrl.includes('/webhook')) {
            req.rawBody = buf;
        }
    }
}));
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Enable CORS with Whitelist
const whitelist = process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Global Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 500, // 500 requests per 15 mins for general API
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Stricter Rate limit for Auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // 20 attempts per 15 mins
    message: 'Too many login attempts, please try again after 15 minutes'
});
app.use('/api/v1/auth', authLimiter);

// Mount routers
// Mount routers
const apiRouter = express.Router();

const branchRoutes = require('./src/routes/branchRoutes');
const waiterRoutes = require('./src/routes/waiterRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');

// Public-specific rate limiters
const publicOrderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many orders from this IP'
});
const publicCallLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many waiter calls from this IP'
});
const publicFeedbackLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 2,
    message: 'Too many feedback submissions'
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/restaurants', restaurantRoutes);
apiRouter.use('/orders', publicOrderLimiter, orderRoutes);
apiRouter.use('/menu', menuRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/stats', statRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/inventory', require('./src/routes/inventoryRoutes'));
apiRouter.use('/reservations', require('./src/routes/reservationRoutes'));
apiRouter.use('/branches', branchRoutes);
apiRouter.use('/waiter', publicCallLimiter, waiterRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/feedback', publicFeedbackLimiter, feedbackRoutes);

app.use('/api/v1', apiRouter);

// Serve SEO files from root
app.get('/robots.txt', (req, res) => res.sendFile(path.join(__dirname, '../robots.txt')));
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(__dirname, '../sitemap.xml')));

// Google Search Console Verification Placeholder
// app.get('/google*.html', (req, res) => res.status(200).send('google-site-verification: googleXXXX.html'));

// STATIC FILES SERVING
// 1. Landing Page (Root)
app.use(express.static(path.join(__dirname, '../testing-page')));

// 2. Explicit folder routes to prevent 404s if user types full path
app.use('/testing-page', express.static(path.join(__dirname, '../testing-page')));
app.use('/FInal-login-Page', express.static(path.join(__dirname, '../FInal-login-Page')));


// 3. Login Page (Mounted at /login)
app.use('/login', express.static(path.join(__dirname, '../FInal-login-Page')));

// Explicit redirect for login navigation
app.get('/login-redirect', (req, res) => {
    res.redirect('/login/');
});

// Catch-all for Frontend (SPA feel if needed, but here simple)
// app.get('*', (req, res) => ...)

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Tap2Serve API is healthy' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
socketUtil.init(server);

server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`);
    // Close server & exit process for safety in production
    server.close(() => process.exit(1));
});

module.exports = server;
