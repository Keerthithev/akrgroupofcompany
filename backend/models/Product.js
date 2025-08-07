const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: false },
});

module.exports = mongoose.model('Product', ProductSchema); 