const { sendReviewInvitation } = require('./utils/emailService');

// Test data
const testBooking = {
  _id: 'test_booking_deployment_123',
  customerName: 'Test Customer',
  customerEmail: 'keerthiganthevarasa@gmail.com',
  checkIn: new Date('2025-01-15'),
  checkOut: new Date('2025-01-17')
};

const testRoom = {
  _id: 'test_room_deployment_123',
  name: 'Test Room 101'
};

async function testDeploymentEmail() {
  console.log('🧪 Testing Email Service in Deployment Environment...\n');
  
  console.log('📧 Environment Variables Check:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || 587);
  console.log('SMTP_USER:', process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:8082');
  console.log('');

  try {
    console.log('📧 Testing review invitation email...');
    const result = await sendReviewInvitation(testBooking, testRoom);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.result.messageId);
      console.log('📧 Response:', result.result.response);
      console.log('📧 Review Token:', result.reviewToken);
      return { success: true, messageId: result.result.messageId };
    } else {
      console.log('❌ Email failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testDeploymentEmail()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Email system is working correctly in deployment!');
      process.exit(0);
    } else {
      console.log('\n💥 Email system test failed in deployment!');
      console.log('💥 Error:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
