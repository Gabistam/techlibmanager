// middlewares/authJwt.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Récupérer le header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token manquant.' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token invalide.' });
    }
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // On stocke l'ID utilisateur dans req.user
    req.user = { id: decoded.userId };
    
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Accès non autorisé, token invalide ou expiré.' });
  }
};
