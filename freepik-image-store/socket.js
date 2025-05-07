// lib/socket.js
let ioInstance = null;

function initSocket(server) {
  const { Server } = require('socket.io');
  ioInstance = new Server(server, {
    cors:{
    origin: '*',  // Adjust this to match your front-end domain if needed
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }});

  ioInstance.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (userId) => {
      console.log(`User with ID ${userId} joined their room`);
      socket.join(userId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return ioInstance;
}

function getSocketInstance() {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized');
  }
  return ioInstance;
}

module.exports = {
  initSocket,
  getSocketInstance,
};
