const errorHandler = (err, req, res, next) => {
    console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code
    });

    res.status(err.status || 500);
    res.render('error/500', {
        message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur interne',
        error: process.env.NODE_ENV === 'development' ? err : {},
        user: req.user
    });
};

module.exports = errorHandler;