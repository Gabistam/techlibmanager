// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');

// Fonction utilitaire pour générer un token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Fonction pour gérer la réponse OAuth
const handleOAuthResponse = (req, res) => {
    const token = generateToken(req.user);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000 // 1 heure
    });
    res.redirect('/books');
};

// Pages de rendu
exports.home = (req, res) => {
    res.render('pages/home');
};

exports.getSignupPage = (req, res) => {
    res.render('pages/auth/signup');
};

exports.getLoginPage = (req, res) => {
    res.render('pages/auth/login');
};

// Authentification classique
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

// Authentification OAuth
exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
});

exports.googleCallback = [
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/login'
    }),
    (req, res) => {
        try {
            console.log('Google callback user:', req.user);
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

exports.githubAuth = passport.authenticate('github', {
    scope: ['user:email'],
    session: false
});

exports.githubCallback = [
    passport.authenticate('github', { 
        session: false,
        failureRedirect: '/login'
    }),
    (req, res) => {
        try {
            console.log('GitHub callback - req.user:', req.user);
            
            if (!req.user) {
                console.error('No user object in GitHub callback');
                return res.redirect('/login');
            }

            if (!req.user._id) {
                console.error('User object missing _id:', req.user);
                return res.redirect('/login');
            }

            const token = generateToken(req.user);
            console.log('Generated token:', token);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000
            });
            
            res.redirect('/books');
        } catch (error) {
            console.error('GitHub callback error:', error);
            console.error('Error stack:', error.stack);
            res.redirect('/login');
        }
    }
];

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.locals.user = null;
    res.redirect('/login');
};