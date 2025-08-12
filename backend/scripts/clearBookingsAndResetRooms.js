const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Import models
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Review = require('../models/Review');

// Connect to MongoDB using the same connection as the main app
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const clearBookingsAndResetRooms = async () => {
  try {
    console.log('🔄 Starting database cleanup...');

    // 1. Clear all bookings
    console.log('🗑️  Clearing all bookings...');
    const bookingResult = await Booking.deleteMany({});
    console.log(`✅ Deleted ${bookingResult.deletedCount} bookings`);

    // 2. Clear all reviews
    console.log('🗑️  Clearing all reviews...');
    const reviewResult = await Review.deleteMany({});
    console.log(`✅ Deleted ${reviewResult.deletedCount} reviews`);

    // 3. Reset all rooms to available status
    console.log('🔄 Resetting all rooms to available status...');
    const roomUpdateResult = await Room.updateMany(
      {}, // Update all rooms
      {
        $set: {
          status: 'Available',
          cleaningEndTime: null,
          lastBookingEnd: null,
          rating: 0,
          reviewCount: 0
        },
        $unset: {
          // Remove any booking-related fields that might exist
          currentBooking: 1,
          occupiedBy: 1
        }
      }
    );
    console.log(`✅ Updated ${roomUpdateResult.modifiedCount} rooms`);

    // 4. Display current room status
    console.log('\n📊 Current room status:');
    const rooms = await Room.find({});
    rooms.forEach(room => {
      console.log(`   - ${room.name}: ${room.status} (${room.category})`);
    });

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('🎯 All rooms are now available for booking.');

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

// Run the script
clearBookingsAndResetRooms(); 