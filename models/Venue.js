const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  state: {
    type: String,
    required: [true, 'Please add a state']
  },
  zipCode: {
    type: String,
    required: [true, 'Please add a zip code']
  },
  type: {
    type: String,
    enum: ['Cinema', 'Stadium', 'Auditorium', 'Theater', 'Conference Hall', 'Other'],
    required: [true, 'Please add venue type']
  },
  totalSeats: {
    type: Number,
    required: [true, 'Please add total number of seats']
  },
  facilities: {
    type: [String],
    default: []
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String
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

module.exports = mongoose.model('Venue', VenueSchema);