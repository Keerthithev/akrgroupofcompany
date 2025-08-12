const mongoose = require('mongoose');

const manualRevenueSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['collected', 'upcoming'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ManualRevenue', manualRevenueSchema); 