const express = require('express')
const Router = express.Router();
const axios = require('axios')
const Jimp = require('jimp')
const { connectDB } = require('../configurations/database');

const extractId = (searchLink) => {
    const match = searchLink.match(/_(\d+)\.htm/);

    if (match) {
        const number = match[1];
        return number
    }
}

Router.get('/', async (req, res) => {



    const FREEPIK_API_KEY = process.env.FREEPIK_API_KEY

    try {
        if (typeof FREEPIK_API_KEY !== "string" || !FREEPIK_API_KEY) {
            return res.status(400).json({ error: "Invalid API Key" });
        }

        const searchLink = req.query.searchLink; // Get the full URL from frontend

        const PhotoID = extractId(searchLink)
        console.log(PhotoID)


        const response = await axios.get(`https://api.freepik.com/v1/resources`, {
            params: {
                filters: {
                    ids: PhotoID
                },
                limit :5
            },
            headers: {
                'x-freepik-api-key': FREEPIK_API_KEY,
                'Accept-Language': 'en-US'
            }
        });


        if (!response.data || !response.data.data || response.data.data.length === 0) {
            return res.status(404).json({ error: "No images found" });
        }


        const imgDataArray = response.data.data; // Array of up to 5 images
        const processedImages = [];

        for (const imgData of imgDataArray) {
            const imageUrl = imgData.image.source.url;
            const isFree = imgData.licenses.some(license => license.type === "free" || license.type === "freemium");

            try {
                // Download the image
                const image = await Jimp.read(imageUrl);

                // Blur only if it's not free (e.g., premium)
                if (!isFree) {
                    image.blur(3); // Apply blur to premium images
                }

                // Convert to base64
                const base64Image = await image.getBase64Async(Jimp.MIME_PNG);
                const processedImage = {
                    id: imgData.id,
                    title: imgData.title,
                    thumbnail: base64Image, // Blurred if premium, unblurred if free
                    original: imgData.url,
                    isFree: isFree // Include this for client-side info
                };

                processedImages.push(processedImage);
            } catch (imageError) {
                console.error(`Error processing image ${imgData.id}:`, imageError);
                // Skip this image and continue with others
                processedImages.push({
                    id: imgData.id,
                    title: imgData.title,
                    thumbnail: null,
                    original: imgData.url,
                    isFree: isFree,
                    error: "Failed to process image"
                });
            }
        }

        res.json(processedImages); // Return array of processed images
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

module.exports = Router;