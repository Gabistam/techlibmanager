require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// Connexion à la base de données
const { connectDB } = require('./config/database');

// Import des middlewares
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

// Import de tes routes
const userRoutes = require('./routes/books');   // routes pour la gestion des livres
const authRoutes = require('./routes/auth');    // routes pour l'authentification (signup/login)

const app = express();

// 1) Connexion à la base de données
connectDB();

// 2) Configuration du moteur de templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// 3) Middlewares généraux
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger); // Logging des requêtes (si ton middleware le fait)

// 4) Routes
// Page d'accueil éventuelle
// app.get('/', (req, res) => {
//   res.render('home'); // ou 'dashboard' si tu veux
// });

// Routes « livres »
app.use('/', userRoutes);

// Routes « auth »
app.use('/auth', authRoutes);

// 5) Gestion des erreurs
app.use(notFoundHandler); // 404
app.use(errorHandler);    // 500 etc.

// 6) Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
