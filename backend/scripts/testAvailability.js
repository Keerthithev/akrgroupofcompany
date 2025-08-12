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

async function testAvailability() {
  try {
    console.log('🧪 Testing Availability Checker...\n');

    // Get all rooms
    const rooms = await Room.find({});
    console.log(`📋 Found ${rooms.length} rooms`);

    // Get all bookings
    const bookings = await Booking.find({}).populate('room');
    console.log(`📅 Found ${bookings.length} bookings`);

    // Test availability for different date ranges
    const testDates = [
      {
        name: 'Past Dates (should be available)',
        checkIn: '2024-01-01',
        checkOut: '2024-01-03'
      },
      {
        name: 'Current Booking Dates (should be unavailable)',
        checkIn: '2025-08-10',
        checkOut: '2025-08-12'
      },
      {
        name: 'Future Dates (should be available)',
        checkIn: '2025-12-15',
        checkOut: '2025-12-17'
      },
      {
        name: 'Overlapping Dates (should be unavailable)',
        checkIn: '2025-08-11',
        checkOut: '2025-08-13'
      }
    ];

    for (const testDate of testDates) {
      console.log(`\n🔍 Testing: ${testDate.name}`);
      console.log(`   Dates: ${testDate.checkIn} to ${testDate.checkOut}`);
      
      for (const room of rooms) {
        try {
          // Get unavailable dates for this room
          const unavailableResponse = await fetch(`http://localhost:5050/api/bookings/unavailable-dates/${room._id}`);
          const unavailableData = await unavailableResponse.json();
          const unavailableDates = unavailableData.unavailableDates || [];
          
          // Check if selected dates overlap with unavailable dates
          const checkIn = new Date(testDate.checkIn);
          const checkOut = new Date(testDate.checkOut);
          let isAvailable = true;
          let conflictDetails = null;
          
          // Check each date in the range
          const currentDate = new Date(checkIn);
          while (currentDate < checkOut) {
            const dateString = currentDate.toISOString().split('T')[0];
            if (unavailableDates.includes(dateString)) {
              isAvailable = false;
              conflictDetails = `Room is booked on ${dateString}`;
              break;
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          console.log(`   ${room.name}: ${isAvailable ? '✅ Available' : '❌ Not Available'} ${conflictDetails ? `(${conflictDetails})` : ''}`);
          
        } catch (error) {
          console.log(`   ${room.name}: ❌ Error checking availability`);
        }
      }
    }

    console.log('\n🎯 Availability Test Summary:');
    console.log('✅ Past dates should be available (no conflicts)');
    console.log('❌ Current booking dates should be unavailable (conflicts)');
    console.log('✅ Future dates should be available (no conflicts)');
    console.log('❌ Overlapping dates should be unavailable (conflicts)');

  } catch (error) {
    console.error('❌ Error testing availability:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testAvailability(); 