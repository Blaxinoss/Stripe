const { Cluster } = require('puppeteer-cluster');
const { downloadWorkerLogic } = require('./downloadlogic');  // يجب أن يكون لديك هذا الملف

// دالة لإنشاء المسبح (cluster)
async function createBrowserPool() {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,  // تعيين نوع الـ concurrency (تعدد الصفحات)
        maxConcurrency: 3,  // تحديد العدد الأقصى للصفحات المفتوحة في نفس الوقت
        puppeteerOptions: {
            headless: true,  // تشغيل المتصفح في وضع الـ headless
            args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-zygote',
    '--single-process'
  ]
,
        },
        timeout: 120000, 
    });

    // تنفيذ الكود الذي يجب على الـ cluster فعله عند استقبال job
    await cluster.task(async ({ page, data: { userId, downloadLink,jobId } }) => {
        try {
            if (!userId ) {
                throw new Error('Message from the cluster task: userId is required go back and check the task you add to the queue and make sure you pass the userId');
            }
            const result = await downloadWorkerLogic({ userId, downloadLink, jobId,page });
            return result;
        } catch (err) {
            console.error('Error processing job in cluster task:', err);
            throw err;
        }
        
    });



    cluster.on('error', (err) => {
        console.error('Cluster error:', err);
    });

    cluster.on('taskerror', (err) => {
        console.error('Task error:', err);
    });

    cluster.on('taskfinish', (taskId, result) => {
        console.log(`Task ${taskId} finished with result:`, result);
    });

    return cluster;
}

module.exports = { createBrowserPool };
