const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },
  seats: {
    type: [String],
    required: [true, 'Please add at least one seat']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please add total amount']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  bookingStatus: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Pending'],
    default: 'Pending'
  },
  bookingTime: {
    type: Date,
    default: Date.now
  },
  bookingId: {
    type: String,
    unique: true
  },
  showDetails: {
    type: mongoose.Schema.Types.Mixed,
    required: true
    // This will store a snapshot of show details at the time of booking
    // Including venue, movie/event name, time, etc.
  }
});

// Generate unique booking ID before saving
BookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    // Generate a unique booking ID (e.g., BMS-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
                   (date.getMonth() + 1).toString().padStart(2, '0') +
                   date.getDate().toString().padStart(2, '0');
    
    // Get random 4-digit number
    const random = Math.floor(1000 + Math.random() * 9000);
    
    this.bookingId = `BMS-${dateStr}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);