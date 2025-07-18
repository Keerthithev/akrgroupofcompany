const express = require('express');
const router = express.Router();
const Company = require('../models/Company.cjs');

// GET /api/companies
router.get('/', async (req, res, next) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 