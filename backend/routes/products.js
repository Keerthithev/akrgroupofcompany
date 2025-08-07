const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
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

// GET all products (public)
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// POST create product (admin)
router.post('/', requireAdmin, async (req, res) => {
  const { name, description, image, price } = req.body;
  const product = new Product({ name, description, image, price });
  await product.save();
  res.status(201).json(product);
});

// PUT update product (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, description, image, price } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, image, price },
    { new: true }
  );
  res.json(product);
});

// DELETE product (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router; 