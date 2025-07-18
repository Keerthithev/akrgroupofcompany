const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  mode: { type: String, enum: ['online', 'maintenance'], default: 'online' },
  bannerImages: { type: [String], default: [] },
  bannerText: { type: String, default: '' },
  bannerHeading: { type: String, default: '' },
  bannerSubheading: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  openingHours: { type: [String], default: [] }
});

module.exports = mongoose.model('Setting', settingSchema); 