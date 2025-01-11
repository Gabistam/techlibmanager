const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Pages publiques
router.get('/', authController.home);
router.get('/signup', authController.getSignupPage);
router.get('/login', authController.getLoginPage);

// Actions
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
