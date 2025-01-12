const express = require('express');
const router = express.Router();
const auth = require('../middleware/authJwt');
const profileController = require('../controllers/profileController');

// Page de profil
router.get('/', auth, profileController.profile);

// Traitement du formulaire update-password
router.post('/update-password', auth, profileController.updatePassword);

// Page de suppression de compte
router.get('/delete', auth, profileController.deleteAccountPage);

// Traitement du formulaire de suppression
router.post('/delete', auth, profileController.deleteAccount);  // Changé de DELETE à POST

module.exports = router;