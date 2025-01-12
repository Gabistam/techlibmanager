const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const config = require('./oauth');

passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google profile:', profile); // Debug

        let user = await User.findOne({ 
            $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value }
            ]
        });
        
        if (!user) {
            user = await User.create({
                email: profile.emails[0].value,
                googleId: profile.id,
                displayName: profile.displayName,
                avatar: profile.photos?.[0]?.value
            });
        } else if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
        }

        return done(null, user); // Retourner uniquement l'utilisateur
    } catch (err) {
        console.error('Google Auth Error:', err);
        return done(err, null);
    }
}));

// Ajouter la stratégie GitHub
passport.use(new GithubStrategy({
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: config.github.callbackURL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('GitHub profile:', profile);

        let user = await User.findOne({ 
            $or: [
                { githubId: profile.id },
                { email: profile.emails?.[0]?.value }
            ]
        });
        
        if (!user) {
            user = await User.create({
                email: profile.emails?.[0]?.value,
                githubId: profile.id,
                displayName: profile.displayName || profile.username,
                avatar: profile.photos?.[0]?.value
            });
        } else if (!user.githubId) {
            user.githubId = profile.id;
            await user.save();
        }

        return done(null, user);
    } catch (err) {
        console.error('GitHub Auth Error:', err);
        return done(err, null);
    }
}));

module.exports = passport;