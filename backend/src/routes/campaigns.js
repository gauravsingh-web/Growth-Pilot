'use strict';

const express = require('express');
const router = express.Router();
const seedData = require('../data/seedData');
const { v4: uuidv4 } = require('uuid');

// GET /api/campaigns
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let campaigns = seedData.campaigns;
    if (status && status !== 'all') {
      campaigns = campaigns.filter(c => c.status === status);
    }
    res.json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/campaigns/create
router.post('/create', (req, res) => {
  try {
    const { name, description, audience, audienceCount, offer, discountPercent, startDate, endDate, insightId } = req.body;
    
    if (!name || !audience) {
      return res.status(400).json({ success: false, error: 'Name and audience are required' });
    }

    const newCampaign = {
      id: `camp-${uuidv4().slice(0, 8)}`,
      name,
      description: description || '',
      audience,
      audienceCount: audienceCount || 0,
      offer: offer || '',
      discountPercent: discountPercent || null,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || null,
      status: 'active',
      reach: audienceCount || 0,
      conversions: 0,
      revenueGenerated: 0,
      roi: 0,
      createdAt: new Date().toISOString(),
      createdBy: 'ai',
      aiConfidence: 92,
    };

    seedData.campaigns.unshift(newCampaign);

    // Add action to history
    seedData.aiActions.unshift({
      id: `act-${uuidv4().slice(0, 8)}`,
      type: 'create_campaign',
      title: `Created campaign: ${name}`,
      description: `AI-generated campaign for ${audience}`,
      reason: insightId ? `Based on AI insight: ${insightId}` : 'Merchant requested campaign creation',
      status: 'completed',
      initiatedBy: 'ai',
      initiatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      result: `Campaign "${name}" created and scheduled for ${audienceCount || 0} customers.`,
      relatedInsightId: insightId || null,
      metadata: { campaignId: newCampaign.id, audienceCount },
      canUndo: true,
    });

    res.json({ success: true, data: newCampaign, message: 'Campaign created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/campaigns/:id/launch
router.post('/:id/launch', (req, res) => {
  try {
    const campaign = seedData.campaigns.find(c => c.id === req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    campaign.status = 'active';
    res.json({ success: true, data: campaign, message: 'Campaign launched successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/campaigns/:id/pause
router.post('/:id/pause', (req, res) => {
  try {
    const campaign = seedData.campaigns.find(c => c.id === req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    campaign.status = 'paused';
    res.json({ success: true, data: campaign, message: 'Campaign paused' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
