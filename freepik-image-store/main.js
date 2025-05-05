require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require('crypto');
const passport = require('passport');
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 10, // 10 طلبات لكل IP في كل نافذة زمنية
    message: 'Too many requests from this IP, please try again later.'
});


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


require('./configurations/database');
require('./configurations/passport');
app.use(passport.initialize());



app.use('/api/', limiter);

app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/coins', require('./routes/coinRoutes'))
app.use('/api/payment', require('./routes/paymentRoutes'))
app.use('/api/freepik', require('./routes/downloadRoutes'))
app.use('/api/search', require('./routes/searchRoutes'))


app.listen(5000, () => console.log("Server running on port 5000"));