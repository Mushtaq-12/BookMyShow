const express = require('express');
const { getVenues, getVenue, getVenueShows, getCities } = require('../controllers/venueController');

const router = express.Router();

// @route   GET /api/venues
// @desc    Get all venues
// @access  Public
router.get('/', getVenues);

// @route   GET /api/venues/cities
// @desc    Get cities with active venues
// @access  Public
router.get('/cities', getCities);

// @route   GET /api/venues/:id
// @desc    Get single venue
// @access  Public
router.get('/:id', getVenue);

// @route   GET /api/venues/:id/shows
// @desc    Get venue shows
// @access  Public
router.get('/:id/shows', getVenueShows);

module.exports = router;