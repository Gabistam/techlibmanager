const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      res.locals.user = null;
      if (req.originalUrl.startsWith('/books')) {
        return res.redirect('/login');
      }
      return next();
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // S'assurer que l'ID est au bon format pour MongoDB
    const userId = new mongoose.Types.ObjectId(decoded.id); // Correction ici

    // Ajouter les informations aux deux endroits
    req.user = {
      id: userId,
      email: decoded.email
    };
    
    res.locals.user = {
      id: userId,
      email: decoded.email
    };

    console.log('User info in middleware:', req.user);
    next();
  } catch (err) {
    console.error('Erreur de vérification du token :', err.message);
    res.locals.user = null;

    if (req.originalUrl.startsWith('/books')) {
      return res.redirect('/login');
    }
    next();
  }
};