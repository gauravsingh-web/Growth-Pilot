'use strict';

const express = require('express');
const router = express.Router();
const seedData = require('../data/seedData');
const aiService = require('../ai/aiService');
const { v4: uuidv4 } = require('uuid');

// GET /api/ai/insights
router.get('/insights', (req, res) => {
  try {
    res.json({ success: true, data: seedData.aiInsights });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ai/opportunities
router.get('/opportunities', (req, res) => {
  try {
    const sorted = [...seedData.aiInsights].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    res.json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const result = await aiService.chat(message.trim());
    res.json(result);
  } catch (err) {
    console.error('[AI Chat Error]', err);
    res.status(500).json({ 
      success: false, 
      error: 'AI analysis temporarily unavailable',
      fallback: true,
    });
  }
});

// POST /api/ai/growth-mission
router.post('/growth-mission', async (req, res) => {
  try {
    const result = await aiService.runGrowthMission();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ai/campaign-preview/:insightId
router.get('/campaign-preview/:insightId', (req, res) => {
  try {
    const preview = aiService.generateCampaignPreview(req.params.insightId);
    res.json({ success: true, data: preview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/mark-insight-read/:id
router.post('/mark-insight-read/:id', (req, res) => {
  try {
    const insight = seedData.aiInsights.find(i => i.id === req.params.id);
    if (insight) insight.isRead = true;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
