const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [String],
});

const SettingsSchema = new mongoose.Schema({
  banners: [String],
  services: [ServiceSchema],
  contact: {
    phone: String,
    email: String,
    address: String,
  },
  homepageText: String,
  homepageHeading: String,
  homepageSubheading: String,
  homepageHeadingColor: String,
  homepageSubheadingColor: String,
  homepageLogo: String,
  // AKR Group Homepage Settings
  akrGroupHeading: String,
  akrGroupSubheading: String,
  akrGroupHeadingColor: String,
  akrGroupSubheadingColor: String,
  akrGroupBanners: [String],
  showRealProducts: { type: Boolean, default: true },
  shoppingBanners: [String],
  shoppingHeading: String,
  shoppingSubheading: String,
  shoppingHeadingColor: String,
  shoppingSubheadingColor: String,
  shoppingSpecialOffer: String,
  shoppingSpecialOfferLink: String,
  gymSection: {
    heading: String,
    subheading: String,
    headingColor: String,
    subheadingColor: String,
    images: [String],
    amenities: [String],
    packages: [{
      name: String,
      price: Number,
      description: String,
      features: [String],
    }],
    showRealGymPackages: { type: Boolean, default: true },
    specialOffer: String,
    specialOfferLink: String,
    showRealGymAmenities: { type: Boolean, default: true },
  },
  hotelSection: {
    heading: String,
    subheading: String,
    headingColor: String,
    subheadingColor: String,
    images: [String],
    amenities: [String],
    specialOffer: String,
    specialOfferLink: String,
  },
  theaterSection: {
    heading: String,
    subheading: String,
    headingColor: String,
    subheadingColor: String,
    images: [String],
    amenities: [String],
    specialOffer: String,
    specialOfferLink: String,
  },
  // Room turnover management settings
  bufferHours: { type: Number, default: 3, min: 1, max: 5 },
});

module.exports = mongoose.model('Settings', SettingsSchema); 