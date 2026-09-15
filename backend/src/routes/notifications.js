'use strict';

const express = require('express');
const router = express.Router();
const seedData = require('../data/seedData');

// GET /api/notifications
router.get('/', (req, res) => {
  try {
    res.json({ success: true, data: seedData.notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/mark-read/:id
router.post('/mark-read/:id', (req, res) => {
  try {
    const notif = seedData.notifications.find(n => n.id === req.params.id);
    if (notif) notif.isRead = true;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', (req, res) => {
  try {
    seedData.notifications.forEach(n => { n.isRead = true; });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
