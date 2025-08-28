const axios = require('axios');

const API_BASE = 'https://akrgroupofcompany-bjvw.onrender.com/api';

async function testBookingFlow() {
  console.log('🧪 Testing Complete Booking Flow...\n');
  
  try {
    // Step 1: Get available rooms
    console.log('1️⃣ Getting available rooms...');
    const roomsResponse = await axios.get(`${API_BASE}/rooms`);
    const rooms = roomsResponse.data;
    const testRoom = rooms[0]; // Use first available room
    console.log(`✅ Found room: ${testRoom.name} (ID: ${testRoom._id})`);
    
    // Step 2: Create a test booking
    console.log('\n2️⃣ Creating test booking...');
    const bookingData = {
      roomId: testRoom._id,
      checkIn: '2024-02-01',
      checkOut: '2024-02-02',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      guests: 2,
      nights: 1,
      totalAmount: testRoom.price,
      advancePaid: 0,
      customerName: 'Booking Flow Test User',
      customerEmail: 'keerthiganthevarasa@gmail.com',
      customerPhone: '0771234567',
      status: 'Pending',
      paymentStatus: 'pending'
    };
    
    const bookingResponse = await axios.post(`${API_BASE}/bookings`, bookingData);
    const booking = bookingResponse.data.booking;
    console.log(`✅ Booking created: ${booking._id}`);
    console.log(`   Customer: ${booking.customerName}`);
    console.log(`   Email: ${booking.customerEmail}`);
    console.log(`   Status: ${booking.status}`);
    
    // Step 3: Test "contact soon" email
    console.log('\n3️⃣ Testing "contact soon" email...');
    const contactSoonResponse = await axios.post(`${API_BASE}/bookings/send-contact-soon`, {
      bookingId: booking._id,
      customerEmail: booking.customerEmail,
      customerName: booking.customerName
    });
    console.log(`✅ Contact soon email: ${contactSoonResponse.data.message}`);
    
    // Step 4: Test confirmation email
    console.log('\n4️⃣ Testing confirmation email...');
    const confirmationResponse = await axios.post(`${API_BASE}/bookings/send-confirmation`, {
      bookingId: booking._id,
      customerEmail: booking.customerEmail,
      customerName: booking.customerName
    });
    console.log(`✅ Confirmation email: ${confirmationResponse.data.message}`);
    
    // Step 5: Test cancellation email
    console.log('\n5️⃣ Testing cancellation email...');
    const cancellationResponse = await axios.post(`${API_BASE}/bookings/send-cancellation`, {
      bookingId: booking._id,
      customerEmail: booking.customerEmail,
      customerName: booking.customerName
    });
    console.log(`✅ Cancellation email: ${cancellationResponse.data.message}`);
    
    console.log('\n🎉 Complete booking flow test successful!');
    console.log('\n📧 Email Summary:');
    console.log('   ✅ Admin notification email (sent during booking creation)');
    console.log('   ✅ Contact soon email (sent after booking creation)');
    console.log('   ✅ Confirmation email (sent when admin confirms)');
    console.log('   ✅ Cancellation email (sent when admin cancels)');
    
    return { success: true, bookingId: booking._id };
    
  } catch (error) {
    console.error('❌ Booking flow test failed:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
      console.error('   Status:', error.response.status);
    }
    return { success: false, error: error.message };
  }
}

// Run the test
testBookingFlow().then(result => {
  if (result.success) {
    console.log('\n✅ All tests passed! Booking flow is working correctly.');
    process.exit(0);
  } else {
    console.log('\n💥 Tests failed! Please check the errors above.');
    process.exit(1);
  }
}); 