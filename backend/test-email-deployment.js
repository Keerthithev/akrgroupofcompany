const nodemailer = require('nodemailer');

// Test email configuration with environment variables
const testEmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
    pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
  },
  tls: {
    rejectUnauthorized: false
  }
};

async function testEmailDeployment() {
  console.log('🧪 Testing Email Configuration for Deployment...\n');
  
  console.log('📧 Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || 587);
  console.log('SMTP_USER:', process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:8082');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('');

  try {
    console.log('📧 Creating email transporter...');
    const transporter = nodemailer.createTransport(testEmailConfig);
    
    console.log('📧 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email transporter is ready!');
    
    console.log('📧 Sending test email...');
    const testMailOptions = {
      from: `"AKR Hotel Test" <${testEmailConfig.auth.user}>`,
      to: testEmailConfig.auth.user, // Send to self for testing
      subject: 'Test Email - AKR Hotel System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>✅ Email Test Successful!</h2>
          <p>This is a test email to verify that the email system is working correctly in the deployment environment.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>SMTP Host:</strong> ${testEmailConfig.host}</p>
          <p><strong>SMTP Port:</strong> ${testEmailConfig.port}</p>
          <p><strong>SMTP User:</strong> ${testEmailConfig.auth.user}</p>
          <p><strong>Frontend URL:</strong> ${process.env.FRONTEND_URL || 'http://localhost:8082'}</p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error details:', error);
    
    return { success: false, error: error.message };
  }
}

// Run the test
testEmailDeployment()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Email system is working correctly!');
      process.exit(0);
    } else {
      console.log('\n💥 Email system test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
