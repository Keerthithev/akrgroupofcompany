const express = require('express');
const router = express.Router();
const ManualRevenue = require('../models/ManualRevenue');
const { requireAdmin } = require('../middleware/auth');

// Get all manual revenue entries
router.get('/', requireAdmin, async (req, res) => {
  try {
    const revenues = await ManualRevenue.find().sort({ createdAt: -1 });
    res.json(revenues);
  } catch (error) {
    console.error('Error fetching manual revenues:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new manual revenue entry
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;
    
    const newRevenue = new ManualRevenue({
      type,
      amount: parseFloat(amount),
      description,
      date: date || new Date()
    });
    
    const savedRevenue = await newRevenue.save();
    res.status(201).json(savedRevenue);
  } catch (error) {
    console.error('Error adding manual revenue:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update manual revenue entry
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;
    
    const updatedRevenue = await ManualRevenue.findByIdAndUpdate(
      req.params.id,
      {
        type,
        amount: parseFloat(amount),
        description,
        date: date || new Date()
      },
      { new: true }
    );
    
    if (!updatedRevenue) {
      return res.status(404).json({ error: 'Revenue entry not found' });
    }
    
    res.json(updatedRevenue);
  } catch (error) {
    console.error('Error updating manual revenue:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete manual revenue entry
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedRevenue = await ManualRevenue.findByIdAndDelete(req.params.id);
    
    if (!deletedRevenue) {
      return res.status(404).json({ error: 'Revenue entry not found' });
    }
    
    res.json({ message: 'Revenue entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting manual revenue:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 