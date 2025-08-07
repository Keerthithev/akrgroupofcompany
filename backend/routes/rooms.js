const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
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

// GET all rooms
router.get('/', async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

// GET single room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST add room (admin)
router.post('/', requireAdmin, async (req, res) => {
  const room = new Room(req.body);
  await room.save();
  res.json(room);
});

// PUT update room (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(room);
});

// DELETE room (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router; 