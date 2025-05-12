const { Cluster } = require('puppeteer-cluster');
const { downloadWorkerLogic } = require('./downloadlogic'); // Ensure this file exists

// Function to create the browser pool (cluster)
async function createBrowserPool() {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE, // One page per browser instance
        maxConcurrency: 3, // Limit to 3 concurrent pages
        puppeteerOptions: {
            headless: true, // Ensure headless mode
            executablePath: '/usr/bin/chromium', // Use system Chromium
            args: [
                '--disable-gpu',
                '--disable-setuid-sandbox',
                '--no-sandbox',
                '--no-zygote',
                '--disable-dev-shm-usage'
            ],
            timeout: 120000, // 120 seconds timeout
        },
        retryLimit: 2, // Retry failed tasks up to 2 times
        retryDelay: 1000, // Wait 1 second between retries
    });

    // Define the task for the cluster
    await cluster.task(async ({ page, data: { userId, downloadLink, jobId } }) => {
        try {
            if (!userId) {
                throw new Error(
                    'Message from the cluster task: userId is required. Go back and check the task you added to the queue and make sure you pass the userId'
                );
            }
            const result = await downloadWorkerLogic({ userId, downloadLink, jobId, page });
            return result;
        } catch (err) {
            console.error('Error processing job in cluster task:', err);
            throw err;
        }
    });

    // Set up event listeners for the cluster
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
