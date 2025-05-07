require('dotenv').config();
const mongoose = require('mongoose');
const { CreateSuper } = require('../utils/helpers');

const connectDB = async () => {
    try {
        const dbURI = process.env.DATABASE_URL;
        if (!dbURI) {
            throw new Error('DATABASE_URL is not defined in .env file');
        }

        console.log('Connecting to database ....');
        mongoose.set('bufferCommands', false);
        await mongoose.connect(dbURI);

        try {
            await CreateSuper();
        } catch (error) {
            console.log('Error while creating the super account:', error.message);
        }
    } catch (error) {
        console.error('Error connecting to database or creating super user:', error.message);
        process.exit(1);
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

module.exports = { mongoose, connectDB };