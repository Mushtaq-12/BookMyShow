const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Venue = require('../models/Venue');
const { validationResult } = require('express-validator');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res) => {
  try {
    const { city, genre, language } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by active status
    query.isActive = true;
    
    // Filter by genre if provided
    if (genre) {
      query.genre = { $in: [genre] };
    }
    
    // Filter by language if provided
    if (language) {
      query.language = language;
    }
    
    // Execute query
    let movies = await Movie.find(query).sort({ releaseDate: -1 });
    
    // If city is provided, filter movies that have shows in that city
    if (city) {
      // Get all venues in the specified city
      const venues = await Venue.find({ city, isActive: true }).select('_id');
      const venueIds = venues.map(venue => venue._id);
      
      // Get all shows in these venues
      const shows = await Show.find({
        venue: { $in: venueIds },
        showType: 'Movie',
        startTime: { $gte: new Date() },
        isActive: true
      }).select('movie');
      
      // Extract unique movie IDs from shows
      const movieIds = [...new Set(shows.map(show => show.movie.toString()))];
      
      // Filter movies that have shows in the city
      movies = movies.filter(movie => movieIds.includes(movie._id.toString()));
    }
    
    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get movie shows by city
// @route   GET /api/movies/:id/shows
// @access  Public
exports.getMovieShows = async (req, res) => {
  try {
    const { city, date } = req.query;
    const movieId = req.params.id;
    
    // Validate movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Build query for shows
    let query = {
      showType: 'Movie',
      movie: movieId,
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
        format: show.format,
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