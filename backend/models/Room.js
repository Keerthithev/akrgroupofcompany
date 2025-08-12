const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["Economy", "Business", "First-Class"], required: true },
  type: { type: String, required: true }, // e.g. Double, Twin, Suite
  beds: { type: String, required: true }, // e.g. 1 double, 2 single
  maxGuests: { type: Number, required: true },
  size: { type: Number }, // in m²
  description: { type: String },
  images: [String],
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  breakfastIncluded: { type: Boolean, default: false },
  breakfastPrice: { type: Number },
  cancellationPolicy: { type: String },
  view: { type: String }, // e.g. Garden, Sea, City
  capacity: { type: Number, default: 1 },
  amenities: [String],
  isAvailable: { type: Boolean, default: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Cleaning'], default: 'Available' },
  cleaningEndTime: { type: Date },
  lastBookingEnd: { type: Date },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Room', RoomSchema); 