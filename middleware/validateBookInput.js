// middleware/validateBookInput.js

const validateBookInput = (req, res, next) => {
    const { title, authors, category } = req.body;

    // Initialiser un objet pour stocker les erreurs
    const errors = {};

    // Validation du titre
    if (!title || title.trim().length === 0) {
        errors.title = 'Le titre est requis';
    }

    // Validation des auteurs
    if (!authors || (typeof authors === 'string' && authors.trim().length === 0)) {
        errors.authors = 'Au moins un auteur est requis';
    }

    // Validation de la catégorie
    if (!category) {
        errors.category = 'La catégorie est requise';
    }

    // Vérifier si des erreurs existent
    if (Object.keys(errors).length > 0) {
        // Renvoyer les erreurs à la vue de création
        return res.render('books/create', {
            book: req.body, // Conserver les données saisies pour ne pas les perdre
            errors         // Afficher les messages d'erreur
        });
    }

    // Normalisation : convertir les auteurs en tableau si fournis comme string
    if (typeof authors === 'string') {
        req.body.authors = authors.split(',').map(author => author.trim());
    }

    next(); // Passer au middleware ou contrôleur suivant
};

module.exports = validateBookInput;
