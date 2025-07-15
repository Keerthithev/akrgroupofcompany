const PreBooking = require('../models/PreBooking');
const { v4: uuidv4 } = require('uuid');

// Create a new pre-booking
exports.createPreBooking = async (req, res) => {
  try {
    const { fullName, email, phone, nationalId, address, vehicleModel, notes } = req.body;
    if (!fullName || !email || !phone || !nationalId || !address || !vehicleModel) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    const bookingId = 'AKR-' + uuidv4().split('-')[0].toUpperCase();
    const preBooking = new PreBooking({
      fullName,
      email,
      phone,
      nationalId,
      address,
      vehicleModel,
      notes,
      bookingId
    });
    await preBooking.save();
    res.status(201).json({ bookingId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create pre-booking.' });
  }
};

// Get all pre-bookings (admin)
exports.getAllPreBookings = async (req, res) => {
  try {
    const bookings = await PreBooking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pre-bookings.' });
  }
};

// Update pre-booking status (admin)
exports.updatePreBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'Ordered', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const booking = await PreBooking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
}; 