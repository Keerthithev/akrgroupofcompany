const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'https://akrgroupofcompany.onrender.com';

async function testEmailSystem() {
  console.log('🧪 Testing AKR Group Hotel Email System...\n');

  try {
    // Test 1: Test Email Functionality
    console.log('1️⃣ Testing basic email functionality...');
    const testEmailResponse = await axios.post(`${API_BASE_URL}/api/bookings/test-email`, {
      emailType: 'System Test',
      testEmail: 'keerthiganthevarasa@gmail.com'
    });
    console.log('✅ Test email sent successfully:', testEmailResponse.data.message);
    console.log('📧 Message ID:', testEmailResponse.data.messageId);
    console.log('');

    // Test 2: Test "We will contact soon" email
    console.log('2️⃣ Testing "We will contact soon" email...');
    const contactSoonResponse = await axios.post(`${API_BASE_URL}/api/bookings/send-contact-soon`, {
      bookingId: '507f1f77bcf86cd799439011', // Test booking ID
      customerEmail: 'keerthiganthevarasa@gmail.com',
      customerName: 'Test Customer'
    });
    console.log('✅ Contact soon email sent successfully:', contactSoonResponse.data.message);
    console.log('');

    // Test 3: Test booking confirmation email
    console.log('3️⃣ Testing booking confirmation email...');
    const confirmationResponse = await axios.post(`${API_BASE_URL}/api/bookings/send-confirmation`, {
      bookingId: '507f1f77bcf86cd799439011', // Test booking ID
      customerEmail: 'keerthiganthevarasa@gmail.com',
      customerName: 'Test Customer'
    });
    console.log('✅ Booking confirmation email sent successfully:', confirmationResponse.data.message);
    console.log('');

    // Test 4: Test payment confirmation email
    console.log('4️⃣ Testing payment confirmation email...');
    const paymentResponse = await axios.post(`${API_BASE_URL}/api/bookings/send-payment-confirmation`, {
      bookingId: '507f1f77bcf86cd799439011', // Test booking ID
      customerEmail: 'keerthiganthevarasa@gmail.com',
      customerName: 'Test Customer',
      paymentAmount: 5000
    });
    console.log('✅ Payment confirmation email sent successfully:', paymentResponse.data.message);
    console.log('');

    console.log('🎉 All email tests completed successfully!');
    console.log('📧 Check your email inbox for test messages.');
    console.log('📋 Email types tested:');
    console.log('   - System test email');
    console.log('   - "We will contact soon" email');
    console.log('   - Booking confirmation email');
    console.log('   - Payment confirmation email');

  } catch (error) {
    console.error('❌ Email test failed:', error.response?.data || error.message);
    console.error('🔍 Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

// Run the test
testEmailSystem(); 