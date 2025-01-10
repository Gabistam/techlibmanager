// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authJwt = require('../middlewares/authJwt');

// Inscription (public)
router.post('/signup', authController.signup);

// Connexion (public)
router.post('/login', authController.login);

// Exemple de route protégée
router.get('/profile', authJwt, authController.profile);

// Exemple de route de logout (protégée ou pas, selon ta logique)
router.post('/logout', authJwt, authController.logout);

module.exports = router;
