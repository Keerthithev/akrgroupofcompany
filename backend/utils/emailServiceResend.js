const crypto = require('crypto');

// Alternative email service using Resend API (works better with cloud hosting)
// You can get a free API key from https://resend.com

// Generate unique review token
const generateReviewToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email using Resend API
const sendReviewInvitation = async (booking, room) => {
  console.log('📧 Resend API email service: Sending review invitation...');
  console.log('📧 To:', booking.customerEmail);
  console.log('📧 Environment:', process.env.NODE_ENV || 'development');
  
  try {
    const reviewToken = generateReviewToken();
    const reviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:8082'}/review/${booking._id}/${reviewToken}`;
    
    console.log('📧 Review URL:', reviewUrl);
    
    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ Resend API key not found, falling back to simulation...');
      return await simulateEmailSend(booking, room, reviewToken, reviewUrl);
    }
    
    // Use Resend API (requires npm install resend)
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const emailHtml = `
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
    `;
    
    const result = await resend.emails.send({
      from: 'AKR Hotel <noreply@akr.lk>',
      to: [booking.customerEmail],
      subject: 'Share Your Experience - Review Your Stay at AKR Hotel',
      html: emailHtml,
    });
    
    console.log('✅ Email sent successfully via Resend API!');
    console.log('📧 Message ID:', result.data?.id);
    
    return { 
      success: true, 
      reviewToken, 
      result: { 
        messageId: result.data?.id || 'resend-' + Date.now(),
        response: 'Email sent via Resend API'
      } 
    };
    
  } catch (error) {
    console.error('❌ Resend API email service failed:', error);
    console.error('❌ Error message:', error.message);
    
    // Fallback to simulation
    console.log('🔄 Falling back to email simulation...');
    const reviewToken = generateReviewToken();
    const reviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:8082'}/review/${booking._id}/${reviewToken}`;
    return await simulateEmailSend(booking, room, reviewToken, reviewUrl);
  }
};

// Simulate email sending (fallback method)
const simulateEmailSend = async (booking, room, reviewToken, reviewUrl) => {
  console.log('📧 Simulating email send...');
  console.log('📧 This is a fallback method - email was not actually sent');
  console.log('📧 Review URL for testing:', reviewUrl);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('✅ Email simulation completed!');
  console.log('📧 Simulated Message ID: sim-' + Date.now());
  
  return { 
    success: true, 
    reviewToken, 
    result: { 
      messageId: 'sim-' + Date.now(),
      response: 'Email simulation completed (not actually sent)'
    } 
  };
};

module.exports = {
  sendReviewInvitation,
  generateReviewToken
};
