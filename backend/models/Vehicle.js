const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  vehicleNumber: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

VehicleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Vehicle', VehicleSchema);


