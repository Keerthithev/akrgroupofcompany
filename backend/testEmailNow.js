const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    console.log('🧪 Testing email functionality...');
    
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
    
    console.log('📧 Creating transporter...');
    
    // Verify connection
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Transporter verification failed:', error);
          reject(error);
        } else {
          console.log('✅ Transporter is ready to send messages');
          resolve();
        }
      });
    });
    
    const testMailOptions = {
      from: '"AKR Hotel Test" <keerthiganthevarasa@gmail.com>',
      to: 'keerthiganthevarasa@gmail.com', // Send to self for testing
      subject: 'Test Email - AKR Hotel System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Test Email from AKR Hotel</h2>
          <p>This is a test email to verify that the email system is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> Production</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email. Please ignore if you received this by mistake.
          </p>
        </div>
      `
    };
    
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully:', result.messageId);
    
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testEmail().then(result => {
  if (result.success) {
    console.log('🎉 Email test completed successfully!');
    process.exit(0);
  } else {
    console.log('💥 Email test failed!');
    process.exit(1);
  }
}); 