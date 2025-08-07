const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { stringify } = require('csv-stringify/sync');

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
    
    // Find all bookings for this room (exclude cancelled bookings)
    const bookings = await Booking.find({ 
      room: roomId,
      status: { $nin: ['Cancelled'] }, // Exclude cancelled bookings
      paymentStatus: { $in: ['pending', 'paid'] } // Only confirmed bookings
    });
    
    // Generate array of unavailable dates
    const unavailableDates = [];
    
    bookings.forEach(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      
      // Add all dates between check-in and check-out (including check-in, excluding check-out)
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        // Format date as YYYY-MM-DD to avoid timezone issues
        const dateString = currentDate.toISOString().split('T')[0];
        unavailableDates.push(dateString);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    res.json({ unavailableDates });
  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create booking with conflict checking
router.post('/', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, nights, totalAmount, advancePaid, customerName, customerEmail, customerPhone } = req.body;
    
    // Validate required fields
    if (!roomId || !checkIn || !checkOut || !guests || !customerName || !customerEmail) {
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
    
    if (conflictingBookings.length > 0) {
      return res.status(409).json({ error: 'Selected dates are not available. Please choose different dates.' });
    }
    
    // Create booking
    const booking = new Booking({
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guests,
      nights: nights || Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)),
      totalAmount: totalAmount || (room.price * (nights || Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)))),
      advancePaid: advancePaid || 0,
      paymentStatus: 'pending',
      customerName,
      customerEmail,
      customerPhone,
      paymentReference: `BK${Date.now()}` // Generate a simple reference
    });
    
  await booking.save();
    
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

// PUT update booking (for payment status updates)
router.put('/:id', async (req, res) => {
  try {
    const { paymentStatus, status, advancePaid } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { paymentStatus, status, advancePaid }, 
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
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
        pass: process.env.EMAIL_PASS || 'YOUR_NEW_APP_PASSWORD'
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

    // Send email
    console.log('Attempting to send email to:', customerEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    res.json({ message: 'Confirmation email sent successfully' });
    
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't fail the booking if email fails
    res.json({ message: 'Booking confirmed but email failed to send' });
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
                <li>No payment has been processed yet</li>
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

module.exports = router; 