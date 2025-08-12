const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// Import models
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkRoomStatus() {
  try {
    console.log('🔍 Checking Room Statuses...\n');

    // Get all rooms
    const rooms = await Room.find({});
    console.log(`📋 Found ${rooms.length} rooms:`);
    
    rooms.forEach(room => {
      console.log(`  - ${room.name}: Status=${room.status}, Available=${room.isAvailable}`);
    });

    // Get all bookings
    const bookings = await Booking.find({}).populate('room');
    console.log(`\n📅 Found ${bookings.length} bookings:`);
    
    bookings.forEach(booking => {
      console.log(`  - ${booking.customerName}: ${booking.room?.name} | ${new Date(booking.checkIn).toLocaleDateString()} to ${new Date(booking.checkOut).toLocaleDateString()} | Status=${booking.status} | PaymentStatus=${booking.paymentStatus}`);
    });

    // Check for rooms that are marked as Occupied but shouldn't be
    console.log('\n🔍 Checking for incorrectly occupied rooms:');
    const now = new Date();
    
    for (const room of rooms) {
      if (room.status === 'Occupied') {
        // Find current or future bookings for this room
        const currentBookings = bookings.filter(b => 
          b.room._id.toString() === room._id.toString() &&
          b.status !== 'Cancelled' &&
          ['pending', 'paid'].includes(b.paymentStatus) &&
          new Date(b.checkIn) <= now && 
          new Date(b.checkOut) >= now
        );
        
        if (currentBookings.length === 0) {
          console.log(`  ⚠️  Room ${room.name} is marked as Occupied but has no current bookings`);
          console.log(`     Should be marked as Available`);
        } else {
          console.log(`  ✅ Room ${room.name} is correctly marked as Occupied (has current booking)`);
        }
      }
    }

    // Check for rooms that should be available for future bookings
    console.log('\n🔍 Checking rooms available for future bookings:');
    for (const room of rooms) {
      if (room.status === 'Available') {
        console.log(`  ✅ Room ${room.name} is available for future bookings`);
      } else {
        console.log(`  ❌ Room ${room.name} is NOT available (status: ${room.status})`);
      }
    }

    console.log('\n🎯 Summary:');
    console.log(`  - Total Rooms: ${rooms.length}`);
    console.log(`  - Available Rooms: ${rooms.filter(r => r.status === 'Available').length}`);
    console.log(`  - Occupied Rooms: ${rooms.filter(r => r.status === 'Occupied').length}`);
    console.log(`  - Total Bookings: ${bookings.length}`);

  } catch (error) {
    console.error('❌ Error checking room status:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkRoomStatus(); 