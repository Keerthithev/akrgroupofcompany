const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  features: [String],
  specs: {
    type: Map,
    of: String,
    default: {}
  }
}, { _id: false });

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  images: [{ type: String, required: true }]
}, { _id: false });

const VehicleSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  variants: [VariantSchema],
  features: [String],
  specs: {
    type: Map,
    of: String,
    default: {}
  },
  colors: [ColorSchema],
  rating: { type: Number },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  images: [String],
  faqs: [{ question: String, answer: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', VehicleSchema); 