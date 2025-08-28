const nodemailer = require('nodemailer');

// Test all email types
async function testAllEmails() {
  console.log('🧪 Testing all email types...\n');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'keerthiganthevarasa@gmail.com',
      pass: 'rvnh sfki ilmg qizs'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  const testEmail = 'keerthiganthevarasa@gmail.com';
  
  // Test 1: Booking Confirmation Email
  console.log('1️⃣ Testing Booking Confirmation Email...');
  try {
    const confirmationMailOptions = {
      from: '"AKR Hotel" <keerthiganthevarasa@gmail.com>',
      to: testEmail,
      subject: 'Booking Confirmation - AKR Group Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Booking Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing AKR Group Hotel</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Booking Details</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">Room Information</h3>
              <p><strong>Room:</strong> Standard Room</p>
              <p><strong>Type:</strong> Double</p>
              <p><strong>Check-in:</strong> 20/01/2024</p>
              <p><strong>Check-out:</strong> 21/01/2024</p>
              <p><strong>Nights:</strong> 1</p>
              <p><strong>Guests:</strong> 2</p>
              <p><strong>Final Amount:</strong> Rs. 8,000</p>
            </div>
          </div>
        </div>
      `
    };
    
    const result1 = await transporter.sendMail(confirmationMailOptions);
    console.log('✅ Booking confirmation email sent:', result1.messageId);
  } catch (error) {
    console.log('❌ Booking confirmation email failed:', error.message);
  }
  
  // Test 2: Admin Notification Email
  console.log('\n2️⃣ Testing Admin Notification Email...');
  try {
    const adminMailOptions = {
      from: '"AKR Group Hotel" <keerthiganthevarasa@gmail.com>',
      to: testEmail,
      subject: '🔔 New Hotel Room Booking Request - AKR Group Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🆕 New Booking Request</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">A customer has requested to book a hotel room</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">📋 Booking Details</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #28a745; margin-top: 0;">🏨 Room Information</h3>
              <p><strong>Room:</strong> Standard Room</p>
              <p><strong>Type:</strong> Double</p>
              <p><strong>Check-in:</strong> 20/01/2024</p>
              <p><strong>Check-out:</strong> 21/01/2024</p>
              <p><strong>Guests:</strong> 2</p>
              <p><strong>Total Amount:</strong> Rs. 8,000</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #6f42c1; margin-top: 0;">👤 Customer Information</h3>
              <p><strong>Name:</strong> Test Customer</p>
              <p><strong>Email:</strong> test@example.com</p>
              <p><strong>Phone:</strong> 0771234567</p>
            </div>
          </div>
        </div>
      `
    };
    
    const result2 = await transporter.sendMail(adminMailOptions);
    console.log('✅ Admin notification email sent:', result2.messageId);
  } catch (error) {
    console.log('❌ Admin notification email failed:', error.message);
  }
  
  // Test 3: Cancellation Email
  console.log('\n3️⃣ Testing Cancellation Email...');
  try {
    const cancellationMailOptions = {
      from: '"AKR Group Hotel" <keerthiganthevarasa@gmail.com>',
      to: testEmail,
      subject: 'Booking Cancellation - AKR Group Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Booking Cancelled</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your booking has been cancelled</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Cancellation Details</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Booking ID:</strong> BK123456789</p>
              <p><strong>Room:</strong> Standard Room</p>
              <p><strong>Check-in:</strong> 20/01/2024</p>
              <p><strong>Check-out:</strong> 21/01/2024</p>
              <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      `
    };
    
    const result3 = await transporter.sendMail(cancellationMailOptions);
    console.log('✅ Cancellation email sent:', result3.messageId);
  } catch (error) {
    console.log('❌ Cancellation email failed:', error.message);
  }
  
  console.log('\n🎉 Email testing completed!');
}

// Run the test
testAllEmails().then(() => {
  console.log('✅ All email tests finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Email testing failed:', error);
  process.exit(1);
}); 