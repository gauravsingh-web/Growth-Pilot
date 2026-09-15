'use strict';

const express = require('express');
const router = express.Router();
const seedData = require('../data/seedData');

// GET /api/customers
router.get('/', (req, res) => {
  try {
    const { segment, limit = 50, offset = 0 } = req.query;
    let customers = seedData.customers;
    
    if (segment && segment !== 'all') {
      customers = customers.filter(c => c.segment === segment);
    }
    
    const total = customers.length;
    const paginated = customers.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({ success: true, data: paginated, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/customers/segments
router.get('/segments', (req, res) => {
  try {
    res.json({ success: true, data: seedData.customerSegmentSummary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/customers/summary
router.get('/summary', (req, res) => {
  try {
    const summary = {
      total: 8420,
      new: 412,
      returning: 3540,
      inactive: 2000,
      vip: 120,
      atRisk: 1240,
      frequent: 580,
      highValue: 210,
    };
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', (req, res) => {
  try {
    const customer = seedData.customers.find(c => c.id === req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
