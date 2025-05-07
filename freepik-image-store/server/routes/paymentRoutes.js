const express = require('express');
const passport = require('passport');
const { USER } = require('../models/User');
const Router = express.Router();


Router.post('/pay', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { amount } = req.body;

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!amount || req.user?.coins < amount || amount <= 0) {
            return res.status(400).json({ success: false, message: `insufficient Balance, Your current coins are ${req.user.coins} and you need ${amount}` })
        }

        const userDB = await USER.findOneAndUpdate(
            { _id: req.user._id, coins: { $gte: amount } },
            { $inc: { coins: -amount } },
            { new: true, runValidators: true }
        );

        if (!userDB) {
            return res.status(404).json({ success: false, message: 'couldn\'t find the user you asked for' })
        }

        return res.status(200).json({ success: true, message: `Transaction succeed, Purchased valid your new balance is ${userDB.coins}`, userDB })

    } catch (error) {
        res.status(500).json({ success: false, message: "Something wrong with the server...", error: error.message })

    }

})

module.exports = Router;