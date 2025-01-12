const notFoundHandler = (req, res, next) => {
    // Définir le statut HTTP 404 (Non trouvé)
    res.status(404);

    // Rendre la vue d'erreur 404 avec des informations supplémentaires
    res.render('error/404', {
        url: req.originalUrl // Inclure l'URL demandée pour un contexte supplémentaire
    });
};

module.exports = notFoundHandler;
