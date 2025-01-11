// routes/books.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const validateBookInput = require('../middleware/validateBookInput');
const authJwt = require('../middleware/authJwt');

// Protection de toutes les routes avec authJwt
// L'utilisateur doit être connecté pour accéder à toutes les fonctionnalités des livres
router.get('/dashboard', authJwt, bookController.dashboard);
router.get('/', authJwt, bookController.list);
router.get('/new', authJwt, bookController.createForm);
router.post('/', [authJwt, validateBookInput], bookController.create);
router.get('/:id', authJwt, bookController.show);
router.get('/:id/edit', authJwt, bookController.editForm);
router.post('/:id', [authJwt, validateBookInput], bookController.update);
router.post('/:id/delete', authJwt, bookController.delete);

module.exports = router;