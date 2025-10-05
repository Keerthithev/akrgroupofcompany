const mongoose = require('mongoose');

const ShedTransactionSchema = new mongoose.Schema({
  // Reference to shed wallet
  shedWalletId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ShedWallet', 
    required: true 
  },
  
  // Transaction details
  type: { 
    type: String, 
    enum: ['fuel_purchase', 'payment_sent', 'payment_received', 'adjustment', 'refund'], 
    required: true 
  },
  
  // Amount
  amount: { 
    type: Number, 
    required: true 
  },
  
  // Description
  description: { 
    type: String, 
    required: true 
  },
  
  // Related fuel log (if applicable)
  fuelLogId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FuelLog' 
  },
  
  // Fuel log details for overall payments
  fuelLogDetails: [{
    fuelLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelLog' },
    vehicleNumber: { type: String },
    employeeName: { type: String },
    fuelAmount: { type: Number },
    totalCost: { type: Number },
    paidAmount: { type: Number },
    overallPaidAmount: { type: Number },
    remainingAmount: { type: Number },
    paymentStatus: { type: String }
  }],
  
  // Employee information (who made the transaction)
  employeeId: { 
    type: String 
  },
  employeeName: { 
    type: String 
  },
  
  // Vehicle information
  vehicleNumber: { 
    type: String 
  },
  
  // Payment method
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'transfer', 'cheque', 'other'], 
    default: 'cash' 
  },
  
  // Transaction status
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  
  // Reference number (for bank transfers, etc.)
  referenceNumber: { 
    type: String 
  },
  
  // Notes
  notes: { 
    type: String 
  },
  
  // Admin who processed the transaction
  processedBy: { 
    type: String 
  },
  
  // Timestamps
  transactionDate: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware
ShedTransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better query performance
ShedTransactionSchema.index({ shedWalletId: 1, transactionDate: -1 });
ShedTransactionSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('ShedTransaction', ShedTransactionSchema);
