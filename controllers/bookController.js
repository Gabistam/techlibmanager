// controllers/bookController.js
const Book = require('../models/Book');

exports.dashboard = async (req, res) => {
    try {
        // Agrégation par readingStatus
        const readingStats = await Book.aggregate([
            {
                $group: {
                    _id: '$readingStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Initialisation des statistiques
        const stats = {
            total: 0,
            toRead: 0,
            inProgress: 0,
            completed: 0
        };

        // Attribution des comptes aux bonnes catégories
        readingStats.forEach(stat => {
            if (stat._id === 'À lire') {
                stats.toRead = stat.count;
            } else if (stat._id === 'En cours') {
                stats.inProgress = stat.count;
            } else if (stat._id === 'Terminé') {
                stats.completed = stat.count;
            }
            // Ajout au total
            stats.total += stat.count;
        });

        // Agrégation par catégorie pour le graphique
        const categoryStats = await Book.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const categoryLabels = categoryStats.map(cat => cat._id);
        const categoryData = categoryStats.map(cat => cat.count);

        // Récupération des derniers livres ajoutés
        const recentBooks = await Book.find()
            .sort({ addedAt: -1 })
            .limit(5)
            .lean();

        res.render('dashboard', { 
            stats,
            categoryLabels,
            categoryData,
            recentBooks
        });
    } catch (err) {
        console.error('Erreur dans le contrôleur dashboard:', err);
        res.status(500).render('error/500');
    }
};


exports.list = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        
        const books = await Book.find()
            .sort('-priority')
            .skip((page - 1) * limit)
            .limit(limit);
            
        const total = await Book.countDocuments();
        
        res.render('books/list', {
            books,
            currentPage: page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).render('error/500');
    }
};

exports.show = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).render('error/404');
        }
        res.render('books/show', { book });
    } catch (err) {
        res.status(500).render('error/500');
    }
};

exports.createForm = (req, res) => {
    res.render('books/create', { book: {} });
};

exports.create = async (req, res) => {
    try {
        console.log('Données reçues:', req.body);
        const book = new Book(req.body);
        console.log('Book avant sauvegarde:', book);
        await book.save();
        console.log('Book sauvegardé:', book);
        res.redirect('/books/' + book._id);
    } catch (err) {
        console.error('Erreur de sauvegarde:', err);
        res.render('books/create', {
            book: req.body,
            errors: err.errors
        });
    }
};

exports.editForm = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).render('error/404');
        }
        res.render('books/edit', { book });
    } catch (err) {
        res.status(500).render('error/500');
    }
};

exports.update = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!book) {
            return res.status(404).render('error/404');
        }
        res.redirect('/books/' + book._id);
    } catch (err) {
        res.render('books/edit', {
            book: { ...req.body, _id: req.params.id },
            errors: err.errors
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).render('error/404');
        }
        res.redirect('/books');
    } catch (err) {
        res.status(500).render('error/500');
    }
};