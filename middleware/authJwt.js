const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Vérifier la présence du token dans les cookies ou les en-têtes
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      // Si aucun token, rediriger ou envoyer une réponse JSON selon le contexte
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(401).json({ message: 'Token manquant.' });
      } else {
        return res.redirect('/login');
      }
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter les informations du token à la requête
    req.user = { id: decoded.userId };

    // Passer au middleware ou route suivante
    next();
  } catch (err) {
    console.error('Erreur de vérification du token :', err.message);

    // Gérer les erreurs de validation du token
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(401).json({ message: 'Accès non autorisé, token invalide ou expiré.' });
    } else {
      return res.redirect('/login');
    }
  }
};
