const express = require('express');
const { check } = require('express-validator');
const {
  addMovie,
  updateMovie,
  addEvent,
  updateEvent,
  addVenue,
  updateVenue,
  addShow,
  updateShow,
  getAllBookings,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect, admin);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
// @access  Private/Admin
router.get('/dashboard', getDashboardStats);

// @route   POST /api/admin/movies
// @desc    Add new movie
// @access  Private/Admin
router.post(
  '/movies',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('duration', 'Duration is required').isNumeric(),
    check('genre', 'Genre is required').isArray().notEmpty(),
    check('language', 'Language is required').not().isEmpty(),
    check('releaseDate', 'Release date is required').not().isEmpty()
  ],
  addMovie
);

// @route   PUT /api/admin/movies/:id
// @desc    Update movie
// @access  Private/Admin
router.put('/movies/:id', updateMovie);

// @route   POST /api/admin/events
// @desc    Add new event
// @access  Private/Admin
router.post(
  '/events',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('type', 'Type is required').not().isEmpty(),
    check('duration', 'Duration is required').isNumeric(),
    check('category', 'Category is required').isArray().notEmpty(),
    check('startDate', 'Start date is required').not().isEmpty(),
    check('endDate', 'End date is required').not().isEmpty()
  ],
  addEvent
);

// @route   PUT /api/admin/events/:id
// @desc    Update event
// @access  Private/Admin
router.put('/events/:id', updateEvent);

// @route   POST /api/admin/venues
// @desc    Add new venue
// @access  Private/Admin
router.post(
  '/venues',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    check('state', 'State is required').not().isEmpty(),
    check('zipCode', 'Zip code is required').not().isEmpty(),
    check('type', 'Type is required').not().isEmpty(),
    check('totalSeats', 'Total seats is required').isNumeric()
  ],
  addVenue
);

// @route   PUT /api/admin/venues/:id
// @desc    Update venue
// @access  Private/Admin
router.put('/venues/:id', updateVenue);

// @route   POST /api/admin/shows
// @desc    Add new show
// @access  Private/Admin
router.post(
  '/shows',
  [
    check('showType', 'Show type is required').isIn(['Movie', 'Event']),
    check('venue', 'Venue is required').not().isEmpty(),
    check('startTime', 'Start time is required').not().isEmpty(),
    check('endTime', 'End time is required').not().isEmpty(),
    check('seatingLayout', 'Seating layout is required').not().isEmpty(),
    check('priceCategories', 'Price categories are required').not().isEmpty()
  ],
  addShow
);

// @route   PUT /api/admin/shows/:id
// @desc    Update show
// @access  Private/Admin
router.put('/shows/:id', updateShow);

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Private/Admin
router.get('/bookings', getAllBookings);

module.exports = router;