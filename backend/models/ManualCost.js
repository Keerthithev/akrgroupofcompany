const mongoose = require('mongoose');

const manualCostSchema = new mongoose.Schema({
  category: { 
    type: String, 
    enum: ['Maintenance', 'Utilities', 'Supplies', 'Staff', 'Marketing', 'Other'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  description: { 
    type: String, 
    required: true, 
    trim: true 
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Card', 'Bank Transfer', 'Other'], 
    default: 'Cash' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('ManualCost', manualCostSchema); 