const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    logger.error({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
