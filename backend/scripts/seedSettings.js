require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Settings = require('../models/Settings');

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const doc = {
    banners: [],
    services: [
      { name: 'Shopping', description: 'A world-class shopping experience.', images: [] },
      { name: 'Hotel & Room Booking', description: 'Book luxury rooms and suites.', images: [] },
      { name: 'Gym', description: 'State-of-the-art fitness center.', images: [] },
      { name: 'Theatre', description: 'Enjoy the latest movies and shows.', images: [] },
      { name: 'Party Hall', description: 'Perfect venue for your celebrations.', images: [] },
      { name: 'Service Center', description: 'Expert maintenance and support.', images: [] },
    ],
    contact: {
      phone: '0773111266',
      email: 'akrfuture@gmail.com',
      address: 'Main street Murunkan, Mannar',
    },
    homepageText: 'Welcome to AKR Multi Complex',
    hotelSection: {
      heading: 'Premium Rooms For Every Stay',
      subheading: 'Experience the perfect blend of comfort, luxury, and convenience with our curated collection of rooms. From cozy single rooms to spacious family suites, all located on the second floor with modern amenities.',
      headingColor: '#1f2937',
      subheadingColor: '#6b7280',
      images: ['/images/hotel.jpg'],
      amenities: ['WiFi', 'AC', 'TV', 'Room Service', 'Free Breakfast', '24/7 Support'],
      specialOffer: 'Book 3 nights, get 1 night free!',
      specialOfferLink: '/hotel'
    }
  };
  await Settings.deleteMany({});
  await Settings.create(doc);
  console.log('Settings seeded!');
  mongoose.disconnect();
}

main(); 