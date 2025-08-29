const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String },
  creditLimit: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 }, // Total credit given
  totalPaid: { type: Number, default: 0 }, // Total amount paid
  remainingCredit: { type: Number, default: 0 }, // Remaining credit to be paid
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to calculate remaining credit
CustomerSchema.pre('save', function(next) {
  this.remainingCredit = this.totalCredit - this.totalPaid;
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Customer', CustomerSchema);
