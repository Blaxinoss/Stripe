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



// const { Queue, QueueEvents } = require('bullmq');
// const Redis = require('ioredis');

// // إعداد الاتصال بـ Redis
// const connection = new Redis({   
//     host: 'localhost',
//     port: 6379,
//     maxRetriesPerRequest: null 
// });
// connection.on('connect', () => {
//     console.log('Connected to Redis');
// });

// connection.on('error', (err) => {
//     console.error('Error connecting to Redis:', err);
// });

// // إنشاء الكيو
// const downloadQueue = new Queue('downloadQueue', {
//     connection
// });



// // إنشاء QueueEvents للاستماع للأحداث
// const queueEvents = new QueueEvents('downloadQueue', {
//     connection
// });

// // الاشتراك في الأحداث
// queueEvents.on('completed', (job) => {
//     console.log(`Job ${job.id} completed!`);
// });

// queueEvents.on('failed', (job, err) => {
//     console.log(`Job ${job.id} failed with error: ${err.message}`);
// });


// import { Cluster } from 'puppeteer-cluster';
// import { downloadWorkerLogic } from './downloadWorker';

// // دالة لإنشاء المسبح
// export async function createBrowserPool() {
//     const cluster = await Cluster.launch({
//         concurrency: Cluster.CONCURRENCY_PAGE,  // تعيين نوع الـ concurrency (تعدد الصفحات)
//         maxConcurrency: 3,  // تحديد العدد الأقصى للصفحات المفتوحة في نفس الوقت
//         puppeteerOptions: {
//             headless: true,  // تشغيل المتصفح في وضع الـ headless
//             args: ['--no-sandbox', '--disable-setuid-sandbox']
//         }
//     });

//     // تنفيذ الكود الذي يجب على الـ cluster فعله عند استقبال job
//     await cluster.task(async ({ page, data: { userId, downloadLink } }) => {
//         try {
//             await downloadWorkerLogic({ userId, downloadLink, page });  // تمرير الـ page وبيانات الـ job
//         } catch (err) {
//             console.error('Error processing job in cluster task:', err);
//             throw err;
//         }
//     });

//     cluster.on('idle', async () => {
//         console.log('All jobs processed, closing cluster...');
//         await cluster.close();  // إغلاق المسبح بعد انتهاء جميع الوظائف
//     });
//     cluster.on('error', (err) => {
//         console.error('Cluster error:', err);
//     });
//     cluster.on('taskerror', (err) => {
//         console.error('Task error:', err);
//     });
//     cluster.on('taskfinish', (taskId, result) => {
//         console.log(`Task ${taskId} finished with result:`, result);
//     });

//     return cluster;
// }

module.exports.Router = serverAdapter.getRouter();

module.exports.connection = connection;
module.exports.downloadQueue = downloadQueue;
module.exports.queueEvents = queueEvents;

// Moved to server/lib/queue.js
