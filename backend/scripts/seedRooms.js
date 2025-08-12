require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Room = require('../models/Room');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Clear existing rooms
    await Room.deleteMany({});
    
    const rooms = [
      {
        name: 'Economy Single Room',
        category: 'Economy',
        type: 'Single',
        beds: '1 single bed',
        maxGuests: 1,
        size: 20,
        description: 'Affordable and comfortable single room for budget travelers',
        images: [
          '/images/hotel.jpg',
          '/images/Hotel & Rooms.jpg',
          '/images/PHOTO-2025-07-15-21-49-15.jpg',
          '/images/PHOTO-2025-07-15-21-49-51.jpg'
        ],
        price: 2500,
        discountedPrice: 2000,
        breakfastIncluded: false,
        breakfastPrice: 300,
        cancellationPolicy: 'Free cancellation up to 12 hours before check-in',
        view: 'Garden',
        capacity: 1,
        amenities: ['WiFi', 'AC', 'TV'],
        isAvailable: true
      },
      {
        name: 'Economy Double Room',
        category: 'Economy',
        type: 'Double',
        beds: '1 double bed',
        maxGuests: 2,
        size: 25,
        description: 'Budget-friendly double room with essential amenities',
        images: [
          '/images/hotel.jpg',
          '/images/Hotel & Rooms.jpg',
          '/images/PHOTO-2025-07-15-21-49-15.jpg',
          '/images/PHOTO-2025-07-15-21-49-51.jpg'
        ],
        price: 3500,
        discountedPrice: 3000,
        breakfastIncluded: false,
        breakfastPrice: 300,
        cancellationPolicy: 'Free cancellation up to 12 hours before check-in',
        view: 'Garden',
        capacity: 2,
        amenities: ['WiFi', 'AC', 'TV'],
        isAvailable: true
      },
      {
        name: 'Business Twin Room',
        category: 'Business',
        type: 'Twin',
        beds: '2 single beds',
        maxGuests: 2,
        size: 30,
        description: 'Comfortable twin room perfect for business travelers',
        images: [
          '/images/hotel.jpg',
          '/images/Hotel & Rooms.jpg',
          '/images/PHOTO-2025-07-15-21-49-15.jpg',
          '/images/PHOTO-2025-07-15-21-49-51.jpg'
        ],
        price: 4500,
        discountedPrice: 4000,
        breakfastIncluded: false,
        breakfastPrice: 500,
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
        view: 'Garden',
        capacity: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Work Desk', 'Coffee Maker'],
        isAvailable: true
      },
      {
        name: 'Business Double Room',
        category: 'Business',
        type: 'Double',
        beds: '1 double bed',
        maxGuests: 2,
        size: 35,
        description: 'Spacious business room with modern amenities and city view',
        images: [
          '/images/hotel.jpg',
          '/images/Hotel & Rooms.jpg',
          '/images/PHOTO-2025-07-15-21-49-15.jpg',
          '/images/PHOTO-2025-07-15-21-49-51.jpg'
        ],
        price: 5000,
        discountedPrice: 4500,
        breakfastIncluded: true,
        breakfastPrice: 500,
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
        view: 'City',
        capacity: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Free Breakfast', 'Work Desk'],
        isAvailable: true
      },
      {
        name: 'First-Class Suite',
        category: 'First-Class',
        type: 'Suite',
        beds: '1 king bed + 1 sofa bed',
        maxGuests: 4,
        size: 50,
        description: 'Luxury suite with separate living area and premium amenities',
        images: [
          '/images/hotel.jpg',
          '/images/Hotel & Rooms.jpg',
          '/images/PHOTO-2025-07-15-21-49-15.jpg',
          '/images/PHOTO-2025-07-15-21-49-51.jpg'
        ],
        price: 8000,
        discountedPrice: 7200,
        breakfastIncluded: true,
        breakfastPrice: 0,
        cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
        view: 'City',
        capacity: 4,
        amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Free Breakfast', 'Living Room', 'Balcony', 'Premium Toiletries'],
        isAvailable: true
      },
      {
        name: 'First-Class Deluxe Room',
        category: 'First-Class',
        type: 'Double',
        beds: '1 king bed',
        maxGuests: 2,
        size: 40,
        description: 'Premium deluxe room with luxury amenities and stunning views',
        images: [
          '/images/hotel.jpg',
          '/images/Hotel & Rooms.jpg',
          '/images/PHOTO-2025-07-15-21-49-15.jpg',
          '/images/PHOTO-2025-07-15-21-49-51.jpg'
        ],
        price: 7000,
        discountedPrice: 6300,
        breakfastIncluded: true,
        breakfastPrice: 0,
        cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
        view: 'City',
        capacity: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Free Breakfast', 'Balcony', 'Premium Toiletries', 'Turn-down Service'],
        isAvailable: true
      }
    ];
    
    await Room.insertMany(rooms);
    console.log('Rooms seeded successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding rooms:', error);
    await mongoose.disconnect();
  }
}

main(); 