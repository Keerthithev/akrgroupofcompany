const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  age: { type: Number },
  relationship: { type: String },
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  checkInTime: { type: String, default: '14:00' }, // Default 2 PM
  checkOutTime: { type: String, default: '11:00' }, // Default 11 AM
  guests: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  payment: {
    amount: Number,
    method: String,
    status: String,
    reference: String,
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  advancePaid: { type: Number, default: 0 }, // 10% advance
  totalAmount: { type: Number, default: 0 }, // Total booking amount
  discountAmount: { type: Number, default: 0 }, // Discount amount in currency
  discountPercentage: { type: Number, default: 0 }, // Discount percentage
  discountReason: { type: String }, // Reason for discount
  finalAmount: { type: Number, default: 0 }, // Final amount after discount
  paymentReference: { type: String },
  customers: [CustomerSchema], // <-- NEW: array of customers for this booking
  customerName: { type: String }, // (legacy, for single bookings)
  customerEmail: { type: String },
  customerPhone: { type: String },
  customerAddress: { type: String },
  specialRequests: { type: String },
  // Review invitation fields
  reviewInvitationSent: { type: Boolean, default: false },
  reviewInvitationDate: { type: Date },
  reviewToken: { type: String }, // Unique token for review invitation
  reviewExpiryDate: { type: Date }, // When the review invitation expires
}, { timestamps: true });

module.exports = mongoose.model('Bookinghotel', BookingSchema); 