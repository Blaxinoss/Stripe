import { Cluster } from 'puppeteer-cluster';
import { downloadWorkerLogic } from './downloadWorker';

// دالة لإنشاء المسبح
export async function createBrowserPool() {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,  // تعيين نوع الـ concurrency (تعدد الصفحات)
        maxConcurrency: 3,  // تحديد العدد الأقصى للصفحات المفتوحة في نفس الوقت
        puppeteerOptions: {
            headless: true,  // تشغيل المتصفح في وضع الـ headless
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    // تنفيذ الكود الذي يجب على الـ cluster فعله عند استقبال job
    await cluster.task(async ({ page, data: { userId, downloadLink } }) => {
        try {
            await downloadWorkerLogic({ userId, downloadLink, page });  // تمرير الـ page وبيانات الـ job
        } catch (err) {
            console.error('Error processing job in cluster task:', err);
            throw err;
        }
    });

    return cluster;
}

