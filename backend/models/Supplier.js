const mongoose = require('mongoose');

const SupplierTransactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['supply', 'payment', 'adjustment'], required: true },
  description: { type: String },
  item: { type: String },
  quantity: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }, // positive increases payable, negative decreases
  vehicleLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleLog' }
});

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  phone: { type: String },
  address: { type: String },
  items: [{ type: String }],
  walletBalance: { type: Number, default: 0 }, // Payable to supplier (+), prepaid (-)
  transactions: [SupplierTransactionSchema],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SupplierSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Supplier', SupplierSchema);


