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
  payments: {
    credit: { type: String },
    cash: { type: Number },
    total: { type: Number }
  },
  fuel: {
    liters: { type: Number },
    startMeter: { type: Number },
    endMeter: { type: Number },
    totalKm: { type: Number }
  },
  expenses: [{
    description: { type: String },
    amount: { type: Number }
  }],
  driverSignature: { type: String },
  supervisorSignature: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VehicleLog', VehicleLogSchema); 