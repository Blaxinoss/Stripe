const { Worker } = require('bullmq');
const { createBrowserPool } = require('./cluster');
const { connection } = require('./queue');
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  maxRetriesPerRequest: null,
});

console.log('🚀 Worker script started, connecting to Redis...');

let cluster; // cluster will be initialized once browser pool is ready

// أنشئ الووركر بس متبدأش تشتغل لسه (بدون callback فاضي)
const worker = new Worker(
  'downloadQueue',
  async job => {
    if (!cluster) throw new Error('Cluster is not ready yet.');

    const { userId, downloadLink } = job.data;
    const jobId = job.id;

    console.log(`⚙️  Worker started for job: ${job.id}`);

    if (!downloadLink) {
      throw new Error(
        'Worker Says: Invalid download link. Make sure job data includes userId and downloadLink.'
      );
    }

    console.log(`🔗 Processing download link: ${downloadLink}`);

    const response = await cluster.execute({ userId, downloadLink, jobId });
    console.log(`✅ Cluster execute response:`, response);

    await redis.publish(
      'download:completed',
      JSON.stringify({
        userId,
        imageUrl: response.imageUrl,
        jobId,
      })
    );

    return response;
  },
  { connection,attempts:2 }
);

worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed with result:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed with error: ${err.message}`);
});

worker.on('active', (job) => {
  console.log(`🟡 Job ${job.id} is now active`);
});

worker.on('stalled', (jobId) => {
  console.warn(`⚠️ Job ${jobId} has stalled!`);
});

// pause worker عشان ما يعالجش اي جوب قبل ما cluster يجهز
async function pauseWorker() {
  await worker.pause();
  console.log('⏸️ Worker paused, waiting for cluster to initialize...');
}

// resume worker عشان يبدأ يعالج الجوبس بعد تهيئة cluster
async function resumeWorker() {
  await worker.resume();
  console.log('▶️ Worker resumed, now listening for jobs...');
}

// دالة تهيئة الـ cluster و الـ warm-up
async function initializeCluster() {
  try {
    cluster = await createBrowserPool();
    console.log('✅ Cluster initialized successfully');

    try {
      await cluster.execute({
        userId: 'warmup',
        downloadLink: 'https://example.com', // رابط وهمي
        jobId: 'warmup',
      });
      console.log('✅ Warm-up succeeded');
    } catch (warmupError) {
      console.warn('⚠️ Warm-up failed (not critical):', warmupError.message);
    }

    await resumeWorker(); // شغّل الووركر بعد تجهيز الـ cluster
  } catch (error) {
    console.error('❌ Failed to initialize cluster:', error.message);
    process.exit(1);
  }
}

// البرنامج يبدأ هنا
(async () => {
  await pauseWorker();         // علق الووركر مؤقتاً
  await initializeCluster();   // جهز الـ cluster و بعدين شغل الووركر
})();
