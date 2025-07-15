const express = require('express');
const router = express.Router();
const preBookingController = require('../controllers/preBookingController');

// Public: Create a new pre-booking
router.post('/', preBookingController.createPreBooking);

// Admin: Get all pre-bookings
router.get('/', preBookingController.getAllPreBookings);

// Admin: Update booking status
router.patch('/:id', preBookingController.updatePreBookingStatus);

module.exports = router; 