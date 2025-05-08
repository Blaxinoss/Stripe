require('dotenv').config();
require('./configurations/passport');
const express = require('express');
const cors = require('cors');
const http = require('http');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const { initSocket, getSocketInstance } = require('./socket');
const { connectDB } = require('../server/configurations/database');
const { ImageModel } = require('../server/models/ImageModel');
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_URL,
  maxRetriesPerRequest: null,
});

const corsOrigin = process.env.FRONTEND_URL
require('./lib/worker')
const app = express();

const corsOptions = {
  origin:  corsOrigin, // Allow requests from your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many requests from this IP, please try again later.',
});

app.get('/',(req,res)=>{
  res.send('hello from the server')
})


app.use('/api/', limiter);

const server = http.createServer(app);
const io = initSocket(server);
app.use(passport.initialize());

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/coins', require('./routes/coinRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/freepik', require('./routes/downloadRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/images', require('./routes/userImagesRoutes'));

// Subscribe to Redis channel
redis.subscribe('download:completed', (err) => {
  if (err) {
    console.error('Failed to subscribe to Redis channel:', err);
  } else {
    console.log('Subscribed to download:completed channel');
  }
});

// Listen for messages from Redis
redis.on('message', async(channel, message) => {
  if (channel === 'download:completed') {
    const io = getSocketInstance();
    const { userId, imageUrl, jobId } = JSON.parse(message);
    console.log(`Emitting downloadedImage to user ${userId}`);
    
 // Save to MongoDB
 try {
  if (!downloadUrl) {
    throw new Error('Download URL is not set. Cannot save to database.');
  }

  const newImage = new ImageModel({
    userId,
    downloadUrl,
    downloadCount: 0,
    maxDownloads: 3,
  });
  await newImage.save();
  console.log(`Image saved to database for user ${userId}`);

  // Emit to Frontend via Socket.IO
  io.to(userId).emit('downloadedImage', { userId, downloadUrl, jobId });
} catch (error) {
  console.error('Error saving image to database:', error.message);
}}
  
});

module.exports = app;
exports.io = io;