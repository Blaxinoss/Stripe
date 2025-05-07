const express = require('express');
const router = express.Router();
const passport = require('passport');
const Download = require('../models/ImageModel'); // Adjust the path to your Download model

// Get all images for the authenticated user
router.get(
  '/user-images',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user._id; // Assuming req.user is populated by passport
      const images = await Download.find({ userId })
      res.status(200).json(images);
    } catch (error) {
      console.error('Error fetching user images:', error);
      res.status(500).json({ message: 'Failed to fetch images' });
    }
  }
);

module.exports = router;