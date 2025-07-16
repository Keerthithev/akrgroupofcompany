const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. Deluxe, Suite
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  features: [String],
  specs: {
    type: Map,
    of: String,
    default: {}
  },
  images: [{ type: String, required: true }],
  amenities: [String],
  status: { type: String, enum: ['Available', 'Booked', 'Maintenance'], default: 'Available' },
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema); 