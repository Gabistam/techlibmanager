const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

module.exports = (req, res, next) => {
    try {
        // Récupérer le token soit depuis les cookies, soit depuis l'en-tête Authorization
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        // Si aucun token n'est présent, définir `res.locals.user` sur null et gérer les redirections
        if (!token) {
            res.locals.user = null;
            if (req.originalUrl.startsWith('/books')) {
                return res.redirect('/login'); // Rediriger vers la page de connexion si la route est protégée
            }
            return next(); // Passer au middleware suivant pour les routes publiques
        }

        // Décoder et vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Convertir l'ID utilisateur décodé en ObjectId compatible MongoDB
        const userId = new mongoose.Types.ObjectId(decoded.id);

        // Ajouter les informations utilisateur à `req.user` et `res.locals.user`
        req.user = {
            id: userId,
            email: decoded.email
        };
        res.locals.user = {
            id: userId,
            email: decoded.email
        };

        console.log('User info in middleware:', req.user);
        next(); // Continuer avec la requête
    } catch (err) {
        console.error('Erreur de vérification du token :', err.message);

        // Réinitialiser les informations utilisateur en cas d'erreur
        res.locals.user = null;

        // Gérer les redirections pour les routes protégées
        if (req.originalUrl.startsWith('/books')) {
            return res.redirect('/login');
        }
        next();
    }
};
