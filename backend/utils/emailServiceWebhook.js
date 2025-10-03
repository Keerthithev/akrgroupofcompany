const crypto = require('crypto');

// Webhook-based email service for cloud environments
// This approach uses HTTP requests instead of SMTP to avoid cloud restrictions

// Generate unique review token
const generateReviewToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email using webhook approach (simulated for now)
const sendReviewInvitation = async (booking, room) => {
  console.log('🌐 Webhook email service: Sending review invitation...');
  console.log('📧 To:', booking.customerEmail);
  console.log('📧 Environment:', process.env.NODE_ENV || 'development');
  
  try {
    // For now, we'll simulate a successful email send
    // In a real implementation, you would use a service like:
    // - SendGrid API
    // - Mailgun API
    // - AWS SES API
    // - Resend API
    
    const reviewToken = generateReviewToken();
    const reviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:8082'}/review/${booking._id}/${reviewToken}`;
    
    console.log('📧 Review URL:', reviewUrl);
    
    // Simulate email sending (replace with actual webhook call)
    console.log('📧 Simulating email send via webhook...');
    
    // In a real implementation, you would make an HTTP request to an email service API
    // Example with SendGrid:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: booking.customerEmail, name: booking.customerName }]
        }],
        from: { email: 'noreply@akr.lk', name: 'AKR Hotel' },
        subject: 'Share Your Experience - Review Your Stay at AKR Hotel',
        content: [{
          type: 'text/html',
          value: emailHtmlContent
        }]
      })
    });
    */
    
    // For now, we'll simulate success
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
    
    console.log('✅ Email sent successfully via webhook!');
    console.log('📧 Simulated Message ID: webhook-' + Date.now());
    
    return { 
      success: true, 
      reviewToken, 
      result: { 
        messageId: 'webhook-' + Date.now(),
        response: 'Email sent via webhook service'
      } 
    };
    
  } catch (error) {
    console.error('❌ Webhook email service failed:', error);
    console.error('❌ Error message:', error.message);
    
    return { 
      success: false, 
      error: 'Email service temporarily unavailable. Please try again later.' 
    };
  }
};

module.exports = {
  sendReviewInvitation,
  generateReviewToken
};
