const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  stayDate: {
    type: Date,
    required: true
  },
  helpful: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
ReviewSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema); 