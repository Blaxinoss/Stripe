const crypto = require('crypto');
const { USER } = require('../models/User');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const validatePassword = (password, hash, salt) => {

    if (!password || !hash || !salt) {
        throw new Error('Password, hash, and salt are required');
    }
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'SHA256').toString('hex');
    return hashVerify === hash;

}


const HashPassword = (password) => {

    if (!password) {
        throw new Error('Password is required');
    }
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'SHA256').toString('hex')

    return { salt, hash }
}


async function CreateSuper() {

    const password = "Asdqwe123564@"

    const { salt, hash } = HashPassword(password)

    try {
        const SuperAdmin = new USER({
            email: "abdullahismael078@gmail.com",
            username: "Blaxinoss",
            salt: salt,
            hash: hash,
            downloadsCount: 0,
            role: "admin",
            coins: 100,

        })

        await SuperAdmin.save()
            .then((data) => {
                console.log('✅ Superadmin created successfully', data);
            })
            .catch((err) => {
                console.error('! Superadmin already exists');
            });

    } catch (error) {
        return ("Error creating the SuperAdmin Account", error.message);
    }
}


function issueJWT(user) {

    const PRIV_KEY = fs.readFileSync(path.join(__dirname, '../utils/id_rsa_priv.pem'), 'utf8');

    const _id = user._id;

    const expiresIn = '1d';

    const payload = {
        sub: _id,
        iat: Math.floor(Date.now() / 1000),
    };

    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });

    return {
        token: "Bearer " + signedToken,
        expiresIn
    }
}




const isAdmin = (req, res, next) => {

    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "You are not authorized to do such thing" })
    }

    next()
}


module.exports = { validatePassword, HashPassword, CreateSuper, issueJWT, isAdmin }