const Venue = require('../models/Venue');
const Show = require('../models/Show');
const { validationResult } = require('express-validator');

// @desc    Get all venues
// @route   GET /api/venues
// @access  Public
exports.getVenues = async (req, res) => {
  try {
    const { city, type } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    // Filter by city if provided
    if (city) {
      query.city = city;
    }
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    const venues = await Venue.find(query).sort('name');
    
    res.status(200).json({
      success: true,
      count: venues.length,
      data: venues
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single venue
// @route   GET /api/venues/:id
// @access  Public
exports.getVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    res.status(200).json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get venue shows
// @route   GET /api/venues/:id/shows
// @access  Public
exports.getVenueShows = async (req, res) => {
  try {
    const { date, type } = req.query;
    const venueId = req.params.id;
    
    // Validate venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    // Build query for shows
    let query = {
      venue: venueId,
      isActive: true
    };
    
    // Filter by show type if provided
    if (type && ['Movie', 'Event'].includes(type)) {
      query.showType = type;
    }
    
    // Filter by date if provided
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Default to shows from current time onwards
      query.startTime = { $gte: new Date() };
    }
    
    // Get shows
    const shows = await Show.find(query)
      .populate({
        path: 'movie',
        select: 'title poster duration genre language'
      })
      .populate({
        path: 'event',
        select: 'name poster duration type category'
      })
      .sort({ startTime: 1 });
    
    // Format response
    const formattedShows = shows.map(show => {
      const showData = {
        _id: show._id,
        showType: show.showType,
        startTime: show.startTime,
        endTime: show.endTime,
        availableSeats: show.availableSeats.length,
        format: show.format
      };
      
      // Add movie or event details
      if (show.showType === 'Movie' && show.movie) {
        showData.movie = show.movie;
      } else if (show.showType === 'Event' && show.event) {
        showData.event = show.event;
      }
      
      return showData;
    });
    
    res.status(200).json({
      success: true,
      count: formattedShows.length,
      data: formattedShows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get cities with active venues
// @route   GET /api/venues/cities
// @access  Public
exports.getCities = async (req, res) => {
  try {
    // Get distinct cities from venues
    const cities = await Venue.distinct('city', { isActive: true });
    
    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities.sort()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};