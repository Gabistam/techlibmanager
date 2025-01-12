// controllers/bookController.js
const Book = require('../models/Book');
const mongoose = require('mongoose');

exports.dashboard = async (req, res) => {
    try {
        console.log('User data:', req.user);
        
        // Correction ici - Utiliser new pour créer l'ObjectId
        const userId = new mongoose.Types.ObjectId(req.user.id);
        console.log('UserId converti:', userId);

        // Correction des agrégations également
        const readingStats = await Book.aggregate([
            { 
                $match: { 
                    user: userId  // Utilisation de l'ID converti
                } 
            },
            {
                $group: {
                    _id: '$readingStatus',
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('Reading stats:', readingStats);


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

        // Agrégation par catégorie pour le graphique (filtré par utilisateur)
        const categoryStats = await Book.aggregate([
            { 
                $match: { 
                    user: userId  // Utilisation du même ID converti
                } 
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const categoryLabels = categoryStats.map(cat => cat._id);
        const categoryData = categoryStats.map(cat => cat.count);

        // Récupération des derniers livres ajoutés de l'utilisateur
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
        console.error('Erreur dans le contrôleur dashboard:', err);
        res.status(500).render('error/500', { 
            user: req.user,
            error: err.message
         });
    }
};

exports.list = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        
        // Filtrer les livres par utilisateur
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

exports.show = async (req, res) => {
    try {
        // Vérifier que le livre appartient à l'utilisateur
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

exports.createForm = (req, res) => {
    res.render('pages/books/create', { book: {}, user: req.user });
};

exports.create = async (req, res) => {
    try {
        // Ajouter l'ID de l'utilisateur aux données du livre
        const bookData = {
            ...req.body,
            user: req.user.id
        };

        const book = new Book(bookData);
        console.log('Livre à sauvegarder:', book);
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

exports.editForm = async (req, res) => {
    try {
        // Vérifier que le livre appartient à l'utilisateur
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

exports.update = async (req, res) => {
    try {
        // S'assurer que l'ID utilisateur est correctement converti
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        console.log('Update - Book ID:', req.params.id);
        console.log('Update - User ID:', userId);
        console.log('Update - New Data:', req.body);

        // Mettre à jour uniquement si le livre appartient à l'utilisateur
        const book = await Book.findOneAndUpdate(
            {
                _id: req.params.id,
                user: userId
            },
            {
                ...req.body,
                user: userId  // Garder l'utilisateur associé
            },
            { 
                new: true,
                runValidators: true 
            }
        );

        if (!book) {
            console.log('Book not found or unauthorized');
            return res.status(404).render('error/404', { user: req.user });
        }

        console.log('Book updated:', book);
        
        // Rediriger vers la page de détails du livre
        res.redirect('/books/' + book._id);
    } catch (err) {
        console.error('Update error:', err);
        res.render('pages/books/edit', {
            book: { 
                ...req.body, 
                _id: req.params.id
            },
            errors: err.errors,
            user: req.user
        });
    }
};

exports.delete = async (req, res) => {
    try {
        // Supprimer uniquement si le livre appartient à l'utilisateur
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