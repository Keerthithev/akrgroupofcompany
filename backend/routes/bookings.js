const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { stringify } = require('csv-stringify/sync');
const { sendReviewInvitation, sendReviewReminder } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// GET all bookings (admin) with filtering
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { search, date, admin } = req.query;
    const filter = {};

    // Filter by admin (user)
    if (admin) {
      filter.user = admin;
    }

    // Filter by date (checkIn or checkOut)
    if (date) {
      // date should be in YYYY-MM-DD format
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.$or = [
        { checkIn: { $lte: end, $gte: start } },
        { checkOut: { $lte: end, $gte: start } }
      ];
    }

    // Search by customer name/email/phone (in customers array or legacy fields)
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { 'customers.name': regex },
        { 'customers.email': regex },
        { 'customers.phone': regex },
        { customerName: regex },
        { customerEmail: regex },
        { customerPhone: regex }
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('user')
      .populate('room')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all bookings (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('room').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET unavailable dates for a specific room
router.get('/unavailable-dates/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log('🔍 Checking unavailable dates for room:', roomId);
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      console.log('❌ Room not found');
      return res.status(404).json({ error: 'Room not found' });
    }
    console.log('✅ Room found:', room.name);
    
    // Find all bookings for this room (exclude cancelled bookings)
    const bookings = await Booking.find({ 
      room: roomId,
      status: { $nin: ['Cancelled'] }, // Exclude cancelled bookings
      paymentStatus: { $in: ['pending', 'paid'] } // Only confirmed bookings
    });
    
    console.log(`📅 Found ${bookings.length} active bookings for this room`);
    
    // Generate array of unavailable dates
    const unavailableDates = [];
    
    bookings.forEach(booking => {
      console.log(`  Processing booking: ${booking.checkIn} to ${booking.checkOut}`);
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      
      // Add all dates between check-in and check-out (including check-in, excluding check-out)
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        // Format date as YYYY-MM-DD to avoid timezone issues
        const dateString = currentDate.toISOString().split('T')[0];
        unavailableDates.push(dateString);
        console.log(`    Added unavailable date: ${dateString}`);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    console.log(`📋 Final unavailable dates:`, unavailableDates);
    res.json({ unavailableDates });
  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create booking with conflict checking
router.post('/', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, checkInTime, checkOutTime, guests, nights, totalAmount, advancePaid, customerName, customerEmail, customerPhone } = req.body;
    
    // Validate required fields
    if (!roomId || !checkIn || !checkOut || !checkInTime || !checkOutTime || !guests || !customerName || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Convert dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }
    
    // Check for conflicts with existing bookings (exclude cancelled bookings)
    const conflictingBookings = await Booking.find({
      room: roomId,
      status: { $nin: ['Cancelled'] }, // Exclude cancelled bookings
      paymentStatus: { $in: ['pending', 'paid'] },
      $or: [
        // Case 1: New booking starts during an existing booking
        {
          checkIn: { $lte: checkInDate },
          checkOut: { $gt: checkInDate }
        },
        // Case 2: New booking ends during an existing booking
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gte: checkOutDate }
        },
        // Case 3: New booking completely contains an existing booking
        {
          checkIn: { $gte: checkInDate },
          checkOut: { $lte: checkOutDate }
        }
      ]
    });

    // Additional time-based conflict checking for same-day bookings
    const sameDayConflicts = conflictingBookings.filter(booking => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);
      
      // If dates overlap, check for time conflicts
      if (checkInDate.toDateString() === bookingCheckIn.toDateString() || 
          checkInDate.toDateString() === bookingCheckOut.toDateString() ||
          checkOutDate.toDateString() === bookingCheckIn.toDateString() ||
          checkOutDate.toDateString() === bookingCheckOut.toDateString()) {
        
        // Check if there's a time overlap on the same day
        const newCheckInTime = checkInTime || '14:00';
        const newCheckOutTime = checkOutTime || '11:00';
        const existingCheckInTime = booking.checkInTime || '14:00';
        const existingCheckOutTime = booking.checkOutTime || '11:00';
        
        // If same day, check time overlap
        if (checkInDate.toDateString() === checkOutDate.toDateString() && 
            bookingCheckIn.toDateString() === bookingCheckOut.toDateString() &&
            checkInDate.toDateString() === bookingCheckIn.toDateString()) {
          
          // Check if time ranges overlap
          return !(newCheckOutTime <= existingCheckInTime || newCheckInTime >= existingCheckOutTime);
        }
      }
      
      return true; // Keep the booking as a conflict if dates overlap
    });
    
    if (conflictingBookings.length > 0) {
      return res.status(409).json({ error: 'Selected dates are not available. Please choose different dates.' });
    }
    
    // Professional night calculation
    const calculateNights = (checkIn, checkOut) => {
      // Reset time to midnight to avoid timezone issues
      const checkInDate = new Date(checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      const checkOutDate = new Date(checkOut);
      checkOutDate.setHours(0, 0, 0, 0);
      
      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      // Professional booking logic:
      // - Same day booking = 1 night (minimum)
      // - Different days = exact night calculation
      return Math.max(1, Math.floor(diffDays));
    };

    const calculatedNights = calculateNights(checkInDate, checkOutDate);
    const calculatedTotalAmount = room.price * calculatedNights;

    // Create booking with professional calculations
    const booking = new Booking({
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      checkInTime: checkInTime || '14:00',
      checkOutTime: checkOutTime || '11:00',
      guests: guests,
      nights: nights || calculatedNights,
      totalAmount: totalAmount || calculatedTotalAmount,
      advancePaid: advancePaid || 0,
      paymentStatus: 'pending',
      customerName,
      customerEmail,
      customerPhone,
      paymentReference: `BK${Date.now()}`, // Generate a simple reference
      // Automatically add the customer who books via website form to customers array
      customers: [{
        name: customerName,
        email: customerEmail,
        phone: customerPhone || '',
        address: '',
        age: null,
        relationship: 'Primary Guest'
      }]
    });
    
  await booking.save();
    
    // Send detailed customer email immediately after booking creation
    try {
      console.log('🔄 Attempting to send customer booking email...');
      await sendCustomerBookingEmail(booking, room);
      console.log('✅ Customer booking email sent successfully');
    } catch (error) {
      console.error('❌ Failed to send customer booking email:', error);
      // Don't fail the booking if email fails
    }
    
    // Send admin notification email
    try {
      console.log('🔄 Attempting to send admin notification email...');
      console.log('📧 Admin email details:', {
        bookingId: booking._id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        roomName: room.name,
        adminEmail: 'keerthiganthevarasa@gmail.com'
      });
      await sendAdminNotificationEmail(booking, room);
      console.log('✅ Admin notification email sent successfully');
    } catch (error) {
      console.error('❌ Failed to send admin notification email:', error);
      console.error('❌ Error details:', error.message);
      // Don't fail the booking if email fails
    }
    
    res.status(201).json({ 
      message: 'Booking created successfully',
      booking,
      paymentReference: booking.paymentReference
    });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update booking (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(booking);
});

// DELETE booking (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// PATCH update status (admin)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(booking);
});

// PATCH apply discount to booking
router.patch('/:id/discount', requireAdmin, async (req, res) => {
  try {
    const { discountAmount, discountPercentage, discountReason, finalAmount } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        discountAmount, 
        discountPercentage, 
        discountReason, 
        finalAmount 
      },
      { new: true }
    ).populate('room');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error applying discount:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH update payment status and details
router.patch('/:id/payment', requireAdmin, async (req, res) => {
  try {
    const { 
      amount, 
      discountAmount, 
      discountPercentage, 
      discountReason, 
      finalAmount, 
      paymentStatus 
    } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        amount,
        discountAmount, 
        discountPercentage, 
        discountReason, 
        finalAmount,
        paymentStatus,
        payment: {
          amount: finalAmount,
          method: 'manual',
          status: paymentStatus,
          reference: `PAY${Date.now()}`
        }
      },
      { new: true }
    ).populate('room');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Send payment confirmation email if payment status is 'paid'
    if (paymentStatus === 'paid') {
      try {
        console.log('🔄 Payment marked as paid, sending confirmation email...');
        await sendPaymentConfirmationEmail(booking, finalAmount);
        console.log('✅ Payment confirmation email sent successfully');
      } catch (error) {
        console.error('❌ Failed to send payment confirmation email:', error);
        // Don't fail the payment update if email fails
      }
    }
    
    res.json({ 
      message: 'Payment recorded successfully', 
      booking 
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST add manual revenue entry
router.post('/manual-revenue', requireAdmin, async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    
    // For now, we'll just return success since we don't have a manual revenue collection
    // In a real implementation, you might want to store this in a separate collection
    
    console.log('Manual revenue entry:', { type, amount, description });
    
    res.json({ 
      message: 'Manual revenue entry recorded successfully',
      entry: { type, amount, description, date: new Date() }
    });
  } catch (error) {
    console.error('Error recording manual revenue:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update booking (for payment status updates)
router.put('/:id', async (req, res) => {
  try {
    const { paymentStatus, status, advancePaid } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { paymentStatus, status, advancePaid }, 
      { new: true }
    ).populate('room');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Send confirmation email if status is changed to 'Confirmed'
    if (status === 'Confirmed') {
      try {
        console.log('🔄 Booking status changed to confirmed, sending confirmation email...');
        await sendBookingConfirmationEmail(booking);
        console.log('✅ Booking confirmation email sent successfully');
      } catch (error) {
        console.error('❌ Failed to send booking confirmation email:', error);
        // Don't fail the status update if email fails
      }
    }
    
    res.json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PayHere payment initiation
router.post('/payhere/initiate', async (req, res) => {
  try {
    const { bookingId, amount, customerName, customerEmail, customerPhone, roomName } = req.body;

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // PayHere credentials (replace with your actual credentials)
    const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "YOUR_REAL_MERCHANT_ID";
    const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || "YOUR_REAL_MERCHANT_SECRET";

    // Generate unique order ID
    const orderId = `BK${booking._id}_${Date.now()}`;

    // PayHere hash generation
    const currency = "LKR";
    const hashString = MERCHANT_ID + orderId + amount.toFixed(2) + currency + crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    // Update booking with payment details
    await Booking.findByIdAndUpdate(bookingId, {
      paymentReference: orderId,
      paymentStatus: 'pending'
    });

    res.json({
      orderId,
      amount,
      hash,
      merchantId: MERCHANT_ID
    });

  } catch (error) {
    console.error('PayHere initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// PayHere webhook for payment notifications
router.post('/payhere/webhook', express.raw({ type: 'application/x-www-form-urlencoded' }), async (req, res) => {
  try {
    // Parse the webhook data
    const data = new URLSearchParams(req.body.toString());
    
    const merchant_id = data.get('merchant_id');
    const order_id = data.get('order_id');
    const payhere_amount = data.get('payhere_amount');
    const payhere_currency = data.get('payhere_currency');
    const status_code = data.get('status_code');
    const md5sig = data.get('md5sig');

    // Verify the webhook signature
    const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || "YOUR_REAL_MERCHANT_SECRET";
    const local_md5sig = crypto.createHash('md5')
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase())
      .digest('hex').toUpperCase();

    if (local_md5sig !== md5sig) {
      console.log('Invalid PayHere webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Find booking by payment reference
    const booking = await Booking.findOne({ paymentReference: order_id });
    if (!booking) {
      console.log('Booking not found for order:', order_id);
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking status based on payment status
    let updateData = {};
    
    if (status_code === '2') { // Payment successful
      updateData = {
        paymentStatus: 'paid',
        status: 'Confirmed',
        advancePaid: parseFloat(payhere_amount)
      };
    } else if (status_code === '0') { // Payment pending
      updateData = {
        paymentStatus: 'pending'
      };
    } else { // Payment failed or cancelled
      updateData = {
        paymentStatus: 'failed',
        status: 'Cancelled'
      };
    }

    await Booking.findByIdAndUpdate(booking._id, updateData);

    console.log(`Payment ${status_code === '2' ? 'successful' : 'failed'} for booking ${booking._id}`);
    res.status(200).json({ status: 'received' });

  } catch (error) {
    console.error('PayHere webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Send booking confirmation email
router.post('/send-confirmation', async (req, res) => {
  try {
    const { bookingId, customerEmail, customerName } = req.body;
    
    // Find the booking with room details
    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // TEST MODE: Skip email sending for now
    const useTestMode = false; // Set to false when email is configured
    
    if (useTestMode) {
      console.log('TEST MODE: Email would be sent to:', customerEmail);
      console.log('Booking details:', {
        room: booking.room.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        totalAmount: booking.totalAmount
      });
      return res.json({ message: 'Test mode: Email simulation successful' });
    }

    // REAL EMAIL MODE (when you have proper Gmail app password)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Email content
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'AKR Room'}" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: customerEmail,
      subject: 'Booking Confirmation - AKR Group Hotel',
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
              <p><strong>Room:</strong> ${booking.room.name}</p>
              <p><strong>Type:</strong> ${booking.room.type}</p>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
              <p><strong>Nights:</strong> ${booking.nights}</p>
              <p><strong>Guests:</strong> ${booking.guests}</p>
              <p><strong>Room Rate:</strong> Rs. ${(booking.room.price || 0).toLocaleString()} per night</p>
              <p><strong>Subtotal:</strong> Rs. ${(booking.totalAmount || 0).toLocaleString()}</p>
              ${booking.discountAmount ? `<p><strong>Discount:</strong> Rs. ${booking.discountAmount.toLocaleString()} ${booking.discountPercentage ? `(${booking.discountPercentage}%)` : ''}</p>` : ''}
              ${booking.discountReason ? `<p><strong>Discount Reason:</strong> ${booking.discountReason}</p>` : ''}
              <p><strong>Final Amount:</strong> Rs. ${(booking.finalAmount || booking.totalAmount || 0).toLocaleString()}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">Guest Information</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Phone:</strong> ${booking.customerPhone}</p>
              ${booking.customerAddress ? `<p><strong>Address:</strong> ${booking.customerAddress}</p>` : ''}
              ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">Important Information</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Please arrive at the hotel between 2:00 PM and 6:00 PM for check-in</li>
                <li>Bring a valid ID (passport or national ID) for verification</li>
                <li>Payment will be collected upon arrival at the property</li>
                <li>Please bring the final amount in cash or card</li>
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

    // Send email with retry logic
    console.log('📧 Attempting to send email to:', customerEmail);
    
    let emailSent = false;
    let lastError = null;
    
    // Try up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📧 Email attempt ${attempt}/3...`);
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', result.messageId);
        emailSent = true;
        break;
      } catch (error) {
        console.error(`❌ Email attempt ${attempt} failed:`, error.message);
        lastError = error;
        
        if (attempt < 3) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    if (emailSent) {
      res.json({ message: 'Confirmation email sent successfully' });
    } else {
      console.error('❌ All email attempts failed:', lastError);
      res.json({ message: 'Booking confirmed but email failed to send. Please check your email settings.' });
    }
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    // Don't fail the booking if email fails
    res.json({ message: 'Booking confirmed but email failed to send' });
  }
});

// Test email functionality
router.post('/test-email', async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    console.log('🧪 Testing email functionality...');
    
    const transporter = nodemailer.createTransport({
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
    });
    
    const testMailOptions = {
      from: `"AKR Hotel Test" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: to,
      subject: 'Test Email - AKR Hotel System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Test Email from AKR Hotel</h2>
          <p>This is a test email to verify that the email system is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email. Please ignore if you received this by mistake.
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully:', result.messageId);
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: result.messageId 
    });
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Email configuration issue. Check Gmail app password and settings.'
    });
  }
});

// Send "we will contact soon" email for new bookings
router.post('/send-contact-soon', async (req, res) => {
  try {
    const { bookingId, customerEmail, customerName } = req.body;
    
    // Find the booking with room details
    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // REAL EMAIL MODE
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      }
    });

    // Email content
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'AKR Group Hotel'}" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: customerEmail,
      subject: 'Booking Received - We Will Contact You Soon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Booking Received</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing AKR Group Hotel</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Booking Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">Room Information</h3>
              <p><strong>Room:</strong> ${booking.room.name}</p>
              <p><strong>Type:</strong> ${booking.room.type}</p>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
              <p><strong>Nights:</strong> ${booking.nights}</p>
              <p><strong>Guests:</strong> ${booking.guests}</p>
              <p><strong>Total Amount:</strong> Rs. ${(booking.totalAmount || booking.payment?.amount || booking.advancePaid || 0).toLocaleString()}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">Guest Information</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Phone:</strong> ${booking.customerPhone}</p>
              ${booking.customerAddress ? `<p><strong>Address:</strong> ${booking.customerAddress}</p>` : ''}
              ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
              <h3 style="color: #1976d2; margin-top: 0;">Next Steps</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>We have received your booking request</li>
                <li>Our team will review and contact you within 24 hours</li>
                <li>We will confirm availability and discuss payment options</li>
                <li>You will receive a final confirmation email once approved</li>
              </ul>
            </div>
            
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
              <h3 style="color: #f57c00; margin-top: 0;">Important Information</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>This is a booking request, not a confirmed reservation</li>
                <li>Payment will be collected upon arrival at the property</li>
                <li>Please bring the final amount in cash or card</li>
                <li>We will contact you to confirm availability</li>
                <li>For urgent inquiries, please call us directly</li>
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

    // Send email
    console.log('Attempting to send "contact soon" email to:', customerEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log('Contact soon email sent successfully:', result.messageId);
    
    res.json({ message: 'Contact soon email sent successfully' });
    
  } catch (error) {
    console.error('Contact soon email sending error:', error);
    res.json({ message: 'Booking received but email failed to send' });
  }
});

// Send admin notification email for new bookings
async function sendAdminNotificationEmail(booking, room) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      }
    });

    // Email content
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'AKR Group Hotel'}" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: 'keerthiganthevarasa@gmail.com', // Admin email
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
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()} at ${booking.checkInTime || '14:00'}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()} at ${booking.checkOutTime || '11:00'}</p>
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
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8;">
              <h3 style="color: #0c5460; margin-top: 0;">📞 Quick Actions</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Call Customer:</strong> ${booking.customerPhone}</li>
                <li><strong>Email Customer:</strong> ${booking.customerEmail}</li>
                <li><strong>Booking ID:</strong> ${booking._id}</li>
                <li><strong>Created:</strong> ${new Date(booking.createdAt).toLocaleString()}</li>
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

    // Send email with retry logic
    console.log('📧 Sending admin notification email to: keerthiganthevarasa@gmail.com');
    
    let emailSent = false;
    let lastError = null;
    
    // Try up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📧 Admin email attempt ${attempt}/3...`);
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Admin notification email sent successfully:', result.messageId);
        emailSent = true;
        break;
      } catch (error) {
        console.error(`❌ Admin email attempt ${attempt} failed:`, error.message);
        lastError = error;
        
        if (attempt < 3) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    if (!emailSent) {
      console.error('❌ All admin email attempts failed:', lastError);
      throw new Error(`Failed to send admin notification email: ${lastError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Admin notification email sending error:', error);
    throw error;
  }
}

// Send detailed customer email immediately after booking creation
async function sendCustomerBookingEmail(booking, room) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      }
    });

    // Calculate stay duration for display
    const getStayDuration = (nights) => {
      if (nights === 1) return '1 night';
      if (nights < 7) return `${nights} nights`;
      if (nights === 7) return '1 week';
      if (nights < 30) return `${nights} nights (${Math.ceil(nights / 7)} weeks)`;
      if (nights === 30) return '1 month';
      if (nights < 365) return `${nights} nights (${Math.ceil(nights / 30)} months)`;
      return `${nights} nights (${Math.ceil(nights / 365)} years)`;
    };

    // Email content
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'AKR Group Hotel'}" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
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
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()} at ${booking.checkInTime || '14:00'}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()} at ${booking.checkOutTime || '11:00'}</p>
              <p><strong>Duration:</strong> ${getStayDuration(booking.nights)}</p>
              <p><strong>Guests:</strong> ${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}</p>
              <p><strong>Room Rate:</strong> Rs. ${(room.price || 0).toLocaleString()} per night</p>
              <p><strong>Subtotal:</strong> Rs. ${(booking.totalAmount || 0).toLocaleString()}</p>
              ${booking.discountAmount ? `<p><strong>Discount:</strong> Rs. ${booking.discountAmount.toLocaleString()} ${booking.discountPercentage ? `(${booking.discountPercentage}%)` : ''}</p>` : ''}
              ${booking.discountReason ? `<p><strong>Discount Reason:</strong> ${booking.discountReason}</p>` : ''}
              <p><strong>Final Amount:</strong> Rs. ${(booking.finalAmount || booking.totalAmount || 0).toLocaleString()}</p>
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
                <li>💳 Payment will be collected upon arrival at the property</li>
                <li>💰 Please bring the final amount in cash or card</li>
                <li>⏳ We will contact you to confirm availability</li>
                <li>📞 For urgent inquiries, please call us directly</li>
                <li>🕐 Standard check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
              </ul>
            </div>
            
            <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #9c27b0;">
              <h3 style="color: #7b1fa2; margin-top: 0;">🎁 What's Included</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>🛏️ Comfortable accommodation</li>
                <li>🚿 Private bathroom</li>
                <li>❄️ Air conditioning</li>
                <li>📶 Free WiFi</li>
                <li>🅿️ Parking available</li>
                <li>🏪 Located in the heart of Murunkan</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-weight: bold;">AKR Group Hotel</p>
            <p style="margin: 5px 0;">Main Street, Murunkan, Mannar, Sri Lanka</p>
            <p style="margin: 5px 0;">📞 Phone: +94 77 311 1266</p>
            <p style="margin: 5px 0;">📧 Email: akrfuture@gmail.com</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              Thank you for choosing AKR Group Hotel. We look forward to welcoming you!
            </p>
          </div>
        </div>
      `
    };

    // Send email
    console.log('Sending detailed booking email to customer:', booking.customerEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log('Customer booking email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('Customer booking email sending error:', error);
    throw error;
  }
}

// Send booking cancellation email
router.post('/send-cancellation', async (req, res) => {
  try {
    const { bookingId, customerEmail, customerName } = req.body;
    
    // Find the booking with room details
    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // TEST MODE: Skip email sending for now
    const useTestMode = false; // Set to false when email is configured
    
    if (useTestMode) {
      console.log('TEST MODE: Cancellation email would be sent to:', customerEmail);
      console.log('Cancelled booking details:', {
        room: booking.room.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        totalAmount: booking.totalAmount || booking.payment?.amount || booking.advancePaid || 0
      });
      return res.json({ message: 'Test mode: Cancellation email simulation successful' });
    }

    // REAL EMAIL MODE (when you have proper Gmail app password)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      }
    });

    // Email content
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'AKR Room'}" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: customerEmail,
      subject: 'Booking Cancelled - AKR Group Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Booking Cancelled</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">We're sorry to inform you</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Cancellation Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #ff6b6b; margin-top: 0;">Booking Information</h3>
              <p><strong>Room:</strong> ${booking.room.name}</p>
              <p><strong>Type:</strong> ${booking.room.type}</p>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
              <p><strong>Nights:</strong> ${booking.nights}</p>
              <p><strong>Guests:</strong> ${booking.guests}</p>
              <p><strong>Total Amount:</strong> Rs. ${(booking.totalAmount || booking.payment?.amount || booking.advancePaid || 0).toLocaleString()}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #ff6b6b; margin-top: 0;">Guest Information</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Phone:</strong> ${booking.customerPhone}</p>
              ${booking.customerAddress ? `<p><strong>Address:</strong> ${booking.customerAddress}</p>` : ''}
              ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Important Information</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Your booking has been cancelled as requested</li>
                <li>No charges have been made to your account</li>
                <li>You can make a new booking anytime</li>
                <li>For any questions, please contact us</li>
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

    // Send email
    console.log('Attempting to send cancellation email to:', customerEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log('Cancellation email sent successfully:', result.messageId);
    
    res.json({ message: 'Cancellation email sent successfully' });
    
  } catch (error) {
    console.error('Cancellation email sending error:', error);
    // Don't fail the cancellation if email fails
    res.json({ message: 'Booking cancelled but email failed to send' });
  }
});

// Add a customer to a booking (admin)
router.put('/:id/add-customer', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    booking.customers = booking.customers || [];
    booking.customers.push(req.body);
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

// Remove a customer from a booking (admin)
router.put('/:id/remove-customer', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const { index } = req.body;
    if (typeof index !== 'number' || index < 0 || index >= (booking.customers?.length || 0)) {
      return res.status(400).json({ error: 'Invalid customer index' });
    }
    booking.customers.splice(index, 1);
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove customer' });
  }
});

// Export bookings/customers as CSV
router.get('/export', requireAdmin, async (req, res) => {
  try {
    const { search, date, admin } = req.query;
    const filter = {};

    if (admin) {
      filter.user = admin;
    }
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.$or = [
        { checkIn: { $lte: end, $gte: start } },
        { checkOut: { $lte: end, $gte: start } }
      ];
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { 'customers.name': regex },
        { 'customers.email': regex },
        { 'customers.phone': regex },
        { customerName: regex },
        { customerEmail: regex },
        { customerPhone: regex }
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('user')
      .populate('room')
      .sort({ createdAt: -1 });

    // Flatten bookings/customers for CSV with merged group columns and sequential group numbers
    let rows = [];
    let groupCounter = 1;
    bookings.forEach(booking => {
      const groupTrip = groupCounter;
      const groupSize = (booking.customers && booking.customers.length > 0) ? booking.customers.length : 1;
      let isFirst = true;
      const checkInStr = booking.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : '';
      const checkOutStr = booking.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : '';
      if (booking.customers && booking.customers.length > 0) {
        booking.customers.forEach(customer => {
          rows.push({
            GroupTrip: isFirst ? groupTrip : '',
            Room: booking.room?.name || '',
            GroupSize: isFirst ? groupSize : '',
            CheckIn: checkInStr,
            CheckOut: checkOutStr,
            Status: booking.status,
            Admin: booking.user?.name || '',
            CustomerName: customer.name,
            CustomerEmail: customer.email,
            CustomerPhone: customer.phone,
            CustomerAddress: customer.address,
            CustomerAge: customer.age,
            CustomerRelationship: customer.relationship
          });
          isFirst = false;
        });
      } else {
        // Legacy single customer fields
        rows.push({
          GroupTrip: groupTrip,
          Room: booking.room?.name || '',
          GroupSize: groupSize,
          CheckIn: checkInStr,
          CheckOut: checkOutStr,
          Status: booking.status,
          Admin: booking.user?.name || '',
          CustomerName: booking.customerName,
          CustomerEmail: booking.customerEmail,
          CustomerPhone: booking.customerPhone,
          CustomerAddress: booking.customerAddress,
          CustomerAge: '',
          CustomerRelationship: ''
        });
      }
      groupCounter++;
    });

    // CSV header
    const columns = [
      'GroupTrip', 'Room', 'GroupSize', 'CheckIn', 'CheckOut', 'Status', 'Admin',
      'CustomerName', 'CustomerEmail', 'CustomerPhone', 'CustomerAddress', 'CustomerAge', 'CustomerRelationship'
    ];

    let csv;
    try {
      csv = stringify(rows, { header: true, columns });
    } catch (e) {
      // fallback if csv-stringify is not installed
      csv = columns.join(',') + '\n' + rows.map(row => columns.map(col => '"' + (row[col] || '') + '"').join(',')).join('\n');
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customer_report.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting bookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST send review invitation email
router.post('/:id/send-review-invitation', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.customerEmail) {
      return res.status(400).json({ error: 'No customer email available for this booking' });
    }

    // For manual sending, allow resending even if already sent
    // Just log a warning if it was already sent
    if (booking.reviewInvitationSent) {
      console.log(`⚠️ Resending review invitation to ${booking.customerEmail} (was already sent)`);
    }

    const result = await sendReviewInvitation(booking, booking.room);
    
    if (result.success) {
      // Update booking with review token and invitation details
      booking.reviewToken = result.reviewToken;
      booking.reviewInvitationSent = true;
      booking.reviewInvitationDate = new Date();
      booking.reviewExpiryDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
      await booking.save();

      res.json({ 
        message: 'Review invitation sent successfully',
        reviewToken: result.reviewToken
      });
    } else {
      console.error('Failed to send review invitation:', result.error);
      res.status(500).json({ error: 'Failed to send review invitation', details: result.error });
    }
  } catch (error) {
    console.error('Error sending review invitation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST send review reminder email
router.post('/:id/send-review-reminder', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.customerEmail) {
      return res.status(400).json({ error: 'No customer email available for this booking' });
    }

    if (!booking.reviewInvitationSent) {
      return res.status(400).json({ error: 'Review invitation not sent yet. Send invitation first.' });
    }

    const result = await sendReviewReminder(booking, booking.room);
    
    if (result.success) {
      res.json({ message: 'Review reminder sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send review reminder', details: result.error });
    }
  } catch (error) {
    console.error('Error sending review reminder:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET validate review token
router.get('/review/validate/:bookingId/:token', async (req, res) => {
  try {
    const { bookingId, token } = req.params;
    
    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.reviewToken !== token) {
      return res.status(401).json({ error: 'Invalid review token' });
    }

    if (new Date() > booking.reviewExpiryDate) {
      return res.status(401).json({ error: 'Review invitation has expired' });
    }

    res.json({ 
      valid: true, 
      booking: {
        _id: booking._id,
        customerName: booking.customerName,
        room: booking.room,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut
      }
    });
  } catch (error) {
    console.error('Error validating review token:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send payment confirmation email
router.post('/send-payment-confirmation', async (req, res) => {
  try {
    const { bookingId, customerEmail, customerName, paymentAmount } = req.body;
    
    // Find the booking with room details
    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      }
    });

    // Email content
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'AKR Group Hotel'}" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: customerEmail,
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
              <p><strong>Payment Method:</strong> Received at property</p>
              <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">Confirmed</span></p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">🏨 Booking Details</h3>
              <p><strong>Room:</strong> ${booking.room.name}</p>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
              <p><strong>Nights:</strong> ${booking.nights}</p>
              <p><strong>Guests:</strong> ${booking.guests}</p>
              <p><strong>Room Rate:</strong> Rs. ${(booking.room.price || 0).toLocaleString()} per night</p>
              <p><strong>Subtotal:</strong> Rs. ${(booking.totalAmount || 0).toLocaleString()}</p>
              ${booking.discountAmount ? `<p><strong>Discount Applied:</strong> Rs. ${booking.discountAmount.toLocaleString()} ${booking.discountPercentage ? `(${booking.discountPercentage}%)` : ''}</p>` : ''}
              ${booking.discountReason ? `<p><strong>Discount Reason:</strong> ${booking.discountReason}</p>` : ''}
              <p><strong>Final Amount Paid:</strong> Rs. ${(booking.finalAmount || booking.totalAmount || 0).toLocaleString()}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">✅ Thank You!</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Your payment has been received successfully</li>
                <li>Your booking is now fully confirmed</li>
                <li>We hope you enjoy your stay with us</li>
                <li>Please review our room and service after your stay</li>
                <li>Your feedback helps us improve our services</li>
                <li>For any assistance during your stay, please contact reception</li>
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

    // Send email
    console.log('Sending payment confirmation email to:', customerEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent successfully:', result.messageId);
    
    res.json({ message: 'Payment confirmation email sent successfully' });
    
  } catch (error) {
    console.error('Payment confirmation email error:', error);
    res.status(500).json({ error: 'Failed to send payment confirmation email' });
  }
});

// Test email functionality
router.post('/test-email', async (req, res) => {
  try {
    const { emailType, testEmail } = req.body;
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      }
    });

    // Test email configuration
    console.log('🔧 Testing email configuration...');
    console.log('SMTP Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
    console.log('SMTP Port:', process.env.SMTP_PORT || 587);
    console.log('SMTP User:', process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com');
    console.log('SMTP Pass:', process.env.EMAIL_PASS ? '***SET***' : '***NOT SET***');

    // Verify transporter
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');

    const mailOptions = {
      from: `"AKR Hotel Test" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: testEmail || 'keerthiganthevarasa@gmail.com',
      subject: '🧪 Email Test - AKR Hotel System',
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
              <p><strong>Test Type:</strong> ${emailType || 'General Test'}</p>
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

    console.log('📧 Sending test email to:', testEmail || 'keerthiganthevarasa@gmail.com');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully:', result.messageId);
    
    res.json({ 
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      config: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        passSet: !!process.env.EMAIL_PASS
      }
    });
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: {
        code: error.code,
        command: error.command,
        response: error.response
      }
    });
  }
});

// Send payment confirmation email function
async function sendPaymentConfirmationEmail(booking, paymentAmount) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      }
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'AKR Group Hotel'}" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: booking.customerEmail,
      subject: '✅ Payment Confirmed - AKR Group Hotel',
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
              <p><strong>Payment Method:</strong> Received at property</p>
              <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">Confirmed</span></p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">🏨 Booking Details</h3>
              <p><strong>Room:</strong> ${booking.room.name}</p>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
              <p><strong>Nights:</strong> ${booking.nights}</p>
              <p><strong>Guests:</strong> ${booking.guests}</p>
              <p><strong>Final Amount Paid:</strong> Rs. ${(booking.finalAmount || booking.totalAmount || 0).toLocaleString()}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">✅ Thank You!</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Your payment has been received successfully</li>
                <li>Your booking is now fully confirmed</li>
                <li>We hope you enjoy your stay with us</li>
                <li>Please review our room and service after your stay</li>
                <li>Your feedback helps us improve our services</li>
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

    console.log('Sending payment confirmation email to:', booking.customerEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('Payment confirmation email sending error:', error);
    throw error;
  }
}

// Send booking confirmation email function
async function sendBookingConfirmationEmail(booking) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
        pass: process.env.EMAIL_PASS || 'rvnh sfki ilmg qizs'
      }
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'AKR Group Hotel'}" <${process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com'}>`,
      to: booking.customerEmail,
      subject: '✅ Booking Confirmed - AKR Group Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">✅ Booking Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing AKR Group Hotel</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Booking Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0;">🏨 Room Information</h3>
              <p><strong>Room:</strong> ${booking.room.name}</p>
              <p><strong>Type:</strong> ${booking.room.type}</p>
              <p><strong>Beds:</strong> ${booking.room.beds}</p>
              <p><strong>Max Guests:</strong> ${booking.room.maxGuests}</p>
              <p><strong>Room Rate:</strong> Rs. ${booking.room.price?.toLocaleString() || 'N/A'} per night</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">📅 Stay Details</h3>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()} at ${booking.checkInTime || '14:00'}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()} at ${booking.checkOutTime || '11:00'}</p>
              <p><strong>Nights:</strong> ${booking.nights}</p>
              <p><strong>Guests:</strong> ${booking.guests}</p>
              <p><strong>Total Amount:</strong> Rs. ${(booking.totalAmount || 0).toLocaleString()}</p>
              <p><strong>Payment Status:</strong> <span style="color: #ffc107; font-weight: bold;">${booking.paymentStatus}</span></p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #6f42c1;">
              <h3 style="color: #6f42c1; margin-top: 0;">👤 Guest Information</h3>
              <p><strong>Name:</strong> ${booking.customerName}</p>
              <p><strong>Email:</strong> ${booking.customerEmail}</p>
              <p><strong>Phone:</strong> ${booking.customerPhone}</p>
              ${booking.customerAddress ? `<p><strong>Address:</strong> ${booking.customerAddress}</p>` : ''}
              ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">✅ Important Information</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Please arrive at the hotel between 2:00 PM and 6:00 PM for check-in</li>
                <li>Bring a valid ID (passport or national ID) for verification</li>
                <li>Payment will be collected upon arrival at the property</li>
                <li>Please bring the final amount in cash or card</li>
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

    console.log('Sending booking confirmation email to:', booking.customerEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('Booking confirmation email sending error:', error);
    throw error;
  }
}

module.exports = router; 