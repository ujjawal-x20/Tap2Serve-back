const socketIo = require('socket.io');
let io;

const init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join', (restaurantId) => {
            socket.join(restaurantId);
            console.log(`Socket ${socket.id} joined restaurant room: ${restaurantId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

const emitEvent = (room, event, data) => {
    if (io) {
        io.to(room).emit(event, data);
    }
};

module.exports = { init, getIO, emitEvent };
