const errorHandler = (err, req, res, next) => {
    // Journaliser les détails de l'erreur
    console.error('Error details:', {
        name: err.name,          // Nom de l'erreur (par ex. ValidationError)
        message: err.message,    // Message descriptif de l'erreur
        stack: err.stack,        // Pile d'exécution pour le débogage
        code: err.code           // Code d'erreur éventuel (si défini)
    });

    // Définir le statut HTTP, par défaut 500 si non spécifié
    res.status(err.status || 500);

    // Rendre une vue d'erreur avec des informations adaptées à l'environnement
    res.render('error/500', {
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Erreur serveur interne', // Masquer les détails en production
        error: process.env.NODE_ENV === 'development' 
            ? err 
            : {}, // Fournir des détails uniquement en développement
        user: req.user // Inclure l'utilisateur connecté pour personnaliser la réponse
    });
};

module.exports = errorHandler;
