require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Connexion à la base de données
const { connectDB } = require('./config/database');

// Import des middlewares
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');
const userStatus = require('./middleware/userStatus');

// Import des routes
const bookRoutes = require('./routes/books');   // routes pour la gestion des livres
const authRoutes = require('./routes/auth');    // routes pour l'authentification
const profileRoutes = require('./routes/profile');  // routes pour le profil

const app = express();

// 1) Connexion à la base de données
connectDB();

// 2) Configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// 3) Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(userStatus);  // Pour la navbar uniquement

// 4) Routes
// Route racine vers la page d'accueil
app.use('/', authRoutes);  // Les routes d'auth géreront la page d'accueil
app.use('/books', bookRoutes);  // Toutes les routes de livres commencent par /books
app.use('/profile', profileRoutes);  // Routes pour le profil

// 5) Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// 6) Démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});