var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

passport.use(new LocalStrategy({
    usernameField: 'email'
}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const dotenv = require("dotenv");
dotenv.config();

exports.getToken = function(user) {
    return jwt.sign(user, process.env.SECRET_KEY,
        {expiresIn: 3600 * 24}); //3600 secs = 1hr
};

var options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.SECRET_KEY;

exports.jwtPassport = passport.use(new JwtStrategy(options,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if(!user){
                return done(null, false, {message: "User doesn't exist"});
            }
            return done(null, user);
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});