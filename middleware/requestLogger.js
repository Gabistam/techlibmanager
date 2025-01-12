// middleware/requestLogger.js
const requestLogger = (req, res, next) => {
    // Journaliser la requête avec la méthode, l'URL et l'horodatage
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next(); // Passer au middleware suivant
};

module.exports = requestLogger;
