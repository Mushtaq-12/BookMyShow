const Event = require('../models/Event');
const Show = require('../models/Show');
const Venue = require('../models/Venue');
const { validationResult } = require('express-validator');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const { city, type, category } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by active status
    query.isActive = true;
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    // Filter by category if provided
    if (category) {
      query.category = { $in: [category] };
    }
    
    // Execute query
    let events = await Event.find(query).sort({ startDate: 1 });
    
    // If city is provided, filter events that have shows in that city
    if (city) {
      // Get all venues in the specified city
      const venues = await Venue.find({ city, isActive: true }).select('_id');
      const venueIds = venues.map(venue => venue._id);
      
      // Get all shows in these venues
      const shows = await Show.find({
        venue: { $in: venueIds },
        showType: 'Event',
        startTime: { $gte: new Date() },
        isActive: true
      }).select('event');
      
      // Extract unique event IDs from shows
      const eventIds = [...new Set(shows.map(show => show.event.toString()))];
      
      // Filter events that have shows in the city
      events = events.filter(event => eventIds.includes(event._id.toString()));
    }
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get event shows by city
// @route   GET /api/events/:id/shows
// @access  Public
exports.getEventShows = async (req, res) => {
  try {
    const { city, date } = req.query;
    const eventId = req.params.id;
    
    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Build query for shows
    let query = {
      showType: 'Event',
      event: eventId,
      isActive: true
    };
    
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
    
    // Get venues in the specified city
    let venueQuery = { isActive: true };
    if (city) {
      venueQuery.city = city;
    }
    
    const venues = await Venue.find(venueQuery);
    const venueIds = venues.map(venue => venue._id);
    
    // Add venue filter to query
    query.venue = { $in: venueIds };
    
    // Get shows
    const shows = await Show.find(query)
      .populate('venue', 'name address city')
      .sort({ startTime: 1 });
    
    // Group shows by date and venue
    const groupedShows = {};
    
    shows.forEach(show => {
      const showDate = show.startTime.toISOString().split('T')[0];
      
      if (!groupedShows[showDate]) {
        groupedShows[showDate] = {};
      }
      
      const venueId = show.venue._id.toString();
      
      if (!groupedShows[showDate][venueId]) {
        groupedShows[showDate][venueId] = {
          venue: show.venue,
          shows: []
        };
      }
      
      groupedShows[showDate][venueId].shows.push({
        _id: show._id,
        startTime: show.startTime,
        endTime: show.endTime,
        availableSeats: show.availableSeats.length
      });
    });
    
    res.status(200).json({
      success: true,
      data: groupedShows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};