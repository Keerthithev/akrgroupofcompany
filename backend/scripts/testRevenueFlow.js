const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// Import models
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testRevenueFlow() {
  try {
    console.log('🧪 Testing Revenue Flow...\n');

    // Get all bookings
    const bookings = await Booking.find({}).populate('room');
    console.log(`📋 Found ${bookings.length} total bookings`);

    // Test 1: Check booking statuses and payment statuses
    console.log('\n🔍 Test 1: Booking Statuses and Payment Statuses');
    const statusCounts = {};
    const paymentStatusCounts = {};
    
    bookings.forEach(booking => {
      // Count statuses
      statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
      
      // Count payment statuses
      paymentStatusCounts[booking.paymentStatus] = (paymentStatusCounts[booking.paymentStatus] || 0) + 1;
      
      console.log(`  - ${booking.customerName}: Status=${booking.status}, PaymentStatus=${booking.paymentStatus}, Amount=${booking.totalAmount}`);
    });

    console.log('\n📊 Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count} bookings`);
    });

    console.log('\n💰 Payment Status Summary:');
    Object.entries(paymentStatusCounts).forEach(([paymentStatus, count]) => {
      console.log(`  - ${paymentStatus}: ${count} bookings`);
    });

    // Test 2: Calculate Upcoming Revenue (Confirmed + paymentStatus !== 'paid')
    console.log('\n🔍 Test 2: Upcoming Revenue Calculation');
    const upcomingBookings = bookings.filter(b => {
      if (b.status === 'Confirmed') {
        if (!b.paymentStatus) return true;
        return b.paymentStatus !== 'paid';
      }
      return false;
    });

    const upcomingRevenue = upcomingBookings.reduce((sum, b) => {
      const baseAmount = b.totalAmount || 0;
      const discountAmount = b.discountAmount || 0;
      return sum + (baseAmount - discountAmount);
    }, 0);

    console.log(`  - Upcoming bookings: ${upcomingBookings.length}`);
    upcomingBookings.forEach(b => {
      const amount = (b.totalAmount || 0) - (b.discountAmount || 0);
      console.log(`    - ${b.customerName}: ${amount} (paymentStatus: ${b.paymentStatus})`);
    });
    console.log(`  - Total upcoming revenue: ${upcomingRevenue}`);

    // Test 3: Calculate Collected Revenue (Confirmed + paymentStatus === 'paid')
    console.log('\n🔍 Test 3: Collected Revenue Calculation');
    const collectedBookings = bookings.filter(b => b.status === 'Confirmed' && b.paymentStatus === 'paid');
    
    const collectedRevenue = collectedBookings.reduce((sum, b) => {
      const finalAmount = b.finalAmount || (b.totalAmount - (b.discountAmount || 0));
      return sum + finalAmount;
    }, 0);

    console.log(`  - Collected bookings: ${collectedBookings.length}`);
    collectedBookings.forEach(b => {
      const amount = b.finalAmount || (b.totalAmount - (b.discountAmount || 0));
      console.log(`    - ${b.customerName}: ${amount} (paymentStatus: ${b.paymentStatus})`);
    });
    console.log(`  - Total collected revenue: ${collectedRevenue}`);

    // Test 4: Revenue Flow Summary
    console.log('\n🎯 Revenue Flow Summary:');
    console.log(`  - Total Bookings: ${bookings.length}`);
    console.log(`  - Confirmed Bookings: ${bookings.filter(b => b.status === 'Confirmed').length}`);
    console.log(`  - Pending Bookings: ${bookings.filter(b => b.status === 'Pending').length}`);
    console.log(`  - Upcoming Revenue: ${upcomingRevenue}`);
    console.log(`  - Collected Revenue: ${collectedRevenue}`);
    console.log(`  - Total Revenue: ${upcomingRevenue + collectedRevenue}`);

    // Test 5: Verify Revenue Flow Logic
    console.log('\n🔍 Test 5: Revenue Flow Logic Verification');
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
    console.log(`  - Confirmed bookings: ${confirmedBookings.length}`);
    
    const shouldBeUpcoming = confirmedBookings.filter(b => !b.paymentStatus || b.paymentStatus !== 'paid');
    const shouldBeCollected = confirmedBookings.filter(b => b.paymentStatus === 'paid');
    
    console.log(`  - Should be in Upcoming: ${shouldBeUpcoming.length}`);
    console.log(`  - Should be in Collected: ${shouldBeCollected.length}`);
    
    if (shouldBeUpcoming.length === upcomingBookings.length && shouldBeCollected.length === collectedBookings.length) {
      console.log('  ✅ Revenue flow logic is working correctly!');
    } else {
      console.log('  ❌ Revenue flow logic has issues!');
    }

    console.log('\n🎉 Revenue Flow Test Completed!');

  } catch (error) {
    console.error('❌ Error testing revenue flow:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testRevenueFlow(); 