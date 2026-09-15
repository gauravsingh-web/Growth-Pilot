'use strict';

const express = require('express');
const router = express.Router();
const seedData = require('../data/seedData');

// GET /api/products
router.get('/', (req, res) => {
  try {
    const { sort = 'revenue', order = 'desc' } = req.query;
    let prods = [...seedData.products];
    
    if (sort === 'revenue') prods.sort((a, b) => order === 'desc' ? b.totalRevenue - a.totalRevenue : a.totalRevenue - b.totalRevenue);
    else if (sort === 'orders') prods.sort((a, b) => order === 'desc' ? b.totalOrders - a.totalOrders : a.totalOrders - b.totalOrders);
    else if (sort === 'trend') prods.sort((a, b) => order === 'desc' ? b.trend - a.trend : a.trend - b.trend);
    
    res.json({ success: true, data: prods });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/top
router.get('/top', (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const top = [...seedData.products].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, parseInt(limit));
    res.json({ success: true, data: top });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/slow
router.get('/slow', (req, res) => {
  try {
    const slow = [...seedData.products].filter(p => p.trend < 0).sort((a, b) => a.trend - b.trend);
    res.json({ success: true, data: slow });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
