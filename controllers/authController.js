// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.home = (req, res) => {
    res.render('pages/home');
};

exports.getSignupPage = (req, res) => {
    res.render('pages/auth/signup.twig');
  };

exports.getLoginPage = (req, res) => {
res.render('pages/auth/login.twig');
};

exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('pages/auth/signup', {
                error: 'Email déjà utilisé.',
                user: req.user
            });
        }
        
        // Créer un nouvel utilisateur
        const newUser = new User({ email, password });
        await newUser.save();
        
        // Générer un token (optionnel si vous ne l'utilisez pas immédiatement)
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        
        // Rediriger vers la page de connexion avec un message de succès
        res.render('pages/auth/login', {
            success: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
            user: req.user
        });

    } catch (err) {
        console.error(err);
        res.render('pages/auth/signup', {
            error: 'Erreur lors de l\'inscription. Veuillez réessayer.',
            user: req.user
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Tentative de connexion pour:', email);

        const user = await User.findOne({ email });
        if (!user) {
            return res.render('pages/auth/login', { 
                error: 'Identifiants invalides.',
                user: null
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('pages/auth/login', { 
                error: 'Identifiants invalides.',
                user: null
            });
        }

        // S'assurer que l'ID est une chaîne
        const userId = user._id.toString();

        const token = jwt.sign(
            { 
                id: userId,
                email: user.email
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 heure en millisecondes
        });

        console.log('Redirection vers le dashboard');
        res.redirect('/books');

    } catch (err) {
        console.error('Erreur login:', err);
        res.render('pages/auth/login', { 
            error: 'Erreur interne du serveur.',
            user: null
        });
    }
};

exports.logout = (req, res) => {
    // Supprimer le token des cookies
    res.clearCookie('token');
    
    // Supprimer les informations utilisateur de res.locals
    res.locals.user = null;

    // Rediriger vers la page de login
    res.redirect('/login');
};

