const mongoose = require('mongoose');

const preBookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  nationalId: { type: String, required: true },
  address: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Pending', 'Ordered', 'Delivered', 'Cancelled'], default: 'Pending' },
  bookingId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PreBooking', preBookingSchema); 