// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.home = (req, res) => {
    res.render('pages/home');
};

exports.getSignupPage = (req, res) => {
    res.render('pages/signup.twig');
  };

exports.getLoginPage = (req, res) => {
res.render('pages/login.twig');
};

exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('pages/signup', {
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
        res.render('pages/login', {
            success: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
            user: req.user
        });

    } catch (err) {
        console.error(err);
        res.render('pages/signup', {
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
            return res.render('pages/login', { 
                error: 'Identifiants invalides.',
                user: null
            });
        }

        // Utilisation de la méthode comparePassword du modèle
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('pages/login', { 
                error: 'Identifiants invalides.',
                user: null
            });
        }

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production'
        });

        console.log('Redirection vers le dashboard');
        res.redirect('/books/dashboard');

    } catch (err) {
        console.error('Erreur login:', err);
        res.render('pages/login', { 
            error: 'Erreur interne du serveur.',
            user: null
        });
    }
};

exports.profile = (req, res) => {
    res.send('Mon profil');
  };

exports.logout = (req, res) => {
    res.send('Déconnexion');
  };

