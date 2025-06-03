require('dotenv').config();
require('./configurations/passport');
const express = require('express');
const cors = require('cors');
const http = require('http');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const { initSocket, getSocketInstance } = require('./socket');
const { connectDB } = require('./configurations/database');
const Image = require('./models/ImageModel');
const Redis = require('ioredis');
const PORTLOCAL = process.env.PORTLOCAL;

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Connected to Redis Iam the servevr');});

const corsOrigin = process.env.FRONTEND_URL
require('./lib/worker')
const app = express();

const corsOptions = {
  origin: '*'
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
    console.error('Failed to subscribe to Redis channel download complelte:', err);
  } else {
    console.log('Subscribed to download:completed channel');
  }
});

redis.subscribe('download:failed', (err) => {
  if (err) {
    console.error('Failed to subscribe to Redis channel the failed chaneel:', err);
  } else {
    console.log('Subscribed to download:failed channel');
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
  if (!imageUrl) {
    throw new Error('Download URL is not set. Cannot save to database.');
  }

  const newImage = new Image({
    userId,
    downloadUrl : imageUrl,
    downloadCount: 0,
    maxDownloads: 3,
  });
  await newImage.save();
  console.log(`Image saved to database for user ${userId}`);

  // Emit to Frontend via Socket.IO
  io.to(userId).emit('downloadedImage', { userId, imageUrl, jobId });
} catch (error) {
  console.error('Error saving image to database:', error.message);
}}
else if(channel === 'download:failed') {
    const { userId, jobId,error} = JSON.parse(message);
    console.error(`Download failed for user ${userId}, job ID: ${jobId} , error: ${error}`);
    io.to(userId).emit('downloadFailed', { userId, jobId,error });
  }
});

server.listen(PORTLOCAL, () => {
  console.log(`Server running on http://localhost:${PORTLOCAL}`);
});

module.exports = app;
exports.io = io;

