const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Review = require('../models/Review');
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
  try {
    const rooms = await Room.find();
    
    // Fetch reviews for each room
    const roomsWithReviews = await Promise.all(
      rooms.map(async (room) => {
        const reviews = await Review.find({ roomId: room._id }).sort({ createdAt: -1 });
        const roomObj = room.toObject();
        roomObj.reviews = reviews;
        
        // Calculate average rating and review count
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          roomObj.averageRating = (totalRating / reviews.length).toFixed(1);
          roomObj.reviewCount = reviews.length;
        } else {
          roomObj.averageRating = 0;
          roomObj.reviewCount = 0;
        }
        
        return roomObj;
      })
    );
    
    res.json(roomsWithReviews);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    // Fetch reviews for this room
    const reviews = await Review.find({ roomId: room._id }).sort({ createdAt: -1 });
    const roomObj = room.toObject();
    roomObj.reviews = reviews;
    
    // Calculate average rating and review count
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      roomObj.averageRating = (totalRating / reviews.length).toFixed(1);
      roomObj.reviewCount = reviews.length;
    } else {
      roomObj.averageRating = 0;
      roomObj.reviewCount = 0;
    }
    
    res.json(roomObj);
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