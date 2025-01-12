const mongoose = require('mongoose');
// Importation du module Mongoose, qui permet de gérer les connexions et les opérations avec MongoDB.

// Chargement des variables d'environnement depuis un fichier .env.
require('dotenv').config(); 
// Le module dotenv charge les variables d'environnement définies dans un fichier .env pour qu'elles soient accessibles dans process.env.

// Construction de l'URI de connexion à MongoDB en utilisant des variables d'environnement.
const MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;
// `process.env` récupère les valeurs des variables d'environnement définies dans le fichier .env.
// - DB_USERNAME : Nom d'utilisateur pour se connecter à MongoDB.
// - DB_PASSWORD : Mot de passe associé à l'utilisateur.
// - DB_CLUSTER : Nom du cluster MongoDB.
// - DB_DATABASE : Nom de la base de données cible.
// La chaîne construite permet de spécifier la méthode d'écriture avec `retryWrites=true` et la version de write concern avec `w=majority`.

// Fonction pour établir la connexion à MongoDB.
const connectDB = async () => {
    try {
        // Tentative de connexion à MongoDB avec l'URI et des options de configuration.
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true, // Utilisation du nouvel analyseur d'URL, recommandé pour éviter certains avertissements.
            useUnifiedTopology: true, // Activation de la gestion unifiée des topologies, réduisant les risques d'erreurs.
        });
        console.log('🚀🚀  La connexion à la base de données a été établie avec succès 🚀🚀 ');
        // Message de succès affiché dans la console si la connexion est établie.
    } catch (error) {
        console.error('Impossible de se connecter à la base de données', error);
        // En cas d'erreur, un message explicite est affiché, avec les détails de l'erreur.
    }
};

module.exports = { connectDB };
