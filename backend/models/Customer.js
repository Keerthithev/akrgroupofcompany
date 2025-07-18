const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  vehicleModel: { type: String },
  fullAmountPaid: { type: Boolean, default: false },
  downPayment: { type: Number, default: 0 },
  leasing: { type: Boolean, default: false },
  leasingProvider: { type: String },
  purchaseDate: { type: Date, default: Date.now },
  notes: { type: String }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  purchases: [purchaseSchema]
});

module.exports = mongoose.model('Customer', customerSchema); 