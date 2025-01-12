require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');

// Connexion à la base de données
const { connectDB } = require('./config/database');

// Import des middlewares
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');
const userStatus = require('./middleware/userStatus');

// Import des routes
const bookRoutes = require('./routes/books');   
const authRoutes = require('./routes/auth');    
const profileRoutes = require('./routes/profile');  

const app = express();

// 1) Connexion à la base de données
connectDB();

// 2) Configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// 3) Configuration Passport pour OAuth uniquement
require('./config/passport');
app.use(passport.initialize());

// 4) Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(userStatus);

// 5) Routes
app.use('/', authRoutes);
app.use('/books', bookRoutes);
app.use('/profile', profileRoutes);

// 6) Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// 7) Démarrage
const PORT = process.env.PORT || 3335;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});