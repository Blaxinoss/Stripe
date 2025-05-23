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

router.put(
  '/user-images/:imageId/downloadcounteradd',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user._id; // Assuming req.user is populated by passport
      const { imageId } = req.params;

      // Find the image by ID and ensure it belongs to the authenticated user
      const image = await Download.findOne({ _id: imageId, userId });

      if (!image) {
        return res.status(404).json({ message: 'Image not found or access denied' });
      }
      console.log('Image found:', image);

      // Check if the download count has reached the maximum allowed downloads
      if (image.downloadCount >= image.maxDownloads) {
        return res.status(403).json({ message: 'Maximum download limit already reached how did you get here' });
      }

      // Increment the download count
      image.downloadCount += 1;
      await image.save();

      res.status(200).json({ message: 'Download count updated', downloadCount: image.downloadCount });
    } catch (error) {
      console.error('Error updating download count:', error);
      res.status(500).json({ message: 'Failed to update download count' });
    }
  }
);

module.exports = router;