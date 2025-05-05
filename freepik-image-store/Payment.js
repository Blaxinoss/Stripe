// const express = require('express');
// const Router = express.Router();
// const axios = require('axios')
// require('dotenv').config();

// //TODO
// //amount_cents(req.body.amount) , req.body.items, LIVE_INTEGRATION_ID  , req.body.billingData

// Router.post('/create-payment', async (req, res) => {
//     try {
//         const response = await axios.post("https://accept.paymob.com/api/auth/tokens", {
//             api_key: process.env.FREE_API_KEY
//         })

//         if (!req.body.billingData) {
//             return res.status(400).json({ error: "billing data are required." });
//         }
//         const AuthToken = response.data.token;
//         // console.log(AuthToken)  //done

//         const orderResponse = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
//             auth_token: AuthToken,
//             delivery_needed: 'false',
//             amount_cents: req.body.amount || "500",
//             currency: "EGP",
//             items: req.body.items || []
//         });

//         const orderId = orderResponse.data.id;

//         const paymentKeyResponse = await axios.post(
//             "https://accept.paymob.com/api/acceptance/payment_keys",
//             {
//                 auth_token: AuthToken,
//                 amount_cents: req.body.amount || "500",
//                 expiration: 3600,
//                 order_id: orderId,
//                 billing_data: req.body.billingData, // البيانات الديناميكية من الـ Frontend
//                 currency: "EGP",
//                 integration_id: process.env.LIVE_INTEGRATION_ID,
//             }
//         );

//         const paymentKey = paymentKeyResponse.data.token;

//         // إنشاء رابط الدفع
//         const iframeId = process.env.LIVE_IFRAME;// استبدل بـ iframe ID بتاع الـ Live
//         const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

//         res.json({ url: paymentUrl });
//     } catch (error) {
//         console.error("Error:", error.response?.data || error.message);
//         res.status(500).json({
//             error: "Payment creation failed",
//             details: error.response?.data || error.message,
//         });
//     }
// });



// module.exports = Router;