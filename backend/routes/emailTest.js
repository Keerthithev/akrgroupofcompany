const express = require('express');
const router = express.Router();
const { testEmailConnection, sendEmailWithRetry } = require('../utils/emailConfig');
const { sendReviewInvitation } = require('../utils/emailService');
const { sendReviewInvitation: cloudSendReviewInvitation } = require('../utils/emailServiceCloud');

// Test email connection
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing email connection...');
    
    const result = await testEmailConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Email test successful',
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test sending email to specific address
router.post('/test-send', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    const mailOptions = {
      from: `"AKR Hotel Test" <keerthiganthevarasa@gmail.com>`,
      to: to,
      subject: subject || 'Test Email from AKR Hotel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Test Email from AKR Hotel System</h2>
          <p>This is a test email to verify that the email system is working correctly.</p>
          <p><strong>Message:</strong> ${message || 'No message provided'}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email. Please ignore if you received this by mistake.
          </p>
        </div>
      `
    };
    
    const result = await sendEmailWithRetry(mailOptions);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Test email send failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get email configuration (without sensitive data)
router.get('/config', (req, res) => {
  res.json({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com',
    hasPassword: !!(process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Test review invitation email specifically
router.post('/test-review-invitation', async (req, res) => {
  try {
    console.log('🧪 Testing review invitation email...');
    
    const testBooking = {
      _id: 'test_booking_deployment_' + Date.now(),
      customerName: 'Test Customer',
      customerEmail: req.body.email || 'keerthiganthevarasa@gmail.com',
      checkIn: new Date('2025-01-15'),
      checkOut: new Date('2025-01-17')
    };

    const testRoom = {
      _id: 'test_room_deployment_' + Date.now(),
      name: 'Test Room 101'
    };

    console.log('📧 Environment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
    console.log('SMTP_USER:', process.env.SMTP_USER || 'keerthiganthevarasa@gmail.com');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:8082');
    
    const result = await sendReviewInvitation(testBooking, testRoom);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Review invitation email sent successfully',
        messageId: result.result.messageId,
        reviewToken: result.reviewToken,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Review invitation test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple email test endpoint
router.get('/simple-test', async (req, res) => {
  try {
    console.log('🧪 Simple email test...');
    
    const nodemailer = require('nodemailer');
    
    // Try the simplest possible configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'keerthiganthevarasa@gmail.com',
        pass: 'rvnh sfki ilmg qizs'
      }
    });
    
    console.log('📧 Testing connection...');
    await transporter.verify();
    console.log('✅ Connection verified!');
    
    const result = await transporter.sendMail({
      from: 'keerthiganthevarasa@gmail.com',
      to: 'keerthiganthevarasa@gmail.com',
      subject: 'Simple Test Email',
      text: 'This is a simple test email from Render deployment.'
    });
    
    res.json({
      success: true,
      message: 'Simple email test successful',
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Simple email test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

// Test cloud email service specifically
router.post('/test-cloud-email', async (req, res) => {
  try {
    console.log('🌐 Testing cloud email service...');
    
    const testBooking = {
      _id: 'test_cloud_booking_' + Date.now(),
      customerName: 'Test Customer',
      customerEmail: req.body.email || 'keerthiganthevarasa@gmail.com',
      checkIn: new Date('2025-01-15'),
      checkOut: new Date('2025-01-17')
    };

    const testRoom = {
      _id: 'test_cloud_room_' + Date.now(),
      name: 'Test Room 101'
    };

    console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
    console.log('🌐 Testing cloud-optimized email service...');
    
    const result = await cloudSendReviewInvitation(testBooking, testRoom);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Cloud email service test successful',
        messageId: result.result.messageId,
        reviewToken: result.reviewToken,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Cloud email test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 