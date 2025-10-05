const mongoose = require('mongoose');

const FuelLogSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  
  // Fuel details
  fuelAmount: { type: Number, required: true }, // Liters of fuel
  fuelPrice: { type: Number, default: 0 }, // Price per liter
  totalCost: { type: Number, default: 0 }, // Total fuel cost
  
  // Odometer readings (optional)
  startKm: { type: Number, default: 0 },
  endKm: { type: Number, default: 0 },
  distanceTraveled: { type: Number, default: 0 }, // Calculated distance
  
  // Fuel efficiency (optional)
  fuelEfficiency: { type: Number, default: 0 }, // KM per liter
  
  // Payment status
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'partial'], 
    default: 'pending' 
  },
  paidAmount: { type: Number, default: 0 }, // Amount paid by employee at station
  overallPaidAmount: { type: Number, default: 0 }, // Amount paid through overall payments
  remainingAmount: { type: Number, default: 0 },
  
  // Additional details
  fuelStation: { type: String, default: 'AKR Shed' },
  notes: { type: String, default: '' },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to calculate derived fields
FuelLogSchema.pre('save', function(next) {
  // Calculate distance traveled (only if both start and end KM are provided)
  if (this.startKm && this.endKm && this.startKm > 0 && this.endKm > 0) {
    this.distanceTraveled = this.endKm - this.startKm;
  }
  
  // Calculate fuel efficiency (KM per liter) - only if we have distance data
  if (this.fuelAmount > 0 && this.distanceTraveled > 0) {
    this.fuelEfficiency = this.distanceTraveled / this.fuelAmount;
  }
  
  // Calculate total cost (always calculate this)
  if (this.fuelAmount && this.fuelPrice) {
    this.totalCost = this.fuelAmount * this.fuelPrice;
  }
  
  // Calculate remaining amount (considering both employee payments and overall payments)
  const totalPaid = (this.paidAmount || 0) + (this.overallPaidAmount || 0);
  this.remainingAmount = this.totalCost - totalPaid;
  
  // Update payment status based on remaining amount
  if (this.remainingAmount <= 0) {
    this.paymentStatus = 'paid';
  } else if (totalPaid > 0) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'pending';
  }
  
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('FuelLog', FuelLogSchema);
