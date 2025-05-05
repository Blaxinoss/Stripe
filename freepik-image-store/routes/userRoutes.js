const express = require('express');
const { HashPassword, validatePassword, issueJWT, isAdmin } = require('../utils/helpers');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { USER } = require('../models/User');
const Router = express.Router();

const Image = require('../models/ImageModel');



Router.post('/create_user', [
    body('email').notEmpty().withMessage("Email is required")
        .isEmail().withMessage('Please Enter a valid Email')
        .normalizeEmail(),

    body('password').notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

    body('username').notEmpty().withMessage("Username is required")
        .isLength({ min: 5 }).withMessage('Username must be at least 5 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

], async (req, res) => {


    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { username, password, email } = req.body

    try {
        const { salt, hash } = HashPassword(password)
        const newUser = new USER({
            username: username,
            salt: salt,
            hash: hash,
            email: email,
        })


        await newUser.save();
        res.status(201).json({ success: true, message: "User has been successfully created", newUser });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Email or username already exists" });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
})

Router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "email and password were not provided to log in" })
    }

    try {
        USER.findById
        const user = await USER.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'couldn\'t find the user in the database' });
        }
        console.log(user)

        const isValidatedPassword = validatePassword(password, user?.hash, user?.salt);
        if (!isValidatedPassword) {
            return res.status(401).json({ success: false, message: 'Wrong cardenalities either the email or password are wrong' });
        }

        const { token, expiresIn } = issueJWT(user)
        res.status(200).json({ success: true, message: "you have successfully logged in", token, expiresIn, user })
    } catch (error) {
        console.error('server unexpected error', error);
        res.status(500).json({
            success: false, message: 'server unexpected error'
        });
    }
})

// backend: /api/users/me
Router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ success: true, user: req.user });
});

Router.get('/users', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {

    try {
        const users = await USER.find({})

        return res.status(200).json({ success: true, message: "successfully fetched users data", users })

    } catch (error) {
        res.status(500).json({ success: false, message: 'Couldn\'t get the users, something wrong in the server' });
    }

})


// تأكد إن عندك الموديل ده

Router.get('/user-images',
    passport.authenticate('jwt', { session: false }), // التأكد من تسجيل الدخول
    async (req, res) => {
        try {
            const userId = req.user._id; // جلب الـ userId من الـ JWT
            const images = await Image.find({ userId: userId });
            res.status(200).json({ success: true, message: 'Images fetched successfully', images });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch images', error: error.message });
        }
    }
);


Router.post('/increment-download/:imageId', async (req, res) => {
    try {
        const imageId = req.params.imageId;
        const image = await Image.findById(imageId);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        if (image.downloadCount >= image.maxDownloads) {
            return res.status(400).json({ message: 'Download limit reached' });
        }
        image.downloadCount += 1;
        await image.save();
        res.json({ message: 'Download count updated', downloadCount: image.downloadCount });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update download count', error: err.message });
    }
});

module.exports = Router;