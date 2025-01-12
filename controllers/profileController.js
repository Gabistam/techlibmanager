// controllers/profileController.js
const User = require('../models/User');

exports.profile = async (req, res) => {
    try {
        console.log('Accès à la page profil');
        // Récupérer les informations complètes de l'utilisateur depuis la base de données
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).render('error/404', {
                message: 'Utilisateur non trouvé'
            });
        }

        // Passer l'utilisateur complet au template
        res.render('pages/profile/profile', { 
            user: {
                email: user.email,
                id: user._id,
                // Ajoutez d'autres champs si nécessaire
            }
        });
    } catch (err) {
        console.error('Erreur lors du rendu du profil:', err);
        res.status(500).render('error/500');
    }
};

exports.updatePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmNewPassword } = req.body;
      
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.render('pages/profile/profile', { 
          passwordUpdateError: 'Utilisateur introuvable.',
          user: req.user
        });
      }
  
      if (newPassword !== confirmNewPassword) {
        return res.render('pages/profile/profile', { 
          passwordUpdateError: 'Les mots de passe ne correspondent pas.',
          user: req.user
        });
      }
  
      const match = await user.comparePassword(currentPassword);
      if (!match) {
        return res.render('pages/profile/profile', { 
          passwordUpdateError: 'Le mot de passe actuel est incorrect.',
          user: req.user
        });
      }
  
      // Mise à jour
      user.password = newPassword;
      await user.save();
  
      // Redirection vers le profil avec message de succès
      return res.render('pages/profile/profile', {
        passwordUpdateSuccess: 'Mot de passe mis à jour avec succès.',
        user: req.user
      });
    } catch (err) {
      console.error(err);
      return res.render('pages/profile/profile', { 
        passwordUpdateError: 'Erreur lors de la mise à jour du mot de passe.',
        user: req.user
      });
    }
  };

exports.deleteAccountPage = (req, res) => {
  res.render('pages/profile/delete', { user: req.user });
};
  
exports.deleteAccount = async (req, res) => {
  try {
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(req.user.id);

    // Option : déconnecter l'utilisateur, supprimer cookie JWT, etc.
    // On peut rediriger vers '/' ou renvoyer un message
    res.render('pages/home', { success: 'Votre compte a bien été supprimé.' });
  } catch (err) {
    console.error(err);
    return res.render('pages/profile/profile', { error: 'Impossible de supprimer votre compte.' });
  }
};
