const mongoose = require('mongoose');

const VehicleLogSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  date: { type: Date, required: true },
  employeeId: { type: String, required: true }, // Reference to employee
  employeeName: { type: String, required: true }, // Employee name for quick reference
  startMeter: { type: Number },
  startPlace: { type: String },
  endMeter: { type: Number },
  endPlace: { type: String },
  workingKm: { type: Number },
  description: { type: String },
  duties: [{ type: String }], // Duties performed on this trip
  
  // New fields for items and delivery
  itemsLoading: [{ type: String }], // Items being loaded (sand, salli, etc.)
  customerName: { type: String }, // Customer name for delivery
  customerPhone: { type: String }, // Customer phone number
  deliveryAddress: { type: String }, // Delivery address
  
  // Enhanced payment structure
  payments: {
    credit: { type: Number, default: 0 }, // Credit amount
    cash: { type: Number, default: 0 }, // Cash amount
    total: { type: Number, default: 0 }, // Total amount (cash + credit)
    paymentMethod: { type: String, enum: ['cash', 'credit', 'mixed'], default: 'cash' },
    creditStatus: { type: String, enum: ['pending', 'partial', 'completed'], default: 'pending' },
    creditPaidAmount: { type: Number, default: 0 }, // Amount paid against credit
    creditRemaining: { type: Number, default: 0 } // Remaining credit amount
  },
  
  fuel: {
    liters: { type: Number },
    startMeter: { type: Number },
    endMeter: { type: Number },
    totalKm: { type: Number },
    fuelEfficiency: { type: Number } // KM per liter
  },
  expenses: [{
    description: { type: String },
    amount: { type: Number }
  }],
  salary: [{ // Added salary field
    item: { type: String },
    amount: { type: Number }
  }],
  // Supplier info and payments for this log
  supplier: {
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String },
    suppliedItems: [{ item: String, quantity: Number, unitPrice: Number, total: Number }],
    amountPayable: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    paymentDescription: { type: String, default: '' }
  },
  setCashTaken: { type: Number, default: 0 }, // Added setCashTaken
  setCashPaidBack: { type: Number, default: 0 }, // Added setCashPaidBack - tracks how much of set cash has been paid back
  yesterdayBalance: { type: Number, default: 0 }, // Added yesterdayBalance
  salaryDeductedFromBalance: { type: Number, default: 0 }, // Track salary deducted from balance
  driverSignature: { type: String },
  supervisorSignature: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to calculate totals and update credit status
VehicleLogSchema.pre('save', function(next) {
  // Calculate working kilometers if start and end meters are provided
  if (this.startMeter && this.endMeter) {
    this.workingKm = this.endMeter - this.startMeter;
  }
  
  // Calculate total payment
  if (this.payments) {
    this.payments.total = (this.payments.cash || 0) + (this.payments.credit || 0);
    
    // Calculate remaining credit
    this.payments.creditRemaining = (this.payments.credit || 0) - (this.payments.creditPaidAmount || 0);
    
    // Update credit status
    if ((this.payments.credit || 0) === 0) {
      this.payments.creditStatus = 'completed';
    } else if (this.payments.creditRemaining <= 0) {
      this.payments.creditStatus = 'completed';
    } else if (this.payments.creditPaidAmount > 0) {
      this.payments.creditStatus = 'partial';
    } else {
      this.payments.creditStatus = 'pending';
    }
  }
  
  // Calculate fuel efficiency if fuel data is provided
  if (this.fuel && this.fuel.liters && this.fuel.totalKm) {
    this.fuel.fuelEfficiency = this.fuel.totalKm / this.fuel.liters;
  }
  
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('VehicleLog', VehicleLogSchema); 