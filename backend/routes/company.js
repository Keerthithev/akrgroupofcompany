const express = require('express');
const router = express.Router();
const Company = require('../models/Company.cjs');

// List all companies
router.get('/', async (req, res, next) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    next(err);
  }
});

// Get company details
router.get('/:companyId', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.companyId).populate('vehicles');
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 