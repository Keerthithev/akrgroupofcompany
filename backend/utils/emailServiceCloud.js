const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Cloud-optimized email service using different approaches
const createCloudTransporter = () => {
  // Try different approaches for cloud environments
  
  // Approach 1: Use Gmail with different settings
  const configs = [
    // Gmail with port 465 (SSL)
    {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    },
    // Gmail with port 587 (TLS) - different TLS settings
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
        minVersion: 'TLSv1.2',
        ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    },
    // Gmail with minimal settings
    {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      },
      connectionTimeout: 5000,
      greetingTimeout: 3000,
      socketTimeout: 5000
    }
  ];

  for (let i = 0; i < configs.length; i++) {
    try {
      console.log(`📧 Trying cloud configuration ${i + 1}...`);
      const transporter = nodemailer.createTransport(configs[i]);
      return transporter;
    } catch (error) {
      console.log(`❌ Configuration ${i + 1} failed:`, error.message);
      continue;
    }
  }
  
  throw new Error('All cloud email configurations failed');
};

// Generate unique review token
const generateReviewToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email with cloud-optimized approach
const sendReviewInvitation = async (booking, room) => {
  console.log('📧 Cloud email service: Sending review invitation...');
  console.log('📧 To:', booking.customerEmail);
  console.log('📧 Environment:', process.env.NODE_ENV || 'development');
  
  try {
    const transporter = createCloudTransporter();
    
    // Quick connection test
    console.log('📧 Testing connection...');
    await transporter.verify();
    console.log('✅ Connection verified!');
    
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
    console.error('❌ Cloud email service failed:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    
    // Return a more user-friendly error
    let errorMessage = 'Email service temporarily unavailable. Please try again later.';
    if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email service is currently experiencing delays. Please try again in a few minutes.';
    } else if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please contact support.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Email service is temporarily unavailable. Please try again later.';
    }
    
    return { success: false, error: errorMessage };
  }
};

module.exports = {
  sendReviewInvitation,
  generateReviewToken
};
