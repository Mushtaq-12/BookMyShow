const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  type: {
    type: String,
    required: [true, 'Please add event type'],
    enum: ['Concert', 'Sports', 'Theater', 'Conference', 'Exhibition', 'Other']
  },
  duration: {
    type: Number,
    required: [true, 'Please add duration in minutes']
  },
  category: {
    type: [String],
    required: [true, 'Please add at least one category']
  },
  language: {
    type: String,
    default: 'Not Applicable'
  },
  startDate: {
    type: Date,
    required: [true, 'Please add start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add end date']
  },
  poster: {
    type: String,
    default: 'no-photo.jpg'
  },
  artists: {
    type: [String],
    default: []
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

module.exports = mongoose.model('Event', EventSchema);