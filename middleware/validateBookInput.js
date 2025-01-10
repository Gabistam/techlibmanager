// middleware/validateBookInput.js
const validateBookInput = (req, res, next) => {
    const { title, authors, category } = req.body;
    
    const errors = {};
    
    if (!title || title.trim().length === 0) {
        errors.title = 'Le titre est requis';
    }
    
    if (!authors || (typeof authors === 'string' && authors.trim().length === 0)) {
        errors.authors = 'Au moins un auteur est requis';
    }
    
    if (!category) {
        errors.category = 'La catégorie est requise';
    }
    
    if (Object.keys(errors).length > 0) {
        return res.render('books/create', {
            book: req.body,
            errors
        });
    }
    
    // Conversion des auteurs en tableau s'ils sont fournis comme string
    if (typeof authors === 'string') {
        req.body.authors = authors.split(',').map(author => author.trim());
    }
    
    next();
};

module.exports = validateBookInput;