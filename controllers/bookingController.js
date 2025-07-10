const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { validationResult } = require('express-validator');
const { releaseSeats } = require('../middleware/seatLock');

// @desc    Get show details for booking
// @route   GET /api/bookings/shows/:id
// @access  Private
exports.getShowDetails = async (req, res) => {
  try {
    const showId = req.params.id;
    
    // Get show details with populated references
    const show = await Show.findById(showId)
      .populate({
        path: 'movie',
        select: 'title poster duration genre language'
      })
      .populate({
        path: 'event',
        select: 'name poster duration type category'
      })
      .populate('venue', 'name address city');
    
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    
    // Check if show is active and not past
    if (!show.isActive || new Date(show.startTime) < new Date()) {
      return res.status(400).json({ message: 'Show is not available for booking' });
    }
    
    res.status(200).json({
      success: true,
      data: {
        show: {
          _id: show._id,
          showType: show.showType,
          startTime: show.startTime,
          endTime: show.endTime,
          format: show.format,
          seatingLayout: show.seatingLayout,
          availableSeats: show.availableSeats,
          bookedSeats: show.bookedSeats,
          priceCategories: Object.fromEntries(show.priceCategories)
        },
        venue: show.venue,
        content: show.showType === 'Movie' ? show.movie : show.event
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { showId, seats, totalAmount, paymentId } = req.body;
    
    // Get show details
    const show = await Show.findById(showId)
      .populate({
        path: 'movie',
        select: 'title poster duration'
      })
      .populate({
        path: 'event',
        select: 'name poster duration'
      })
      .populate('venue', 'name address city');
    
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    
    // Check if all seats are available
    const unavailableSeats = seats.filter(seat => !show.availableSeats.includes(seat));
    
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        message: 'Some seats are not available',
        unavailableSeats
      });
    }
    
    // Create show details snapshot
    const showDetails = {
      showId: show._id,
      showType: show.showType,
      startTime: show.startTime,
      endTime: show.endTime,
      venue: {
        id: show.venue._id,
        name: show.venue.name,
        address: show.venue.address,
        city: show.venue.city
      }
    };
    
    // Add movie or event details
    if (show.showType === 'Movie' && show.movie) {
      showDetails.movie = {
        id: show.movie._id,
        title: show.movie.title,
        poster: show.movie.poster,
        duration: show.movie.duration
      };
    } else if (show.showType === 'Event' && show.event) {
      showDetails.event = {
        id: show.event._id,
        name: show.event.name,
        poster: show.event.poster,
        duration: show.event.duration
      };
    }
    
    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      show: showId,
      seats,
      totalAmount,
      paymentId: paymentId || '',
      paymentStatus: paymentId ? 'Completed' : 'Pending',
      bookingStatus: paymentId ? 'Confirmed' : 'Pending',
      showDetails
    });
    
    // Update show's available and booked seats
    await Show.findByIdAndUpdate(showId, {
      $pull: { availableSeats: { $in: seats } },
      $push: { bookedSeats: { $each: seats } }
    });
    
    // Release seat locks
    await releaseSeats(showId, seats, req.user.id);
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
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

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if booking belongs to user or user is admin
    if (booking.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access this booking' });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if booking belongs to user or user is admin
    if (booking.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    // Check if booking can be cancelled (e.g., not too close to show time)
    const showTime = new Date(booking.showDetails.startTime);
    const currentTime = new Date();
    const hoursDifference = (showTime - currentTime) / (1000 * 60 * 60);
    
    if (hoursDifference < 3 && !req.user.isAdmin) {
      return res.status(400).json({ 
        message: 'Booking cannot be cancelled less than 3 hours before show time' 
      });
    }
    
    // Update booking status
    booking.bookingStatus = 'Cancelled';
    if (booking.paymentStatus === 'Completed') {
      booking.paymentStatus = 'Refunded';
    }
    
    await booking.save();
    
    // Return seats to available pool
    await Show.findByIdAndUpdate(booking.show, {
      $pull: { bookedSeats: { $in: booking.seats } },
      $push: { availableSeats: { $each: booking.seats } }
    });
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};