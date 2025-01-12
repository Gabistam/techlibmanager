const passport = require('passport');
// Importation du module Passport.js, qui facilite la gestion des stratégies d'authentification.

const GoogleStrategy = require('passport-google-oauth20').Strategy;
// Importation de la stratégie OAuth 2.0 pour Google, utilisée pour l'authentification via Google.

const GithubStrategy = require('passport-github2').Strategy;
// Importation de la stratégie GitHub OAuth, utilisée pour l'authentification via GitHub.

const User = require('../models/User');
// Modèle utilisateur, utilisé pour interagir avec la base de données.

const config = require('./oauth');
// Importation de la configuration OAuth, qui contient les clés et URL nécessaires pour les stratégies.

passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
}, async (accessToken, refreshToken, profile, done) => {
    // Configuration de la stratégie avec les informations client et la fonction de rappel.
    try {
        console.log('Google profile:', profile); // Debug : Affiche le profil Google reçu.

        // Recherche de l'utilisateur existant dans la base de données.
        let user = await User.findOne({ 
            $or: [
                { googleId: profile.id }, // Recherche par ID Google.
                { email: profile.emails[0].value } // Ou recherche par email.
            ]
        });
        
        if (!user) {
            // Si l'utilisateur n'existe pas, création d'un nouvel utilisateur.
            user = await User.create({
                email: profile.emails[0].value, // Email principal.
                googleId: profile.id,          // ID Google.
                displayName: profile.displayName, // Nom affiché.
                avatar: profile.photos?.[0]?.value // Avatar (si disponible).
            });
        } else if (!user.googleId) {
            // Si l'utilisateur existe mais n'a pas d'ID Google, mise à jour de son profil.
            user.googleId = profile.id;
            await user.save();
        }

        return done(null, user); // Transmission de l'utilisateur à Passport.
    } catch (err) {
        console.error('Google Auth Error:', err); // Gestion des erreurs.
        return done(err, null);
    }
}));

passport.use(new GithubStrategy({
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: config.github.callbackURL,
    scope: ['user:email'] // Spécifie explicitement le scope pour récupérer les emails.
}, async (accessToken, refreshToken, profile, done) => {
    // Configuration de la stratégie avec les informations client et la fonction de rappel.
    try {
        console.log('GitHub profile:', profile); // Debug : Affiche le profil GitHub reçu.

        // Récupération sécurisée de l'email.
        const email = profile.emails && profile.emails[0] ? 
            profile.emails[0].value : 
            `${profile.username}@github.com`;
        // Si aucun email n'est disponible, un email basé sur le nom d'utilisateur est généré.

        let user = await User.findOne({ 
            $or: [
                { githubId: profile.id }, // Recherche par ID GitHub.
                { email: email } // Ou recherche par email.
            ]
        });
        
        if (!user) {
            // Création d'un nouvel utilisateur si aucun utilisateur correspondant n'est trouvé.
            user = new User({
                email: email,
                githubId: profile.id,
                displayName: profile.displayName || profile.username, // Nom affiché ou nom d'utilisateur.
                avatar: profile.photos?.[0]?.value, // Avatar (si disponible).
                password: Math.random().toString(36).slice(-8) // Mot de passe aléatoire pour sécuriser le compte.
            });
            await user.save();
        } else if (!user.githubId) {
            // Mise à jour du profil existant avec l'ID GitHub.
            user.githubId = profile.id;
            if (profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
            }
            await user.save();
        }

        return done(null, user); // Transmission de l'utilisateur à Passport.
    } catch (err) {
        console.error('GitHub Auth Error:', err); // Gestion des erreurs.
        console.error('Error stack:', err.stack); // Affiche la pile d'erreurs pour débogage.
        return done(err, null);
    }
}));

module.exports = passport;
