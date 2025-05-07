
require('dotenv').config();
const express = require('express');
const { timeout } = require('puppeteer');
const Router = express.Router();
const passport = require('passport');
const { USER } = require('../models/User');
const { downloadQueue,queueEvents } = require('../lib/queue'); // Ensure the path '../lib/queue' matches the actual file structure and case sensitivity.



Router.use(express.json());

Router.post('/download/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { userId } = req.body 
    const user = await USER.findById(userId);
    if (!user || !userId) {
        return res.status(404).json({ message: 'User not found' });
    }

    const { downloadLink } = req.body;

    if (!downloadLink) {
        return res.status(400).json({ message: 'downloadLink is required in the request body' });
    }
    try {
        const job = await downloadQueue.add('download-image', { userId, downloadLink });
        console.log('Job added to queue:', job.id);    
        return res.status(202).json({
          message: 'Job submitted successfully',
          jobId: job.id
      });
    } catch (error) {
        console.error('Error adding job to queue:', error);
        return res.status(500).json({
            message: 'Couldn\'t add the job to the queue',
            error: error.message
        });
    }
}
);
  

module.exports = Router;