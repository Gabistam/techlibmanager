// middleware/userStatus.js
const jwt = require('jsonwebtoken');

const userStatus = (req, res, next) => {
    try {
        // Récupérer le token JWT depuis les cookies
        const token = req.cookies.token;

        // Si un token est présent, le vérifier et extraire les informations
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded; // Ajouter les informations utilisateur à `res.locals`
        } else {
            res.locals.user = null; // Pas de token, utilisateur non connecté
        }
    } catch (err) {
        // En cas d'erreur de vérification (ex : token expiré), définir `user` sur null
        res.locals.user = null;
    }

    next(); // Passer au middleware ou au contrôleur suivant
};

module.exports = userStatus;
