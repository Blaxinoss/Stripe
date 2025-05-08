const { Worker } = require('bullmq');
const { createBrowserPool } = require('./cluster');
const { connection } = require('./queue');
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

let cluster;

async function initializeCluster() {
  if (!cluster) {
    cluster = await createBrowserPool();
  }
}

const worker = new Worker(
  'downloadQueue',
  async job => {
    const { userId, downloadLink } = job.data;
    const jobId = job.id;
    console.log(`Worker started for job: ${job.id}`);
    try {
      if (!downloadLink) {
        throw new Error('Worker Says : Invalid download link, check the downloadRoutes to ensure that you are adding the task to BullMQ queue with the right body that have the userId and downloadLink');
      }

      console.log(`Processing download link: ${downloadLink}`);
      await initializeCluster();
      console.log('Cluster initialized successfully');

      //send a task to puppetter cluster with the body that has userId , downloadLink and jobId
      //.execute is better if you deal with workers not 100% sure
      const response = await cluster.execute({ userId, downloadLink, jobId });
      console.log(`Cluster execute response:`, response);

      // Publish the result to Redis
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
      console.error('Error processing job:', error.message);
      throw error;
    }
  },
  { connection }
);

worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});