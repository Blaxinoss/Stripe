const { Queue, QueueEvents } = require('bullmq');
const Redis = require('ioredis');
const {createBullBoard} = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const {ExpressAdapter} = require('@bull-board/express');
const { create } = require('../models/ImageModel');
const Router = require('express').Router();



const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/bull'); // Optional, but recommended



// إعداد الاتصال بـ Redis
const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  maxRetriesPerRequest: null,
});


connection.on('connect', () => {
    console.log('Connected to Redis Iam the queue');
});

connection.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});

// إنشاء الكيو
const downloadQueue = new Queue('downloadQueue', {
    connection
});


createBullBoard({
    queues: [new BullMQAdapter(downloadQueue)],
    serverAdapter, // <-- use the same instance here!
});
// إنشاء QueueEvents للاستماع للأحداث
const queueEvents = new QueueEvents('downloadQueue', {
    connection
});

module.exports.Router = serverAdapter.getRouter();

module.exports.connection = connection;
module.exports.downloadQueue = downloadQueue;
module.exports.queueEvents = queueEvents;

// Moved to server/lib/queue.js
