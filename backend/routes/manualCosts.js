const express = require('express');
const router = express.Router();
const ManualCost = require('../models/ManualCost');
const { requireAdmin } = require('../middleware/auth');

// Get all manual cost entries
router.get('/', requireAdmin, async (req, res) => {
  try {
    const costs = await ManualCost.find().sort({ createdAt: -1 });
    res.json(costs);
  } catch (error) {
    console.error('Error fetching manual costs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new manual cost entry
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { category, amount, description, date, paymentMethod } = req.body;
    
    const newCost = new ManualCost({
      category,
      amount: parseFloat(amount),
      description,
      date: date || new Date(),
      paymentMethod: paymentMethod || 'Cash'
    });
    
    const savedCost = await newCost.save();
    res.status(201).json(savedCost);
  } catch (error) {
    console.error('Error adding manual cost:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update manual cost entry
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { category, amount, description, date, paymentMethod } = req.body;
    
    const updatedCost = await ManualCost.findByIdAndUpdate(
      req.params.id,
      {
        category,
        amount: parseFloat(amount),
        description,
        date: date || new Date(),
        paymentMethod: paymentMethod || 'Cash'
      },
      { new: true }
    );
    
    if (!updatedCost) {
      return res.status(404).json({ error: 'Cost entry not found' });
    }
    
    res.json(updatedCost);
  } catch (error) {
    console.error('Error updating manual cost:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete manual cost entry
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedCost = await ManualCost.findByIdAndDelete(req.params.id);
    
    if (!deletedCost) {
      return res.status(404).json({ error: 'Cost entry not found' });
    }
    
    res.json({ message: 'Cost entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting manual cost:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 