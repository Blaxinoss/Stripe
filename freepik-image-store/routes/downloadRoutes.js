
require('dotenv').config();
const express = require('express');
const { timeout } = require('puppeteer');
const Router = express.Router();
const passport = require('passport');
const { USER } = require('../models/User');
const { downloadQueue } = require('../lib/queue'); // Ensure the path '../lib/queue' matches the actual file structure and case sensitivity.



Router.use(express.json());

Router.post('/download/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { userId,downloadLink } = req.body 
    const user = await USER.findById(userId);
    if (!user || !userId) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (!downloadLink) {
        return res.status(400).json({ message: 'downloadLink is required in the request body' });
    }
    //if we knew that the user and the download link is valid then add it to the queue
    //the queue called downloadQueue

    try {
        // adding the task to the BULLMQ queue not the cluster of puppeter
        const job = await downloadQueue.add('download-image', { userId, downloadLink });
        
        console.log('Job added to queue:', job.id);    
        return res.status(202).json({
          message: 'Job submitted to the queue successfully',
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