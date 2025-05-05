require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Jimp = require('jimp');
// const payment = require('./Payment')
const crypto = require('crypto')

const app = express();
app.use(cors());
app.use(express.json());

const FREEPIK_API_KEY = process.env.FREEPIK_API_KEY;

function extractId(url) {
    const match = url.match(/_(\d+)\.htm/);
    return match ? match[1] : null;
}

// app.use('/api', payment)

app.get('/search', async (req, res) => {

    try {
        if (typeof FREEPIK_API_KEY !== "string" || !FREEPIK_API_KEY) {
            return res.status(400).json({ error: "Invalid API Key" });
        }

        const searchLink = req.query.searchLink; // Get the full URL from frontend
        const PhotoID = extractId(searchLink)


        const response = await axios.get(`https://api.freepik.com/v1/resources`, {
            params: {
                filters: {
                    ids: PhotoID
                }
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


// app.post('/IframeCallback', (req, res) => {

//     myHMAC = process.env.HMAC;


//     const payload = req.body; // البيانات التي أرسلها Paymob في الجسم
//     console.log(payload)
//     const hmacFromPaymob = payload.hmac;  // الـ HMAC المرسل من Paymob
//     delete payload.hmac;  // إزالة الـ HMAC من البيانات الأصلية

//     // حساب HMAC الخاص بك باستخدام البيانات المرسلة من Paymob
//     const calculatedHmac = calculateHmac(payload, myHMAC);

//     // مقارنة HMAC المحسوب بـ HMAC المرسل من Paymob
//     if (calculatedHmac === hmacFromPaymob) {
//         console.log("HMAC matches! The request is valid.");
//         // هنا يمكنك تنفيذ منطق إضافي مثل تحديث حالة الطلب أو حفظ البيانات
//         res.status(200).send('HMAC is valid');
//     } else {
//         console.log("HMAC mismatch! The request might be tampered with.");
//         res.status(400).send('Invalid HMAC');
//     }
// });

// // دالة لحساب HMAC باستخدام مفتاح API السري
// function calculateHmac(payload, secret) {
//     const stringifiedPayload = JSON.stringify(payload);
//     const hmac = crypto.createHmac('sha256', secret);
//     hmac.update(stringifiedPayload);
//     return hmac.digest('hex');
// }


app.listen(5000, () => console.log("Server running on port 5000"));