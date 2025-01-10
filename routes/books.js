// routes/books.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const validateBookInput = require('../middleware/validateBookInput');

router.get('/', bookController.dashboard);
router.get('/books', bookController.list);
router.get('/books/new', bookController.createForm);
router.post('/books', validateBookInput, bookController.create);
router.get('/books/:id', bookController.show);
router.get('/books/:id/edit', bookController.editForm);
router.post('/books/:id', validateBookInput, bookController.update);
router.post('/books/:id/delete', bookController.delete);

module.exports = router;