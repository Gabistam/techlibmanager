const User = require('../models/User');

// Affichage du profil utilisateur
exports.profile = async (req, res) => {
    try {
        console.log('Accès à la page profil');
        // Récupérer les informations complètes de l'utilisateur
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).render('error/404', {
                message: 'Utilisateur non trouvé'
            });
        }

        // Rendre la page avec les informations utilisateur
        res.render('pages/profile/profile', { 
            user: {
                email: user.email,
                id: user._id,
                // Ajouter d'autres champs si nécessaire
            }
        });
    } catch (err) {
        console.error('Erreur lors du rendu du profil:', err);
        res.status(500).render('error/500');
    }
};

// Mise à jour du mot de passe utilisateur
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.render('pages/profile/profile', { 
                passwordUpdateError: 'Utilisateur introuvable.',
                user: req.user
            });
        }

        // Vérifier si les nouveaux mots de passe correspondent
        if (newPassword !== confirmNewPassword) {
            return res.render('pages/profile/profile', { 
                passwordUpdateError: 'Les mots de passe ne correspondent pas.',
                user: req.user
            });
        }

        // Vérifier le mot de passe actuel
        const match = await user.comparePassword(currentPassword);
        if (!match) {
            return res.render('pages/profile/profile', { 
                passwordUpdateError: 'Le mot de passe actuel est incorrect.',
                user: req.user
            });
        }

        // Mettre à jour le mot de passe
        user.password = newPassword;
        await user.save();

        // Rendre la page avec un message de succès
        return res.render('pages/profile/profile', {
            passwordUpdateSuccess: 'Mot de passe mis à jour avec succès.',
            user: req.user
        });
    } catch (err) {
        console.error('Erreur lors de la mise à jour du mot de passe:', err);
        return res.render('pages/profile/profile', { 
            passwordUpdateError: 'Erreur lors de la mise à jour du mot de passe.',
            user: req.user
        });
    }
};

// Afficher la page de suppression de compte
exports.deleteAccountPage = (req, res) => {
    res.render('pages/profile/delete', { user: req.user });
};

// Suppression définitive du compte utilisateur
exports.deleteAccount = async (req, res) => {
    try {
        // Supprimer l'utilisateur de la base de données
        await User.findByIdAndDelete(req.user.id);

        // Optionnel : déconnecter l'utilisateur en supprimant le cookie JWT
        res.clearCookie('token');
        res.render('pages/home', { 
            success: 'Votre compte a bien été supprimé.'
        });
    } catch (err) {
        console.error('Erreur lors de la suppression du compte:', err);
        return res.render('pages/profile/profile', { 
            error: 'Impossible de supprimer votre compte.',
            user: req.user
        });
    }
};
