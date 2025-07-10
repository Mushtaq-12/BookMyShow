const mongoose = require('mongoose');

const SeatLockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  showId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Document will be automatically deleted when current time > expiresAt
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness of showId + seatNumber combination
SeatLockSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('SeatLock', SeatLockSchema);