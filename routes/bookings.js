const express = require('express');
const { check } = require('express-validator');
const { getShowDetails, createBooking, getUserBookings, getBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { checkSeatAvailability, lockSeats } = require('../middleware/seatLock');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/bookings/shows/:id
// @desc    Get show details for booking
// @access  Private
router.get('/shows/:id', getShowDetails);

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post(
  '/',
  [
    check('showId', 'Show ID is required').not().isEmpty(),
    check('seats', 'Seats are required').isArray().notEmpty(),
    check('totalAmount', 'Total amount is required').isNumeric()
  ],
  checkSeatAvailability,
  lockSeats,
  createBooking
);

// @route   GET /api/bookings
// @desc    Get user bookings
// @access  Private
router.get('/', getUserBookings);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', getBooking);

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', cancelBooking);

module.exports = router;