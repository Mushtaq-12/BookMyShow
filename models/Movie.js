const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  duration: {
    type: Number,
    required: [true, 'Please add duration in minutes']
  },
  genre: {
    type: [String],
    required: [true, 'Please add at least one genre']
  },
  language: {
    type: String,
    required: [true, 'Please add language']
  },
  releaseDate: {
    type: Date,
    required: [true, 'Please add release date']
  },
  poster: {
    type: String,
    default: 'no-photo.jpg'
  },
  cast: {
    type: [String],
    default: []
  },
  director: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [10, 'Rating cannot be more than 10'],
    default: 0
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

module.exports = mongoose.model('Movie', MovieSchema);