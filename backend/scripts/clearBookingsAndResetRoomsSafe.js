const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config({ path: './.env' });

// Import models
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Review = require('../models/Review');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB using the same connection as the main app
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const clearBookingsAndResetRooms = async () => {
  try {
    console.log('⚠️  WARNING: This will permanently delete ALL booking and review data!');
    console.log('📊 Current database status:');
    
    // Show current data counts
    const bookingCount = await Booking.countDocuments();
    const reviewCount = await Review.countDocuments();
    const roomCount = await Room.countDocuments();
    
    console.log(`   - Total Bookings: ${bookingCount}`);
    console.log(`   - Total Reviews: ${reviewCount}`);
    console.log(`   - Total Rooms: ${roomCount}`);
    
    // Show room status
    const rooms = await Room.find({});
    console.log('\n🏨 Current room status:');
    rooms.forEach(room => {
      console.log(`   - ${room.name}: ${room.status} (${room.category})`);
    });

    // Ask for confirmation
    rl.question('\n❓ Are you sure you want to proceed? Type "YES" to confirm: ', async (answer) => {
      if (answer === 'YES') {
        console.log('\n🔄 Starting database cleanup...');

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

        // 4. Display final room status
        console.log('\n📊 Final room status:');
        const updatedRooms = await Room.find({});
        updatedRooms.forEach(room => {
          console.log(`   - ${room.name}: ${room.status} (${room.category})`);
        });

        console.log('\n✅ Database cleanup completed successfully!');
        console.log('🎯 All rooms are now available for booking.');
        console.log('💰 All revenue data has been cleared.');
        console.log('📝 All reviews have been removed.');

      } else {
        console.log('❌ Operation cancelled by user.');
      }
      
      // Close the database connection and readline interface
      await mongoose.connection.close();
      rl.close();
      console.log('🔌 Database connection closed.');
    });

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    await mongoose.connection.close();
    rl.close();
  }
};

// Run the script
clearBookingsAndResetRooms(); 