//import packages
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

//import config file
var config = require('./config');

//import models
var User = require('../models/user');

//serializer & deserializer
exports.local = passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//create token
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey,
        { expiresIn: 3600 });
};

//options
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

//authentication
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        this.jwt_payload = jwt_payload;
        console.log("JWT payload: ", jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null,user);
            }
            else {
                return done(null, false);
            }
        });
    }));


//verify User
exports.verifyUser = passport.authenticate('jwt', { session: false });

//get Pan
let Pan = 0;
exports.getPan = () => {
    return Pan
}

//logout
let user;
exports.logout = () => {
    return user;
};

//verify Login
// let logout = 0;
// exports.setLogout = (logouttoken) => {
//     logout = logouttoken;
// };
exports.verifyLogin = ((req, res, next) => {
    Pan = req.user.pancard;
    user = req.user._id;
    if (req.user != null && (this.jwt_payload.timestamp - req.user.logout) > 0) {
        next();
    }
    else {
        err = new Error('You need to login first');
        err.status = 401;
        return next(err);
    }
});

//verify Admin
exports.verifyAdmin = ((req, res, next) => {
    if (req.user != null && req.user.type === 'admin') {
        next();
    }
    else {
        err = new Error('Your are not authorized to perform this operation!');
        err.status = 401;
        return next(err);
    }
});

//verify Employee
exports.verifyEmployee = ((req, res, next) => {
    if (req.user != null && (req.user.type === 'employee' || req.user.type === 'admin')) {
        next();
    }
    else {
        err = new Error('Your are not authorized to perform this operation!');
        err.status = 401;
        return next(err);
    }
});

exports.verifyCustomer = ((req, res, next) => {
    if (req.user != null && (req.user.type === 'employee' || req.user.type === 'admin')) {
        next();
    }
    else {
        err = new Error('Your are not authorized to perform this operation!');
        err.status = 401;
        return next(err);
    }
});



