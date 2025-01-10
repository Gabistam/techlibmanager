// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }
    
    // Créer un nouvel utilisateur
    const newUser = new User({ email, password });
    await newUser.save();
    
    // Générer un token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    
    res.status(201).json({ message: 'Inscription réussie.', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier la présence de l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }
    
    // Générer un token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    
    res.json({ message: 'Connexion réussie.', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
