const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config({ path: './.env' });

// Import models
const Room = require('../models/Room');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testFutureBooking() {
  try {
    console.log('🧪 Testing Future Booking...\n');

    // Get all rooms
    const rooms = await Room.find({});
    console.log(`📋 Found ${rooms.length} rooms:`);
    
    rooms.forEach(room => {
      console.log(`  - ${room.name}: Status=${room.status}, Available=${room.isAvailable}`);
    });

    // Test booking for a future date
    const testRoom = rooms[0]; // Use first room
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    const futureDateEnd = new Date(futureDate);
    futureDateEnd.setDate(futureDateEnd.getDate() + 2); // 2 days later

    console.log(`\n📅 Testing booking for future dates:`);
    console.log(`  - Room: ${testRoom.name}`);
    console.log(`  - Check-in: ${futureDate.toLocaleDateString()}`);
    console.log(`  - Check-out: ${futureDateEnd.toLocaleDateString()}`);

    // Test the booking API
    const bookingData = {
      roomId: testRoom._id,
      checkIn: futureDate.toISOString().split('T')[0],
      checkOut: futureDateEnd.toISOString().split('T')[0],
      checkInTime: '14:00',
      checkOutTime: '11:00',
      guests: 2,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890'
    };

    console.log('\n📤 Sending booking request...');
    
    try {
      const response = await axios.post('http://localhost:5050/api/bookings', bookingData);
      console.log('✅ Booking created successfully!');
      console.log('📋 Booking details:', response.data);
    } catch (error) {
      console.log('❌ Booking failed:');
      if (error.response) {
        console.log('  Error:', error.response.data.error);
        console.log('  Status:', error.response.status);
      } else {
        console.log('  Error:', error.message);
      }
    }

    // Test unavailable dates endpoint
    console.log('\n🔍 Testing unavailable dates endpoint...');
    try {
      const unavailableResponse = await axios.get(`http://localhost:5050/api/bookings/unavailable-dates/${testRoom._id}`);
      console.log('✅ Unavailable dates retrieved successfully!');
      console.log('📅 Unavailable dates:', unavailableResponse.data.unavailableDates);
    } catch (error) {
      console.log('❌ Failed to get unavailable dates:');
      if (error.response) {
        console.log('  Error:', error.response.data.error);
      } else {
        console.log('  Error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error testing future booking:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testFutureBooking(); 