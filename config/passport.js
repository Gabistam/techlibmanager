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
    callbackURL: config.github.callbackURL,
    scope: ['user:email']  // Ajout explicite du scope
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('GitHub profile:', profile);

        // Récupération de l'email de manière plus sûre
        const email = profile.emails && profile.emails[0] ? 
            profile.emails[0].value : 
            `${profile.username}@github.com`;

        console.log('Email from GitHub:', email);

        let user = await User.findOne({ 
            $or: [
                { githubId: profile.id },
                { email: email }
            ]
        });
        
        console.log('Existing user:', user);

        if (!user) {
            console.log('Creating new user');
            user = new User({
                email: email,
                githubId: profile.id,
                displayName: profile.displayName || profile.username,
                avatar: profile.photos?.[0]?.value,
                // Pas besoin de mot de passe pour OAuth
                password: Math.random().toString(36).slice(-8) // Password aléatoire
            });
            await user.save();
            console.log('New user created:', user);
        } else if (!user.githubId) {
            console.log('Updating existing user with GitHub ID');
            user.githubId = profile.id;
            if (profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
            }
            await user.save();
        }

        console.log('Final user object:', user);
        return done(null, user);
    } catch (err) {
        console.error('GitHub Auth Error:', err);
        console.error('Error stack:', err.stack);
        return done(err, null);
    }
}));


module.exports = passport;