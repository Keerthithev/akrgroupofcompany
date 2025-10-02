const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  position: { type: String, required: true }, // Driver, Supervisor, Worker, etc.
  department: { type: String, default: 'Construction' },
  duties: [{ type: String }], // Array of assigned duties
  assignedVehicles: [{ type: String }], // Vehicle numbers assigned to this employee
  walletBalance: { type: Number, default: 0 },
  pendingSalary: { type: Number, default: 0 },
  yesterdayBalance: { type: Number, default: 0 },
  lastSalaryAmount: { type: Number, default: 0 },
  salary: { type: Number },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  address: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },
  documents: [{
    type: { type: String }, // ID Card, License, etc.
    number: { type: String },
    expiryDate: { type: Date }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', EmployeeSchema); 