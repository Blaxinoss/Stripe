import { Worker } from 'bullmq';
import { createBrowserPool } from '../services/cluster';
const { connection } = require('../lib/queue');

// إنشاء مسبح المتصفحات
const cluster = await createBrowserPool();
// إنشاء مسبح المتصفحات

const worker = new Worker('download-images', async job => {
    const { userId, downloadLink } = job.data;
    try {
        // استخدام cluster لمعالجة الـ job
        await cluster.queue({ userId, downloadLink });
    } catch (error) {
        console.error('Error processing job:', error);
        throw error;  // مهم: لو حبيت ترمي الخطأ مرة تانية بعد معالجته
    }
}, { connection });

worker.on('completed', job => {
    console.log(`✅ Job ${job.id} completed`);
    cluster.close();
});

worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed: ${err.message}`);
    cluster.close();

});