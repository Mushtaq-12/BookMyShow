const mongoose = require('mongoose');

const ShowSchema = new mongoose.Schema({
  showType: {
    type: String,
    enum: ['Movie', 'Event'],
    required: [true, 'Please specify if this is a Movie or Event show']
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: function() {
      return this.showType === 'Movie';
    }
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: function() {
      return this.showType === 'Event';
    }
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'Please add a venue']
  },
  startTime: {
    type: Date,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time']
  },
  language: {
    type: String,
    default: function() {
      return this.showType === 'Movie' ? 'Same as movie' : 'Not Applicable';
    }
  },
  format: {
    type: String,
    enum: ['2D', '3D', 'IMAX', 'IMAX 3D', '4DX', 'Not Applicable'],
    default: function() {
      return this.showType === 'Movie' ? '2D' : 'Not Applicable';
    }
  },
  seatingLayout: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Please provide seating layout']
    // This will store the seating arrangement (rows, columns, seat types)
  },
  availableSeats: {
    type: [String],
    required: [true, 'Please provide available seats']
  },
  bookedSeats: {
    type: [String],
    default: []
  },
  priceCategories: {
    type: Map,
    of: Number,
    required: [true, 'Please provide price categories']
    // Example: { 'Premium': 300, 'Executive': 200, 'Normal': 150 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for city-based searches
ShowSchema.index({ 'venue.city': 1, startTime: 1 });

module.exports = mongoose.model('Show', ShowSchema);