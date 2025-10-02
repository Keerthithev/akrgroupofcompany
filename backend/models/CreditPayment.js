const mongoose = require('mongoose');

const CreditPaymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: true },
  vehicleLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleLog' },
  originalCreditAmount: { type: Number, required: true }, // Original credit amount from vehicle log
  paymentAmount: { type: Number, required: true }, // Amount being paid
  paymentDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'cheque', 'other'], default: 'cash' },
  referenceNumber: { type: String }, // Cheque number, transaction ID, etc.
  notes: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  adminId: { type: String, required: true }, // Admin who processed the payment
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CreditPayment', CreditPaymentSchema);
