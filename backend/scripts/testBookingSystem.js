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

async function testBookingSystem() {
  try {
    console.log('🧪 Testing Booking System...\n');

    // Get all rooms
    const rooms = await Room.find({});
    console.log(`📋 Found ${rooms.length} rooms:`);
    rooms.forEach(room => {
      console.log(`  - ${room.name}: ${room.status} (${room.isAvailable ? 'Available' : 'Not Available'})`);
    });

    // Get all bookings
    const bookings = await Booking.find({}).populate('room');
    console.log(`\n📅 Found ${bookings.length} bookings:`);
    bookings.forEach(booking => {
      console.log(`  - ${booking.room?.name}: ${booking.checkIn.toDateString()} to ${booking.checkOut.toDateString()} (${booking.status})`);
    });

    // Test 1: Check if rooms are properly marked as occupied
    console.log('\n🔍 Test 1: Room Status Check');
    const occupiedRooms = rooms.filter(room => room.status === 'Occupied');
    const availableRooms = rooms.filter(room => room.status === 'Available');
    console.log(`  - Occupied rooms: ${occupiedRooms.length}`);
    console.log(`  - Available rooms: ${availableRooms.length}`);

    // Test 2: Check for overlapping bookings
    console.log('\n🔍 Test 2: Overlapping Bookings Check');
    let hasOverlaps = false;
    for (const room of rooms) {
      const roomBookings = bookings.filter(b => b.room._id.toString() === room._id.toString());
      
      for (let i = 0; i < roomBookings.length; i++) {
        for (let j = i + 1; j < roomBookings.length; j++) {
          const booking1 = roomBookings[i];
          const booking2 = roomBookings[j];
          
          // Check for overlap
          if (booking1.checkIn < booking2.checkOut && booking2.checkIn < booking1.checkOut) {
            console.log(`  ❌ OVERLAP FOUND: ${room.name}`);
            console.log(`     Booking 1: ${booking1.checkIn.toDateString()} - ${booking1.checkOut.toDateString()}`);
            console.log(`     Booking 2: ${booking2.checkIn.toDateString()} - ${booking2.checkOut.toDateString()}`);
            hasOverlaps = true;
          }
        }
      }
    }
    
    if (!hasOverlaps) {
      console.log('  ✅ No overlapping bookings found');
    }

    // Test 3: Check room availability consistency
    console.log('\n🔍 Test 3: Room Availability Consistency');
    let inconsistencies = 0;
    for (const room of rooms) {
      const activeBookings = bookings.filter(b => 
        b.room._id.toString() === room._id.toString() && 
        b.status !== 'Cancelled' &&
        ['pending', 'paid'].includes(b.paymentStatus)
      );
      
      if (activeBookings.length > 0 && room.status === 'Available') {
        console.log(`  ⚠️  Inconsistency: ${room.name} has ${activeBookings.length} active bookings but status is 'Available'`);
        inconsistencies++;
      } else if (activeBookings.length === 0 && room.status === 'Occupied') {
        console.log(`  ⚠️  Inconsistency: ${room.name} has no active bookings but status is 'Occupied'`);
        inconsistencies++;
      }
    }
    
    if (inconsistencies === 0) {
      console.log('  ✅ All room statuses are consistent with bookings');
    }

    // Test 4: Check booking data integrity
    console.log('\n🔍 Test 4: Booking Data Integrity');
    let dataIssues = 0;
    for (const booking of bookings) {
      if (!booking.room) {
        console.log(`  ❌ Booking ${booking._id} has no room reference`);
        dataIssues++;
      }
      if (!booking.checkIn || !booking.checkOut) {
        console.log(`  ❌ Booking ${booking._id} has missing dates`);
        dataIssues++;
      }
      if (booking.checkIn >= booking.checkOut) {
        console.log(`  ❌ Booking ${booking._id} has invalid date range`);
        dataIssues++;
      }
    }
    
    if (dataIssues === 0) {
      console.log('  ✅ All booking data is valid');
    }

    console.log('\n🎯 Booking System Test Summary:');
    console.log(`  - Total Rooms: ${rooms.length}`);
    console.log(`  - Total Bookings: ${bookings.length}`);
    console.log(`  - Available Rooms: ${availableRooms.length}`);
    console.log(`  - Occupied Rooms: ${occupiedRooms.length}`);
    console.log(`  - Overlapping Bookings: ${hasOverlaps ? 'YES (ISSUE)' : 'NO (GOOD)'}`);
    console.log(`  - Status Inconsistencies: ${inconsistencies}`);
    console.log(`  - Data Issues: ${dataIssues}`);

    if (hasOverlaps || inconsistencies > 0 || dataIssues > 0) {
      console.log('\n⚠️  Issues found in booking system!');
    } else {
      console.log('\n✅ Booking system is working correctly!');
    }

  } catch (error) {
    console.error('❌ Error testing booking system:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testBookingSystem(); 