const express = require('express');
const router = express.Router();
const { Book, TrendingBook, BestSellerBook } = require('../models/Book');

// Get all books (for search)
router.get('/all-books', async (req, res) => {
    try {
        const books = await Book.find().lean();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get trending books
router.get('/trending-books', async (req, res) => {
    try {
        const books = await TrendingBook.find().lean();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get best sellers
router.get('/best-sellers', async (req, res) => {
    try {
        const books = await BestSellerBook.find().lean();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;