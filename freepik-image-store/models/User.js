const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    email: {
        type: String,
        unique: [true, "this email has an account already signed in"],
        match: [/^\S+@\S+\.\S+$/, "Invalid email"],
        required: [true, "Email is required"],
        lowercase: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
        minLength: [5, "Name should be more than 5 characters"],
        unique: [true, "Username already taken"],
    },
    hash: { type: String },
    salt: { type: String },
    coins: { type: Number, default: 0, },
    downloadsCount: { type: Number, default: 0, min: 0 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
},
    { timestamps: true }
);



const USER = mongoose.model('User', UserSchema);

module.exports.USER = USER