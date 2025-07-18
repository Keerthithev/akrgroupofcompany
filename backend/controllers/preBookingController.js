const PreBooking = require('../models/PreBooking');

// Generate the next bookingId in the format 'akr-01', 'akr-02', ...
async function generateBookingId() {
  // Find the latest booking by bookingId (descending)
  const latest = await PreBooking.findOne({ bookingId: /^akr-\d+$/i })
    .sort({ createdAt: -1 })
    .lean();
  let nextNum = 1;
  if (latest && latest.bookingId) {
    const match = latest.bookingId.match(/akr-(\d+)/i);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }
  // Pad with leading zeros if needed (akr-01, akr-02, ...)
  const padded = String(nextNum).padStart(2, '0');
  return `akr-${padded}`;
}

// Create a new pre-booking
exports.createPreBooking = async (req, res, next) => {
  try {
    const bookingId = await generateBookingId();
    const preBooking = new PreBooking({ ...req.body, bookingId });
    await preBooking.save();
    res.status(201).json(preBooking);
  } catch (err) {
    next(err);
  }
};

// Get all pre-bookings
exports.getAllPreBookings = async (req, res, next) => {
  try {
    const preBookings = await PreBooking.find().sort({ createdAt: -1 });
    res.json(preBookings);
  } catch (err) {
    next(err);
  }
};

// Update a pre-booking by ID
exports.updatePreBooking = async (req, res, next) => {
  try {
    const preBooking = await PreBooking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!preBooking) return res.status(404).json({ message: 'Pre-booking not found' });
    res.json(preBooking);
  } catch (err) {
    next(err);
  }
}; 