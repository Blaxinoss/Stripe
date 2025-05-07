const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');
const { USER } = require('../models/User');
const fs = require('fs');
const path = require('path');
const PUB_KEY =fs.readFileSync(path.join(__dirname, '../utils/id_rsa_pub.pem'), 'utf8');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
};

// دي الجزئية اللي بتحدد إزاي Passport هيتعامل مع التوكن بعد ما يفحصه

passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
    try {
        const user = await USER.findOne({ _id: jwt_payload.sub });
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));