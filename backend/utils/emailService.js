const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { sendReviewInvitation: resendSendReviewInvitation } = require('./emailServiceResend');
const { sendReviewInvitation: cloudSendReviewInvitation } = require('./emailServiceCloud');
const { sendReviewInvitation: alternativeSendReviewInvitation } = require('./emailServiceAlternative');

// Create transporter with production-ready configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
    pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
  },
  // Additional settings for better reliability in production
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  // Connection timeout - reduced for cloud environments
  connectionTimeout: 30000,
  // Greeting timeout
  greetingTimeout: 15000,
  // Socket timeout
  socketTimeout: 30000,
  // Debug mode for troubleshooting
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development',
  // Additional options for cloud environments
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
  rateLimit: 14, // max 14 emails per second
  // Retry configuration
  retryDelay: 1000,
  retryAttempts: 3
});

// Generate unique review token
const generateReviewToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send review invitation email
const sendReviewInvitation = async (booking, room) => {
  // Use Resend API service for production environments (works better with cloud hosting)
  if (process.env.NODE_ENV === 'production') {
    console.log('📧 Using Resend API email service for production...');
    return await resendSendReviewInvitation(booking, room);
  }
  
  try {
    console.log('📧 Sending review invitation email...');
    console.log('📧 To:', booking.customerEmail);
    console.log('📧 Environment:', process.env.NODE_ENV || 'development');
    console.log('📧 SMTP Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
    console.log('📧 SMTP User:', process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com');
    console.log('📧 Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:8082');
    
    const reviewToken = generateReviewToken();
    const reviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:8082'}/review/${booking._id}/${reviewToken}`;
    
    console.log('📧 Review URL:', reviewUrl);
    
    const mailOptions = {
      from: `"AKR Hotel" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: booking.customerEmail,
      subject: `Share Your Experience - Review Your Stay at AKR Hotel`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #11998e, #38ef7d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Thank You for Staying with Us!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We hope you enjoyed your stay at AKR Hotel</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #333; margin-bottom: 20px;">Dear ${booking.customerName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for choosing AKR Hotel for your recent stay. We hope you had a wonderful experience in our ${room.name}.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Your Stay Details:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Room:</strong> ${room.name}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Your feedback is incredibly valuable to us and helps us improve our services for future guests. 
              We would love to hear about your experience!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewUrl}" 
                 style="background: #11998e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Write Your Review
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Or you can copy and paste this link into your browser:
            </p>
            <p style="background: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all; color: #11998e; font-size: 14px;">
              ${reviewUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>Note:</strong> This review link is unique to your stay and will expire in 30 days for security purposes.
            </p>
            
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
                Thank you again for choosing AKR Hotel. We look forward to welcoming you back soon!
              </p>
              <p style="color: #666; line-height: 1.6; margin-bottom: 5px;">
                Best regards,<br>
                The AKR Hotel Team
              </p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              AKR Hotel | Mannar, Sri Lanka<br>
              Phone: 0773111266 | Email: akrfuture@gmail.com
            </p>
          </div>
        </div>
      `
    };

    console.log('📧 Attempting to send email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    
    return { success: true, reviewToken, result };
  } catch (error) {
    console.error('❌ Error sending review invitation email:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to send email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check Gmail app password configuration.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Email connection failed. Please check internet connection.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email connection timed out. Please try again.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'SMTP server not found. Please check SMTP_HOST configuration.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // If primary method fails, try alternative method
    console.log('🔄 Primary email method failed, trying alternative method...');
    return await alternativeSendReviewInvitation(booking, room);
  }
};

// Send review reminder email
const sendReviewReminder = async (booking, room) => {
  try {
    const reviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:8082'}/review/${booking._id}/${booking.reviewToken}`;
    
    const mailOptions = {
      from: `"AKR Hotel" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: booking.customerEmail,
      subject: `Reminder: Share Your AKR Hotel Experience`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #11998e, #38ef7d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">We'd Love to Hear from You!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your review helps other travelers choose AKR Hotel</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #333; margin-bottom: 20px;">Dear ${booking.customerName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We noticed you haven't shared your review yet for your recent stay in our ${room.name}. 
              Your feedback is incredibly valuable to us and helps future guests make informed decisions.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewUrl}" 
                 style="background: #11998e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Write Your Review Now
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              It only takes a few minutes, and your review will help other travelers discover the comfort and quality of AKR Hotel.
            </p>
            
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
                Thank you for your time and for choosing AKR Hotel!
              </p>
              <p style="color: #666; line-height: 1.6; margin-bottom: 5px;">
                Best regards,<br>
                The AKR Hotel Team
              </p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              AKR Hotel | Mannar, Sri Lanka<br>
              Phone: 0773111266 | Email: akrfuture@gmail.com
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending review reminder email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendReviewInvitation,
  sendReviewReminder,
  generateReviewToken
}; 