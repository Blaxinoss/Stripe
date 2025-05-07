const express = require('express');
const passport = require('passport');
const { USER } = require('../models/User');
const { isAdmin } = require('../utils/helpers');
const Router = express.Router();


Router.post('/increase_coins/:userId', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { userId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    try {
        const user = await USER.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.coins += amount;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Added ${amount} coins to ${user.username}`,
            new_coins: user.coins
        });
    } catch (err) {
        console.error('Error updating coins:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = Router;