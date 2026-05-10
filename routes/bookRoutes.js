const express = require('express');
const router = express.Router();
const {
  getBooks, getBook, getFeaturedBooks, createBook, updateBook, deleteBook, getCategories,
} = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/featured', getFeaturedBooks);
router.get('/categories', getCategories);
router.get('/', getBooks);
router.get('/:id', getBook);
router.post('/', protect, adminOnly, createBook);
router.put('/:id', protect, adminOnly, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
