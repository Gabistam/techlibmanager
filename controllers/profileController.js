// controllers/profileController.js
const User = require('../models/User');

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    
    // Récupération du user en base via req.user.id
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.render('updatePassword', { 
        error: 'Utilisateur introuvable.' 
      });
    }

    // Vérification matching newPassword / confirmNewPassword
    if (newPassword !== confirmNewPassword) {
      return res.render('updatePassword', { 
        error: 'Les mots de passe ne correspondent pas.' 
      });
    }

    // Vérification du mot de passe actuel
    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.render('updatePassword', { 
        error: 'Le mot de passe actuel est incorrect.' 
      });
    }

    // Mise à jour
    user.password = newPassword; // Suppose un hook .pre('save') pour le hachage
    await user.save();

    res.render('updatePassword', {
      success: 'Mot de passe mis à jour avec succès.'
    });
  } catch (err) {
    console.error(err);
    return res.render('updatePassword', { error: 'Erreur interne du serveur.' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(req.user.id);

    // Option : déconnecter l'utilisateur, supprimer cookie JWT, etc.
    // On peut rediriger vers '/' ou renvoyer un message
    res.render('delete', { success: 'Votre compte a bien été supprimé.' });
  } catch (err) {
    console.error(err);
    return res.render('delete', { error: 'Impossible de supprimer votre compte.' });
  }
};
