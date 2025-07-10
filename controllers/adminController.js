const Movie = require('../models/Movie');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Add new movie
// @route   POST /api/admin/movies
// @access  Private/Admin
exports.addMovie = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const movie = await Movie.create(req.body);
    
    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update movie
// @route   PUT /api/admin/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add new event
// @route   POST /api/admin/events
// @access  Private/Admin
exports.addEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const event = await Event.create(req.body);
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update event
// @route   PUT /api/admin/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add new venue
// @route   POST /api/admin/venues
// @access  Private/Admin
exports.addVenue = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const venue = await Venue.create(req.body);
    
    res.status(201).json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update venue
// @route   PUT /api/admin/venues/:id
// @access  Private/Admin
exports.updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    res.status(200).json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add new show
// @route   POST /api/admin/shows
// @access  Private/Admin
exports.addShow = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { showType, movie, event, venue, startTime, endTime, seatingLayout, priceCategories } = req.body;
    
    // Validate that either movie or event is provided based on showType
    if (showType === 'Movie' && !movie) {
      return res.status(400).json({ message: 'Movie ID is required for movie shows' });
    }
    
    if (showType === 'Event' && !event) {
      return res.status(400).json({ message: 'Event ID is required for event shows' });
    }
    
    // Validate venue exists
    const venueExists = await Venue.findById(venue);
    if (!venueExists) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    // Generate available seats from seating layout
    const availableSeats = [];
    
    // Process seating layout to extract all seat numbers
    // This is a simplified example - actual implementation would depend on your seating layout structure
    for (const section in seatingLayout) {
      const sectionData = seatingLayout[section];
      
      for (let row = 0; row < sectionData.rows; row++) {
        for (let col = 0; col < sectionData.cols; col++) {
          // Skip if seat is marked as not available in the layout
          if (sectionData.unavailableSeats && 
              sectionData.unavailableSeats.some(seat => 
                seat.row === row && seat.col === col)) {
            continue;
          }
          
          // Generate seat number (e.g., A1, B2, etc.)
          const rowLabel = String.fromCharCode(65 + row); // A, B, C, ...
          const seatNumber = `${section}-${rowLabel}${col + 1}`;
          availableSeats.push(seatNumber);
        }
      }
    }
    
    // Create show
    const show = await Show.create({
      showType,
      movie: showType === 'Movie' ? movie : undefined,
      event: showType === 'Event' ? event : undefined,
      venue,
      startTime,
      endTime,
      seatingLayout,
      availableSeats,
      bookedSeats: [],
      priceCategories: new Map(Object.entries(priceCategories))
    });
    
    res.status(201).json({
      success: true,
      data: show
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update show
// @route   PUT /api/admin/shows/:id
// @access  Private/Admin
exports.updateShow = async (req, res) => {
  try {
    // Get existing show
    const existingShow = await Show.findById(req.params.id);
    
    if (!existingShow) {
      return res.status(404).json({ message: 'Show not found' });
    }
    
    // Check if there are any bookings for this show
    const bookings = await Booking.countDocuments({ show: req.params.id });
    
    if (bookings > 0 && (req.body.seatingLayout || req.body.venue)) {
      return res.status(400).json({ 
        message: 'Cannot change seating layout or venue for shows with existing bookings' 
      });
    }
    
    // Update show
    const show = await Show.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: show
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { showId, startDate, endDate, status } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by show if provided
    if (showId) {
      query.show = showId;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.bookingTime = {};
      
      if (startDate) {
        query.bookingTime.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.bookingTime.$lte = endDateObj;
      }
    }
    
    // Filter by status if provided
    if (status) {
      query.bookingStatus = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .sort({ bookingTime: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const movieCount = await Movie.countDocuments();
    const eventCount = await Event.countDocuments();
    const venueCount = await Venue.countDocuments();
    const userCount = await User.countDocuments({ isAdmin: false });
    
    // Get upcoming shows count
    const upcomingShowsCount = await Show.countDocuments({
      startTime: { $gte: new Date() },
      isActive: true
    });
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name')
      .sort({ bookingTime: -1 })
      .limit(10);
    
    // Get revenue stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const bookings = await Booking.find({
      bookingTime: { $gte: thirtyDaysAgo },
      paymentStatus: 'Completed'
    });
    
    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    // Group bookings by date for chart data
    const revenueByDate = {};
    
    bookings.forEach(booking => {
      const date = booking.bookingTime.toISOString().split('T')[0];
      
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      
      revenueByDate[date] += booking.totalAmount;
    });
    
    // Convert to array for chart data
    const revenueChartData = Object.entries(revenueByDate).map(([date, amount]) => ({
      date,
      amount
    }));
    
    res.status(200).json({
      success: true,
      data: {
        counts: {
          movies: movieCount,
          events: eventCount,
          venues: venueCount,
          users: userCount,
          upcomingShows: upcomingShowsCount
        },
        recentBookings,
        revenue: {
          total: totalRevenue,
          chartData: revenueChartData
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};