const mongoose = require('mongoose');
const Book = require('../models/Book');

// Tableau de bord
exports.dashboard = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const readingStats = await Book.aggregate([
            { $match: { user: userId } },
            { $group: { _id: '$readingStatus', count: { $sum: 1 } } }
        ]);

        const stats = {
            total: 0,
            toRead: 0,
            inProgress: 0,
            completed: 0
        };

        readingStats.forEach(stat => {
            if (stat._id === 'À lire') stats.toRead = stat.count;
            else if (stat._id === 'En cours') stats.inProgress = stat.count;
            else if (stat._id === 'Terminé') stats.completed = stat.count;
            stats.total += stat.count;
        });

        const categoryStats = await Book.aggregate([
            { $match: { user: userId } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const categoryLabels = categoryStats.map(cat => cat._id);
        const categoryData = categoryStats.map(cat => cat.count);

        const recentBooks = await Book.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.render('pages/books/dashboard', { 
            stats, 
            categoryLabels, 
            categoryData, 
            recentBooks, 
            user: req.user 
        });
    } catch (err) {
        console.error('Erreur tableau de bord:', err);
        res.status(500).render('error/500', { user: req.user, error: err.message });
    }
};

// Liste des livres avec pagination
exports.list = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const books = await Book.find({ user: req.user.id })
            .sort('-priority')
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Book.countDocuments({ user: req.user.id });

        res.render('pages/books/list', {
            books,
            currentPage: page,
            pages: Math.ceil(total / limit),
            user: req.user
        });
    } catch (err) {
        res.status(500).render('error/500', { user: req.user });
    }
};

// Afficher un livre spécifique
exports.show = async (req, res) => {
    try {
        const book = await Book.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!book) {
            return res.status(404).render('error/404', { user: req.user });
        }
        res.render('pages/books/show', { book, user: req.user });
    } catch (err) {
        res.status(500).render('error/500', { user: req.user });
    }
};

// Formulaire de création
exports.createForm = (req, res) => {
    res.render('pages/books/create', { book: {}, user: req.user });
};

// Création d’un nouveau livre
exports.create = async (req, res) => {
    try {
        const bookData = { ...req.body, user: req.user.id };
        const book = new Book(bookData);
        await book.save();
        res.redirect('/books/' + book._id);
    } catch (err) {
        console.error('Erreur de création:', err);
        res.render('pages/books/create', {
            book: req.body,
            errors: err.errors,
            user: req.user
        });
    }
};

// Formulaire de modification
exports.editForm = async (req, res) => {
    try {
        const book = await Book.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!book) {
            return res.status(404).render('error/404', { user: req.user });
        }
        res.render('pages/books/edit', { book, user: req.user });
    } catch (err) {
        res.status(500).render('error/500', { user: req.user });
    }
};

// Mise à jour d’un livre
exports.update = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const book = await Book.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            { ...req.body, user: userId },
            { new: true, runValidators: true }
        );

        if (!book) {
            return res.status(404).render('error/404', { user: req.user });
        }

        res.redirect('/books/' + book._id);
    } catch (err) {
        console.error('Erreur mise à jour:', err);
        res.render('pages/books/edit', {
            book: { ...req.body, _id: req.params.id },
            errors: err.errors,
            user: req.user
        });
    }
};

// Suppression d’un livre
exports.delete = async (req, res) => {
    try {
        const book = await Book.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!book) {
            return res.status(404).render('error/404', { user: req.user });
        }
        res.redirect('/books');
    } catch (err) {
        res.status(500).render('error/500', { user: req.user });
    }
};
