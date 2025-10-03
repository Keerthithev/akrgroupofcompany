const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Alternative email configuration for cloud environments
const createAlternativeTransporter = () => {
  // Try different SMTP configurations for cloud environments
  const configs = [
    // Gmail with different settings
    {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      },
      tls: {
        rejectUnauthorized: false
      }
    },
    // Gmail with port 587
    {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      }
    },
    // Gmail with different TLS settings
    {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      }
    }
  ];

  // Try each configuration until one works
  for (let i = 0; i < configs.length; i++) {
    try {
      const transporter = nodemailer.createTransport(configs[i]);
      console.log(`📧 Trying email configuration ${i + 1}...`);
      return transporter;
    } catch (error) {
      console.log(`❌ Configuration ${i + 1} failed:`, error.message);
      continue;
    }
  }
  
  throw new Error('All email configurations failed');
};

// Generate unique review token
const generateReviewToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send review invitation email with retry logic
const sendReviewInvitation = async (booking, room) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`📧 Attempt ${attempt}/3: Sending review invitation email...`);
      console.log('📧 To:', booking.customerEmail);
      console.log('📧 Environment:', process.env.NODE_ENV || 'development');
      
      const transporter = createAlternativeTransporter();
      
      // Verify connection first
      console.log('📧 Verifying email connection...');
      await transporter.verify();
      console.log('✅ Email connection verified!');
      
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

      console.log('📧 Sending email...');
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Response:', result.response);
      
      return { success: true, reviewToken, result };
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      console.error('❌ Error code:', error.code);
      
      if (attempt < 3) {
        console.log(`⏳ Waiting 2 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.error('❌ All email attempts failed');
  console.error('❌ Last error:', lastError);
  
  // Provide specific error messages
  let errorMessage = 'Failed to send email after multiple attempts';
  if (lastError.code === 'EAUTH') {
    errorMessage = 'Email authentication failed. Please check Gmail app password configuration.';
  } else if (lastError.code === 'ECONNECTION') {
    errorMessage = 'Email connection failed. Please check internet connection.';
  } else if (lastError.code === 'ETIMEDOUT') {
    errorMessage = 'Email connection timed out. This might be due to cloud provider restrictions.';
  } else if (lastError.code === 'ENOTFOUND') {
    errorMessage = 'SMTP server not found. Please check SMTP_HOST configuration.';
  } else if (lastError.message) {
    errorMessage = lastError.message;
  }
  
  return { success: false, error: errorMessage };
};

module.exports = {
  sendReviewInvitation,
  generateReviewToken
};
