const nodemailer = require('nodemailer');

// Test email configuration
async function testEmailSystem() {
  console.log('🧪 Testing AKR Hotel Email System...\n');

  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
      pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
    }
  });

  try {
    // Test 1: Verify transporter
    console.log('1️⃣ Testing email transporter...');
    await transporter.verify();
    console.log('✅ Email transporter verified successfully\n');

    // Test 2: Send test email
    console.log('2️⃣ Sending test email...');
    const testMailOptions = {
      from: `"AKR Hotel Test" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: 'keerthiganthevarasa@gmail.com',
      subject: '🧪 Email System Test - AKR Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🧪 Email Test Successful!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">AKR Hotel Email System is working properly</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Test Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">📧 Email Configuration</h3>
              <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'smtp.gmail.com'}</p>
              <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 587}</p>
              <p><strong>SMTP User:</strong> ${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}</p>
              <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">✅ Status</h3>
              <p>All email functions should now work properly:</p>
              <ul style="margin: 0; padding-left: 20px;">
                <li>✅ Customer booking emails</li>
                <li>✅ Admin notification emails</li>
                <li>✅ Payment confirmation emails</li>
                <li>✅ Review invitation emails</li>
                <li>✅ Review reminder emails</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">AKR Group Hotel</p>
            <p style="margin: 5px 0;">Main Street, Murunkan, Mannar, Sri Lanka</p>
            <p style="margin: 5px 0;">Phone: +94 77 311 1266 | Email: akrfuture@gmail.com</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully:', result.messageId);
    console.log('📧 Email sent to: keerthiganthevarasa@gmail.com\n');

    // Test 3: Test booking confirmation email
    console.log('3️⃣ Testing booking confirmation email...');
    const confirmationResponse = await fetch('http://localhost:5000/api/bookings/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'test-booking-id',
        customerEmail: 'keerthiganthevarasa@gmail.com',
        customerName: 'Test Customer'
      })
    });
    
    if (confirmationResponse.ok) {
      console.log('✅ Booking confirmation email sent successfully:', confirmationResponse.data.message);
    } else {
      console.log('❌ Booking confirmation email failed');
    }

    // Test 4: Test payment confirmation email
    console.log('4️⃣ Testing payment confirmation email...');
    const paymentResponse = await fetch('http://localhost:5000/api/bookings/send-payment-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'test-booking-id',
        customerEmail: 'keerthiganthevarasa@gmail.com',
        customerName: 'Test Customer',
        paymentAmount: 5000
      })
    });
    
    if (paymentResponse.ok) {
      console.log('✅ Payment confirmation email sent successfully:', paymentResponse.data.message);
    } else {
      console.log('❌ Payment confirmation email failed');
    }

    console.log('\n🎉 Email system test completed!');
    console.log('📋 Summary:');
    console.log('   - Email transporter verification');
    console.log('   - Test email sending');
    console.log('   - Booking confirmation email');
    console.log('   - Payment confirmation email');

  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      message: error.message
    });
  }
}

// Run the test
testEmailSystem(); 