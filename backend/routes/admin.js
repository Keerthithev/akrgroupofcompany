const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware to protect admin routes
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

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// POST /api/admin/logout (client just deletes token)
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

// GET all admins (for dropdown)
router.get('/', requireAdmin, async (req, res) => {
  const admins = await Admin.find({}, '_id username');
  res.json(admins);
});

// GET /api/admin/dashboard (protected)
router.get('/dashboard', requireAdmin, async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const totalBookingsToday = await Booking.countDocuments({ createdAt: { $gte: today } });
  const totalBookingsMonth = await Booking.countDocuments({ createdAt: { $gte: monthStart } });
  const totalRooms = await Room.countDocuments();
  const activeCustomers = await User.countDocuments();
  const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
  res.json({
    totalBookingsToday,
    totalBookingsMonth,
    totalRooms,
    activeCustomers,
    recentBookings,
  });
});

module.exports = router; 