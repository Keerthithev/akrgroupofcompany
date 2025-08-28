const nodemailer = require('nodemailer');

// Email configuration with fallbacks
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
    pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || 'rvnh sfki ilmg qizs'
  },
  // Additional settings for better reliability
  tls: {
    rejectUnauthorized: false
  },
  // Connection timeout
  connectionTimeout: 60000,
  // Greeting timeout
  greetingTimeout: 30000,
  // Socket timeout
  socketTimeout: 60000
};

// Create transporter with error handling
const createTransporter = () => {
  try {
    console.log('📧 Creating email transporter...');
    console.log('📧 SMTP Host:', emailConfig.host);
    console.log('📧 SMTP Port:', emailConfig.port);
    console.log('📧 SMTP User:', emailConfig.auth.user);
    console.log('📧 SMTP Pass configured:', !!emailConfig.auth.pass);
    
    const transporter = nodemailer.createTransporter(emailConfig);
    
    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error);
      } else {
        console.log('✅ Email transporter is ready to send messages');
      }
    });
    
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    return null;
  }
};

// Test email functionality
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, error: 'Failed to create transporter' };
    }
    
    const testMailOptions = {
      from: `"AKR Hotel Test" <${emailConfig.auth.user}>`,
      to: emailConfig.auth.user, // Send to self for testing
      subject: 'Email Test - AKR Hotel System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Email Test Successful!</h2>
          <p>This is a test email to verify that the email system is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return { success: false, error: error.message };
  }
};

// Send email with retry logic
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Attempting to send email (attempt ${attempt}/${maxRetries})...`);
      
      const transporter = createTransporter();
      if (!transporter) {
        throw new Error('Failed to create email transporter');
      }
      
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully on attempt ${attempt}:`, result.messageId);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('❌ All email attempts failed');
        return { success: false, error: error.message };
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

module.exports = {
  createTransporter,
  testEmailConnection,
  sendEmailWithRetry,
  emailConfig
}; 