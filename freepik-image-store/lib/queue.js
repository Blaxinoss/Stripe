// queue/downloadQueue.js
const { Queue } = require('bullmq');
const Redis = require('ioredis');

// إعداد الاتصال بـ Redis
const connection = new Redis({
    host: 'localhost',
    port: 6379
});

// إنشاء الطابور
const downloadQueue = new Queue('downloadQueue', {
    connection
});

module.exports.connection = connection;
module.exports.downloadQueue = downloadQueue;
