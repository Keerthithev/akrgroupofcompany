const express = require('express');
const router = express.Router();
const preBookingController = require('../controllers/preBookingController');

// POST /api/prebookings
router.post('/', preBookingController.createPreBooking);
// Add GET /api/prebookings
router.get('/', preBookingController.getAllPreBookings);
// Add PATCH /api/prebookings/:id
router.patch('/:id', preBookingController.updatePreBooking);

module.exports = router; 