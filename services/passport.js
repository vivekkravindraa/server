const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys.js');

const mongoose = require('mongoose');
const User = mongoose.model('users');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById({ _id: id })
    .then((user) => { done(null, user); })
    .catch((e) => { console.log(e); });
});

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
    proxy: true
}, (accessToken, refreshToken, profile, done) => {

    // console.log('accessToken', accessToken);
    // console.log('refreshToken', refreshToken);
    // console.log('profile', profile);

    User.findOne({ googleId: profile.id })
    .then((existingUser) => {
        if(existingUser) {
            done(null, existingUser);
        } else {
            new User({ googleId: profile.id }).save()
            .then((user) => { done(null, user); })
            .catch((e) => { console.log(e); })
        }
    })
    .catch((e) => { console.log(e); })
}));