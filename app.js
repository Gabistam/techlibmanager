require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// Importation du fichier de route user.js
const userRoutes = require('./routes/books');

// Import des middlewares
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const {connectDB} =require('./config/database');

const app = express();

// Connexion à la base de données
connectDB();

// Configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);  // Logging des requêtes

// // Route pour la page d'accueil
// app.get('/', (req, res) => {
//     res.render('dashboard');
//   });

// Routes définies dans le fichier user.js
app.use('/', userRoutes);

// Gestion des erreurs
app.use(notFoundHandler);  // 404
app.use(errorHandler);     // 500 et autres erreurs

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});