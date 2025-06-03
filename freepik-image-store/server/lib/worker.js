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

async function initializeCluster() {
  try {
    cluster = await createBrowserPool();
    console.log('✅ Cluster initialized successfully');

    startWorker(); // Start worker only AFTER cluster is ready
  } catch (error) {
    console.error('❌ Failed to initialize cluster:', error.message);
    process.exit(1); // exit if we can’t even get a browser pool
  }
}

function startWorker() {
  const worker = new Worker(
    'downloadQueue',
    async job => {
      const { userId, downloadLink } = job.data;
      const jobId = job.id;

      console.log(`⚙️  Worker started for job: ${job.id}`);
      try {
        if (!downloadLink) {
          throw new Error(
            'Worker Says: Invalid download link. Make sure job data includes userId and downloadLink.'
          );
        }

        console.log(`🔗 Processing download link: ${downloadLink}`);

        // Wait until cluster is ready (should always be ready at this point)
        if (!cluster) {
          throw new Error('Cluster is not ready yet.');
        }
        await cluster.ready();
        const response = await cluster.execute({ userId, downloadLink, jobId });
        console.log(`✅ Cluster execute response:`, response);

        // Notify via Redis Pub/Sub
        await redis.publish(
          'download:completed',
          JSON.stringify({
            userId,
            imageUrl: response.imageUrl,
            jobId,
          })
        );

        return response;
      } catch (error) {
        console.error('❌ Error processing job:', error.message);

        await redis.publish(
          'download:failed',
          JSON.stringify({
            userId,
            jobId,
            error: error.message,
          })
        );

        throw error;
      }
    },
    { connection }
  );

  worker.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed with result:`, result);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed with error: ${err.message}`);
  });

  console.log('🎧 Worker is now listening for jobs...');
}

// Start only the cluster first
initializeCluster();
