const moment = require('moment');
const SeatLock = require('../models/SeatLock');

// Middleware to check if seats are available
exports.checkSeatAvailability = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    
    // Check if any of the selected seats are locked
    const lockedSeats = await SeatLock.find({
      showId,
      seatNumber: { $in: seats },
      expiresAt: { $gt: new Date() }
    });

    if (lockedSeats.length > 0) {
      // Some seats are locked
      const unavailableSeats = lockedSeats.map(lock => lock.seatNumber);
      return res.status(400).json({
        message: 'Some seats are not available',
        unavailableSeats
      });
    }

    // All seats are available
    next();
  } catch (error) {
    console.error('Seat availability check error:', error);
    return res.status(500).json({ message: 'Error checking seat availability' });
  }
};

// Middleware to lock seats temporarily
exports.lockSeats = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    const userId = req.user.id;
    
    // Lock expiration time (e.g., 10 minutes)
    const expiresAt = moment().add(10, 'minutes').toDate();
    
    // Create lock records for each seat
    const lockPromises = seats.map(seatNumber => {
      return SeatLock.findOneAndUpdate(
        { showId, seatNumber },
        { userId, showId, seatNumber, expiresAt },
        { upsert: true, new: true }
      );
    });
    
    await Promise.all(lockPromises);
    
    // Add expiration time to request for later use
    req.lockExpiresAt = expiresAt;
    
    next();
  } catch (error) {
    console.error('Seat locking error:', error);
    return res.status(500).json({ message: 'Error locking seats' });
  }
};

// Function to release locks (to be called when booking is completed or abandoned)
exports.releaseSeats = async (showId, seats, userId) => {
  try {
    await SeatLock.deleteMany({
      showId,
      seatNumber: { $in: seats },
      userId
    });
    
    return true;
  } catch (error) {
    console.error('Error releasing seats:', error);
    return false;
  }
};