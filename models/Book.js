// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre est obligatoire'],
        trim: true
    },
    authors: {
        type: [String],
        required: [true, 'Au moins un auteur est requis']
    },
    isbn: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(v) {
                return /^(?:\d{10}|\d{13})$/.test(v);
            },
            message: 'ISBN invalide'
        }
    },
    category: {
        type: String,
        required: true,
        enum: ['Programming', 'DevOps', 'Design Patterns', 'Architecture', 'Other'] // Retiré 'fiction'
    },
    pageCount: {
        type: Number,
        min: [1, 'Le nombre de pages doit être positif']
    },
    readingStatus: {
        type: String,
        required: true,
        enum: ['À lire', 'En cours', 'Terminé'],
        default: 'À lire'
    },
    priority: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Ajout des index
bookSchema.index({ readingStatus: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ createdAt: -1 }); // Utiliser 'addedAt' si vous le conservez

module.exports = mongoose.model('Book', bookSchema);
