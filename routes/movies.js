const express = require('express');
const { getMovies, getMovie, getMovieShows } = require('../controllers/movieController');

const router = express.Router();

// @route   GET /api/movies
// @desc    Get all movies
// @access  Public
router.get('/', getMovies);

// @route   GET /api/movies/:id
// @desc    Get single movie
// @access  Public
router.get('/:id', getMovie);

// @route   GET /api/movies/:id/shows
// @desc    Get movie shows by city
// @access  Public
router.get('/:id/shows', getMovieShows);

module.exports = router;