const express = require('express');
const router = express.Router();
const auth = require('../middleware/authJwt');
const profileController = require('../controllers/profileController');

// Page de modif de mot de passe
router.get('/update-password', auth, (req, res) => {
  // Rendre la page updatePassword.twig
  res.render('updatePassword.twig');
});

// Traitement du formulaire update-password
router.post('/update-password', auth, profileController.updatePassword);

// Page de suppression de compte
router.get('/delete', auth, (req, res) => {
  // Rendre la page delete.twig
  res.render('delete.twig');
});

// Traitement du formulaire de suppression
router.post('/delete', auth, profileController.deleteAccount);

module.exports = router;
