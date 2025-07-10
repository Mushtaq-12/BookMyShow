const express = require('express');
const { getEvents, getEvent, getEventShows } = require('../controllers/eventController');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', getEvents);

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', getEvent);

// @route   GET /api/events/:id/shows
// @desc    Get event shows by city
// @access  Public
router.get('/:id/shows', getEventShows);

module.exports = router;