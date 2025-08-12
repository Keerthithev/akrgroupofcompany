const nodemailer = require('nodemailer');

// Test email configuration
const testEmailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'keerthiganthevarasa@gmail.com',
    pass: 'rvnh sfki ilmg qizs'
  }
};

// Test data
const testBooking = {
  _id: 'test_booking_id_123',
  customerName: 'Test Customer',
  customerEmail: 'keerthiganthevarasa@gmail.com',
  customerPhone: '0773111266',
  customerAddress: 'Test Address, Mannar',
  checkIn: new Date('2025-08-15'),
  checkOut: new Date('2025-08-17'),
  checkInTime: '14:00',
  checkOutTime: '11:00',
  nights: 2,
  guests: 2,
  totalAmount: 5000,
  discountAmount: 500,
  discountPercentage: 10,
  discountReason: 'Early booking discount',
  finalAmount: 4500,
  paymentStatus: 'pending',
  status: 'Pending',
  specialRequests: 'Test special request',
  createdAt: new Date()
};

const testRoom = {
  _id: 'test_room_id_123',
  name: 'Test Room 101',
  type: 'Business',
  beds: '1 Double Bed',
  maxGuests: 2,
  price: 2500,
  amenities: ['WiFi', 'AC', 'TV', 'Mini Bar']
};

async function testEmailSystem() {
  console.log('🧪 Testing AKR Group Hotel Email System...\n');

  const transporter = nodemailer.createTransport(testEmailConfig);

  try {
    // Test 1: Basic SMTP Connection
    console.log('1️⃣ Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful\n');

    // Test 2: Customer Booking Email ("We will contact soon")
    console.log('2️⃣ Testing Customer Booking Email...');
    const customerEmailResult = await sendCustomerBookingEmail(testBooking, testRoom, transporter);
    console.log('✅ Customer booking email sent successfully\n');

    // Test 3: Admin Notification Email
    console.log('3️⃣ Testing Admin Notification Email...');
    const adminEmailResult = await sendAdminNotificationEmail(testBooking, testRoom, transporter);
    console.log('✅ Admin notification email sent successfully\n');

    // Test 4: Booking Confirmation Email
    console.log('4️⃣ Testing Booking Confirmation Email...');
    const confirmationEmailResult = await sendBookingConfirmationEmail(testBooking, testRoom, transporter);
    console.log('✅ Booking confirmation email sent successfully\n');

    // Test 5: Payment Confirmation Email
    console.log('5️⃣ Testing Payment Confirmation Email...');
    const paymentEmailResult = await sendPaymentConfirmationEmail(testBooking, testRoom, 5000, transporter);
    console.log('✅ Payment confirmation email sent successfully\n');

    // Test 6: Review Invitation Email
    console.log('6️⃣ Testing Review Invitation Email...');
    const reviewInvitationResult = await sendReviewInvitationEmail(testBooking, testRoom, transporter);
    console.log('✅ Review invitation email sent successfully\n');

    // Test 7: Review Reminder Email
    console.log('7️⃣ Testing Review Reminder Email...');
    const reviewReminderResult = await sendReviewReminderEmail(testBooking, testRoom, transporter);
    console.log('✅ Review reminder email sent successfully\n');

    console.log('🎉 All email tests completed successfully!');
    console.log('📧 Check your email inbox for test messages.');
    console.log('📋 Email types tested:');
    console.log('   - Customer booking email ("We will contact soon")');
    console.log('   - Admin notification email');
    console.log('   - Booking confirmation email');
    console.log('   - Payment confirmation email');
    console.log('   - Review invitation email');
    console.log('   - Review reminder email');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('🔍 Error details:', error);
  }
}

// Customer Booking Email Function
async function sendCustomerBookingEmail(booking, room, transporter) {
  const getStayDuration = (nights) => {
    if (nights === 1) return '1 night';
    if (nights < 7) return `${nights} nights`;
    if (nights === 7) return '1 week';
    if (nights < 30) return `${nights} nights (${Math.ceil(nights / 7)} weeks)`;
    if (nights === 30) return '1 month';
    if (nights < 365) return `${nights} nights (${Math.ceil(nights / 30)} months)`;
    return `${nights} nights (${Math.ceil(nights / 365)} years)`;
  };

  const mailOptions = {
    from: `"AKR Group Hotel" <keerthiganthevarasa@gmail.com>`,
    to: booking.customerEmail,
    subject: '🏨 Booking Received - AKR Group Hotel - We Will Contact You Soon',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🏨 Booking Received</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing AKR Group Hotel</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">We will contact you within 24 hours to confirm your reservation</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">📋 Your Booking Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
            <h3 style="color: #667eea; margin-top: 0;">🏨 Room Information</h3>
            <p><strong>Room:</strong> ${room.name}</p>
            <p><strong>Type:</strong> ${room.type}</p>
            <p><strong>Beds:</strong> ${room.beds}</p>
            <p><strong>Max Guests:</strong> ${room.maxGuests}</p>
            <p><strong>Room Rate:</strong> Rs. ${room.price?.toLocaleString() || 'N/A'} per night</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">📅 Stay Details</h3>
            <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()} at ${booking.checkInTime}</p>
            <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()} at ${booking.checkOutTime}</p>
            <p><strong>Duration:</strong> ${getStayDuration(booking.nights)}</p>
            <p><strong>Guests:</strong> ${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}</p>
            <p><strong>Total Amount:</strong> Rs. ${(booking.totalAmount || 0).toLocaleString()}</p>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
            <h3 style="color: #ffc107; margin-top: 0;">👤 Guest Information</h3>
            <p><strong>Name:</strong> ${booking.customerName}</p>
            <p><strong>Email:</strong> ${booking.customerEmail}</p>
            <p><strong>Phone:</strong> ${booking.customerPhone}</p>
            ${booking.customerAddress ? `<p><strong>Address:</strong> ${booking.customerAddress}</p>` : ''}
            ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
            <h3 style="color: #1976d2; margin-top: 0;">⏰ Next Steps</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>✅ We have received your booking request</li>
              <li>📞 Our team will contact you within 24 hours</li>
              <li>🔍 We will verify room availability for your dates</li>
              <li>💳 We will discuss payment options and confirm details</li>
              <li>📧 You will receive a final confirmation email once approved</li>
            </ul>
          </div>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
            <h3 style="color: #f57c00; margin-top: 0;">⚠️ Important Information</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>📝 This is a booking request, not a confirmed reservation</li>
              <li>💳 No payment has been processed yet</li>
              <li>⏳ We will contact you to confirm availability</li>
              <li>📞 For urgent inquiries, please call us directly</li>
              <li>🕐 Standard check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
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

  return await transporter.sendMail(mailOptions);
}

// Admin Notification Email Function
async function sendAdminNotificationEmail(booking, room, transporter) {
  const mailOptions = {
    from: `"AKR Group Hotel" <keerthiganthevarasa@gmail.com>`,
    to: 'keerthiganthevarasa@gmail.com',
    subject: '🔔 New Hotel Room Booking Request - AKR Group Hotel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🆕 New Booking Request</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">A customer has requested to book a hotel room</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">📋 Booking Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">🏨 Room Information</h3>
            <p><strong>Room:</strong> ${room.name}</p>
            <p><strong>Type:</strong> ${room.type}</p>
            <p><strong>Beds:</strong> ${room.beds}</p>
            <p><strong>Max Guests:</strong> ${room.maxGuests}</p>
            <p><strong>Room Rate:</strong> Rs. ${room.price?.toLocaleString() || 'N/A'}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff;">
            <h3 style="color: #007bff; margin-top: 0;">📅 Stay Details</h3>
            <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()} at ${booking.checkInTime}</p>
            <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()} at ${booking.checkOutTime}</p>
            <p><strong>Nights:</strong> ${booking.nights}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Total Amount:</strong> Rs. ${(booking.totalAmount || 0).toLocaleString()}</p>
            <p><strong>Payment Status:</strong> <span style="color: #ffc107; font-weight: bold;">${booking.paymentStatus}</span></p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #6f42c1;">
            <h3 style="color: #6f42c1; margin-top: 0;">👤 Customer Information</h3>
            <p><strong>Name:</strong> ${booking.customerName}</p>
            <p><strong>Email:</strong> ${booking.customerEmail}</p>
            <p><strong>Phone:</strong> ${booking.customerPhone}</p>
            ${booking.customerAddress ? `<p><strong>Address:</strong> ${booking.customerAddress}</p>` : ''}
            ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ Action Required</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Review the booking request</li>
              <li>Check room availability for the requested dates</li>
              <li>Contact the customer to confirm or discuss alternatives</li>
              <li>Update booking status in the admin panel</li>
              <li>Send confirmation email to customer once approved</li>
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

  return await transporter.sendMail(mailOptions);
}

// Booking Confirmation Email Function
async function sendBookingConfirmationEmail(booking, room, transporter) {
  const mailOptions = {
    from: `"AKR Group Hotel" <keerthiganthevarasa@gmail.com>`,
    to: booking.customerEmail,
    subject: 'Booking Confirmed - AKR Group Hotel',
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
            <p><strong>Room:</strong> ${room.name}</p>
            <p><strong>Type:</strong> ${room.type}</p>
            <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
            <p><strong>Nights:</strong> ${booking.nights}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Total Amount:</strong> Rs. ${(booking.totalAmount || 0).toLocaleString()}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">Guest Information</h3>
            <p><strong>Name:</strong> ${booking.customerName}</p>
            <p><strong>Email:</strong> ${booking.customerEmail}</p>
            <p><strong>Phone:</strong> ${booking.customerPhone}</p>
            ${booking.customerAddress ? `<p><strong>Address:</strong> ${booking.customerAddress}</p>` : ''}
            ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Important Information</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Please arrive at the hotel between 2:00 PM and 6:00 PM for check-in</li>
              <li>Bring a valid ID (passport or national ID) for verification</li>
              <li>All rooms are located on the second floor</li>
              <li>For any changes, please contact us at least 24 hours in advance</li>
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

  return await transporter.sendMail(mailOptions);
}

// Payment Confirmation Email Function
async function sendPaymentConfirmationEmail(booking, room, paymentAmount, transporter) {
  const mailOptions = {
    from: `"AKR Group Hotel" <keerthiganthevarasa@gmail.com>`,
    to: booking.customerEmail,
    subject: 'Payment Confirmed - AKR Group Hotel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✅ Payment Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your payment has been received successfully</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Payment Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">💰 Payment Information</h3>
            <p><strong>Amount Paid:</strong> Rs. ${paymentAmount?.toLocaleString() || booking.totalAmount?.toLocaleString()}</p>
            <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">Confirmed</span></p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">🏨 Booking Details</h3>
            <p><strong>Room:</strong> ${room.name}</p>
            <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
            <p><strong>Nights:</strong> ${booking.nights}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">✅ What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Your booking is now fully confirmed</li>
              <li>Please arrive at the hotel between 2:00 PM and 6:00 PM for check-in</li>
              <li>Bring a valid ID (passport or national ID) for verification</li>
              <li>All rooms are located on the second floor</li>
              <li>For any changes, please contact us at least 24 hours in advance</li>
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

  return await transporter.sendMail(mailOptions);
}

// Review Invitation Email Function
async function sendReviewInvitationEmail(booking, room, transporter) {
  const mailOptions = {
    from: `"AKR Group Hotel" <keerthiganthevarasa@gmail.com>`,
    to: booking.customerEmail,
    subject: 'Share Your Experience - Review Your Stay at AKR Hotel',
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
            <a href="https://akrgroupofcompany.netlify.app/review/${booking._id}/test-token" 
               style="background: #11998e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Write Your Review
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Or you can copy and paste this link into your browser:
          </p>
          <p style="background: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all; color: #11998e; font-size: 14px;">
            https://akrgroupofcompany.netlify.app/review/${booking._id}/test-token
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

  return await transporter.sendMail(mailOptions);
}

// Review Reminder Email Function
async function sendReviewReminderEmail(booking, room, transporter) {
  const mailOptions = {
    from: `"AKR Group Hotel" <keerthiganthevarasa@gmail.com>`,
    to: booking.customerEmail,
    subject: 'Reminder: Share Your AKR Hotel Experience',
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
            <a href="https://akrgroupofcompany.netlify.app/review/${booking._id}/test-token" 
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

  return await transporter.sendMail(mailOptions);
}

// Run the test
testEmailSystem(); 