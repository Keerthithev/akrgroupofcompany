const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

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

// GET all users (admin)
router.get('/', requireAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// POST register user
router.post('/', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// GET user's bookings
router.get('/:id/bookings', async (req, res) => {
  const bookings = await Booking.find({ user: req.params.id }).populate('room');
  res.json(bookings);
});

module.exports = router; 