const bcrypt = require('bcrypt');
// Importation de bcrypt pour hacher et comparer les mots de passe.

const jwt = require('jsonwebtoken');
// Importation de jsonwebtoken pour la génération et la validation des tokens JWT.

const User = require('../models/User');
// Modèle utilisateur pour interagir avec la base de données.

const passport = require('passport');
// Module Passport.js pour gérer l'authentification OAuth et autres stratégies.

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};
// Cette fonction crée un token JWT en utilisant :
// - `user._id` et `user.email` comme données à inclure dans le token.
// - Une clé secrète définie dans `process.env.JWT_SECRET` pour signer le token.
// - Une durée d'expiration de 1 heure (`expiresIn: '1h'`).

const handleOAuthResponse = (req, res) => {
    const token = generateToken(req.user);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000 // 1 heure
    });
    res.redirect('/books');
};
// Cette fonction est appelée après une authentification OAuth réussie.
// Elle génère un token JWT pour l'utilisateur et l'enregistre dans un cookie HTTP sécurisé.

exports.home = (req, res) => {
    res.render('pages/home');
};
// Affiche la page d'accueil.

exports.getSignupPage = (req, res) => {
    res.render('pages/auth/signup');
};
// Affiche la page d'inscription.

exports.getLoginPage = (req, res) => {
    res.render('pages/auth/login');
};
// Affiche la page de connexion.

exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('pages/auth/signup', {
                error: 'Email déjà utilisé.',
                user: req.user
            });
        }

        const newUser = new User({ email, password });
        await newUser.save();

        res.render('pages/auth/login', {
            success: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
            user: req.user
        });
    } catch (err) {
        console.error('Erreur signup:', err);
        res.render('pages/auth/signup', {
            error: 'Erreur lors de l\'inscription. Veuillez réessayer.',
            user: req.user
        });
    }
};
// Fonction d'inscription :
// - Vérifie si l'email existe déjà.
// - Si non, crée un nouvel utilisateur et le sauvegarde dans la base.
// - Redirige ensuite l'utilisateur vers la page de connexion.

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.render('pages/auth/login', { 
                error: 'Identifiants invalides.',
                user: null
            });
        }

        const token = generateToken(user);
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });

        res.redirect('/books');
    } catch (err) {
        console.error('Erreur login:', err);
        res.render('pages/auth/login', { 
            error: 'Erreur serveur',
            user: null
        });
    }
};
// Fonction de connexion :
// - Vérifie que l'utilisateur existe et que le mot de passe est correct.
// - Si oui, génère un token JWT et le stocke dans un cookie.
// - Redirige l'utilisateur vers la page `/books`.

exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
});
// Initialise l'authentification avec Google en spécifiant les scopes nécessaires.

exports.googleCallback = [
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/login'
    }),
    (req, res) => {
        try {
            const token = generateToken(req.user);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000
            });
            res.redirect('/books');
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect('/login');
        }
    }
];
// Gère le callback après l'authentification réussie avec Google :
// - Génère un token JWT.
// - Stocke le token dans un cookie sécurisé.
// - Redirige l'utilisateur vers `/books`.

exports.githubAuth = passport.authenticate('github', {
    scope: ['user:email'],
    session: false
});
// Initialise l'authentification avec GitHub en demandant l'accès aux emails.

exports.githubCallback = [
    passport.authenticate('github', { 
        session: false,
        failureRedirect: '/login'
    }),
    (req, res) => {
        try {
            const token = generateToken(req.user);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000
            });
            res.redirect('/books');
        } catch (error) {
            console.error('GitHub callback error:', error);
            res.redirect('/login');
        }
    }
];
// Même logique que pour Google :
// - Authentifie l'utilisateur avec GitHub.
// - Génère un token JWT, le stocke dans un cookie, et redirige.

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.locals.user = null;
    res.redirect('/login');
};
// Supprime le cookie contenant le token JWT et redirige l'utilisateur vers la page de connexion.
