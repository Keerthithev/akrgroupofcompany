const mongoose = require('mongoose');

const ShedWalletSchema = new mongoose.Schema({
  // Shed information
  shedName: { 
    type: String, 
    required: true, 
    default: 'AKR Shed' 
  },
  
  // Wallet balance
  currentBalance: { 
    type: Number, 
    default: 0 
  },
  
  // Pending amount to be sent to shed
  pendingAmount: { 
    type: Number, 
    default: 0 
  },
  
  // Total amount ever received by shed
  totalReceived: { 
    type: Number, 
    default: 0 
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  
  // Contact information
  contactPerson: { 
    type: String, 
    default: '' 
  },
  phoneNumber: { 
    type: String, 
    default: '' 
  },
  
  // Timestamps
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
ShedWalletSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ShedWallet', ShedWalletSchema);
