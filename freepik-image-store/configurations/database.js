require('dotenv').config();
const mongoose = require('mongoose');
const { CreateSuper } = require('../utils/helpers');

const connectDB = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in .env file');
        }

        console.log('Connecting to database ....');

        await mongoose.connect(process.env.DATABASE_URL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        try {
            await CreateSuper();

        } catch (error) {
            console.log('error while creating the super account', error.message)
        }
    } catch (error) {
        console.error('Error connecting to database or creating super user:', error.message);
        process.exit(1); // 
    }
};

mongoose.connection.on('connected', () => {
    console.log('Database Connected Successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('Database connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('Database disconnected');
});


connectDB();

module.exports = mongoose;