const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Room = require('../models/Room');

// JWT middleware for admin authentication
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = auth.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET all reviews (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('roomId', 'name category');
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all reviews for a room
router.get('/room/:roomId', async (req, res) => {
  try {
    const reviews = await Review.find({ roomId: req.params.roomId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create a new review
router.post('/', async (req, res) => {
  try {
    const { roomId, customerName, customerEmail, rating, review, stayDate } = req.body;

    // Validate input
    if (!roomId || !customerName || !customerEmail || !rating || !review || !stayDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (review.length < 10 || review.length > 500) {
      return res.status(400).json({ error: 'Review must be between 10 and 500 characters' });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Create new review
    const newReview = new Review({
      roomId,
      customerName,
      customerEmail,
      rating,
      review,
      stayDate: new Date(stayDate)
    });

    await newReview.save();

    // Update room's average rating
    await updateRoomRating(roomId);

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update review helpful count
router.put('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.helpful += 1;
    await review.save();

    res.json({ helpful: review.helpful });
  } catch (error) {
    console.error('Error updating helpful count:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE review (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);
    
    // Update room's average rating after deletion
    await updateRoomRating(review.roomId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET room rating statistics
router.get('/room/:roomId/stats', async (req, res) => {
  try {
    const reviews = await Review.find({ roomId: req.params.roomId });
    
    if (reviews.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    res.json({
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Function to update room's average rating
async function updateRoomRating(roomId) {
  try {
    const reviews = await Review.find({ roomId });
    
    if (reviews.length === 0) {
      await Room.findByIdAndUpdate(roomId, { 
        rating: 0, 
        reviewCount: 0 
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Room.findByIdAndUpdate(roomId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Error updating room rating:', error);
  }
}

module.exports = router; 