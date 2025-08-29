const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // e.g., 'construction', 'supplies', 'materials'
  unit: { type: String, required: true }, // e.g., 'kg', 'tons', 'pieces', 'liters'
  pricePerUnit: { type: Number, default: 0 },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', ItemSchema);
