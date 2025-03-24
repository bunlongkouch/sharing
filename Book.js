const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    image: { type: String, default: 'placeholder.jpg' },
    publishedDate: String,
    synopsis: String
});

// Create models for different collections
const Book = mongoose.model('Book', bookSchema, 'book_recommendations');
const TrendingBook = mongoose.model('TrendingBook', bookSchema, 'trending-books');
const BestSellerBook = mongoose.model('BestSellerBook', bookSchema, 'best-sellers');

module.exports = { Book, TrendingBook, BestSellerBook };