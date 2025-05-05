
require('dotenv').config();
const express = require('express');
const { timeout } = require('puppeteer');
const Router = express.Router();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const passport = require('passport');
const { USER } = require('../models/User');
const { downloadQueue } = require('../lib/queue'); // Ensure the path '../lib/queue' matches the actual file structure and case sensitivity.


puppeteer.use(StealthPlugin());

async function resizeFront(page) {
    await page.setViewport({ width: 1620, height: 1080 });
}

async function resizeBack(page) {
    await page.setViewport({ width: 1280, height: 720 });
}

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
    const job = await downloadQueue.add('download-task', { userId, downloadLink });
    return res.status(202).json({ message: 'Job added to queue', jobId: job.id });


});

module.exports = Router