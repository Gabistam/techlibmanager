const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Pages publiques
router.get('/', authController.home);
router.get('/signup', authController.getSignupPage);
router.get('/login', authController.getLoginPage);

// Routes OAuth
router.get('/auth/google', authController.googleAuth);
router.get('/auth/google/callback', authController.googleCallback);
router.get('/auth/github', authController.githubAuth);
router.get('/auth/github/callback', authController.githubCallback);

// Actions classiques
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;