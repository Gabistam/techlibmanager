// config/oauth.js
// Ce fichier contient la configuration OAuth pour des services comme Google et GitHub.
// Les clés d'API et secrets sont stockés en tant que variables d'environnement pour des raisons de sécurité.

module.exports = {
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        // Identifiant client fourni par Google pour l'application (récupéré depuis la Google Cloud Console).
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // Secret client associé à l'application, utilisé pour authentifier la communication.
        callbackURL: 'http://localhost:3335/auth/google/callback'
        // URL de redirection où Google enverra les utilisateurs après l'authentification.
    },
    github: {
        clientID: process.env.GITHUB_CLIENT_ID,
        // Identifiant client fourni par GitHub pour l'application (obtenu depuis GitHub Developer Settings).
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        // Secret client associé à l'application, utilisé pour authentifier la communication.
        callbackURL: 'http://localhost:3335/auth/github/callback'
        // URL de redirection où GitHub enverra les utilisateurs après l'authentification.
    }
};
