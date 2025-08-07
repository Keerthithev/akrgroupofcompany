const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
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

// GET homepage settings
router.get('/', async (req, res) => {
  const settings = await Settings.findOne();
  res.json(settings);
});

// PUT update settings (admin only)
router.put('/', requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create new settings if none exist
      settings = new Settings(req.body);
      await settings.save();
    } else {
      // Use findOneAndUpdate to avoid version conflicts
      settings = await Settings.findOneAndUpdate(
        { _id: settings._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
    }
    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router; 