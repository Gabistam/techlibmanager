// middleware/notFoundHandler.js
const notFoundHandler = (req, res, next) => {
    res.status(404);
    res.render('error/404', {
        url: req.originalUrl
    });
};

module.exports = notFoundHandler;