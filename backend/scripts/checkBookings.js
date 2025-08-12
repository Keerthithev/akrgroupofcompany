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

async function checkBookings() {
  try {
    console.log('🔍 Checking Booking Data...\n');

    // Get all bookings
    const bookings = await Booking.find({});
    console.log(`📅 Found ${bookings.length} bookings:`);
    
    bookings.forEach((booking, index) => {
      console.log(`\nBooking ${index + 1}:`);
      console.log(`  ID: ${booking._id}`);
      console.log(`  Room: ${booking.room}`);
      console.log(`  Check-in: ${booking.checkIn}`);
      console.log(`  Check-out: ${booking.checkOut}`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  Payment Status: ${booking.paymentStatus}`);
      console.log(`  Customer: ${booking.customerName}`);
    });

    // Check specific room bookings
    const roomId = '689992d4c1a61e6810393555'; // Business Double Room
    console.log(`\n🔍 Checking bookings for room ${roomId}:`);
    
    const roomBookings = await Booking.find({ 
      room: roomId,
      status: { $nin: ['Cancelled'] },
      paymentStatus: { $in: ['pending', 'paid'] }
    });
    
    console.log(`Found ${roomBookings.length} active bookings for this room:`);
    roomBookings.forEach((booking, index) => {
      console.log(`\n  Booking ${index + 1}:`);
      console.log(`    Check-in: ${booking.checkIn}`);
      console.log(`    Check-out: ${booking.checkOut}`);
      console.log(`    Status: ${booking.status}`);
      console.log(`    Payment Status: ${booking.paymentStatus}`);
    });

    // Generate unavailable dates manually
    console.log(`\n📅 Generating unavailable dates manually:`);
    const unavailableDates = [];
    
    roomBookings.forEach(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      
      console.log(`\n  Processing booking: ${checkIn.toDateString()} to ${checkOut.toDateString()}`);
      
      // Add all dates between check-in and check-out (including check-in, excluding check-out)
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        const dateString = currentDate.toISOString().split('T')[0];
        unavailableDates.push(dateString);
        console.log(`    Added: ${dateString}`);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    console.log(`\n📋 Final unavailable dates:`, unavailableDates);

  } catch (error) {
    console.error('❌ Error checking bookings:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkBookings(); 