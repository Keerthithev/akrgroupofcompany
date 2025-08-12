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

async function resetRoomStatus() {
  try {
    console.log('🔄 Resetting Room Statuses...\n');

    // Get all rooms
    const rooms = await Room.find({});
    console.log(`📋 Found ${rooms.length} rooms`);

    // Get all bookings
    const bookings = await Booking.find({}).populate('room');
    console.log(`📅 Found ${bookings.length} bookings`);

    // Check current date
    const now = new Date();
    console.log(`📅 Current date: ${now.toLocaleDateString()}`);

    // Reset all rooms to Available
    console.log('\n🔄 Resetting all rooms to Available status...');
    
    for (const room of rooms) {
      // Check if room has any current bookings
      const currentBookings = bookings.filter(b => 
        b.room._id.toString() === room._id.toString() &&
        b.status !== 'Cancelled' &&
        ['pending', 'paid'].includes(b.paymentStatus) &&
        new Date(b.checkIn) <= now && 
        new Date(b.checkOut) >= now
      );

      if (currentBookings.length > 0) {
        console.log(`  ⚠️  Room ${room.name} has current bookings, keeping as Occupied`);
        await Room.findByIdAndUpdate(room._id, {
          status: 'Occupied',
          isAvailable: false
        });
      } else {
        console.log(`  ✅ Room ${room.name} has no current bookings, setting to Available`);
        await Room.findByIdAndUpdate(room._id, {
          status: 'Available',
          isAvailable: true
        });
      }
    }

    // Verify the changes
    console.log('\n🔍 Verifying room statuses after reset:');
    const updatedRooms = await Room.find({});
    
    updatedRooms.forEach(room => {
      console.log(`  - ${room.name}: Status=${room.status}, Available=${room.isAvailable}`);
    });

    console.log('\n🎉 Room status reset completed!');
    console.log(`  - Total rooms: ${updatedRooms.length}`);
    console.log(`  - Available rooms: ${updatedRooms.filter(r => r.status === 'Available').length}`);
    console.log(`  - Occupied rooms: ${updatedRooms.filter(r => r.status === 'Occupied').length}`);

  } catch (error) {
    console.error('❌ Error resetting room status:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the reset
resetRoomStatus(); 