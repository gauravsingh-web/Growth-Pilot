'use strict';

const express = require('express');
const router = express.Router();
const seedData = require('../data/seedData');
const { v4: uuidv4 } = require('uuid');

// GET /api/actions/history
router.get('/history', (req, res) => {
  try {
    const sorted = [...seedData.aiActions].sort((a, b) => 
      new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime()
    );
    res.json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/actions/create-campaign
router.post('/create-campaign', (req, res) => {
  try {
    const { campaignData, insightId } = req.body;
    const action = {
      id: `act-${uuidv4().slice(0, 8)}`,
      type: 'create_campaign',
      title: `Campaign: ${campaignData.name}`,
      description: `Created ${campaignData.audience} campaign with offer: ${campaignData.offer}`,
      reason: insightId ? `Based on AI insight ${insightId}` : 'Merchant initiated',
      status: 'completed',
      initiatedBy: 'ai',
      initiatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      result: `Campaign ready. Targeting ${campaignData.audienceCount} customers.`,
      relatedInsightId: insightId || null,
      metadata: campaignData,
      canUndo: true,
    };
    seedData.aiActions.unshift(action);

    // Create in campaigns
    const newCampaign = {
      id: `camp-${uuidv4().slice(0, 8)}`,
      ...campaignData,
      status: 'active',
      reach: campaignData.audienceCount || 0,
      conversions: 0,
      revenueGenerated: 0,
      roi: 0,
      createdAt: new Date().toISOString(),
      createdBy: 'ai',
    };
    seedData.campaigns.unshift(newCampaign);

    res.json({ 
      success: true, 
      data: { action, campaign: newCampaign },
      message: 'Campaign created and launched successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/actions/create-offer
router.post('/create-offer', (req, res) => {
  try {
    const { offerData, insightId } = req.body;
    const action = {
      id: `act-${uuidv4().slice(0, 8)}`,
      type: 'create_offer',
      title: `Offer created: ${offerData.name || 'Special Offer'}`,
      description: offerData.description || 'New promotional offer',
      reason: 'AI-recommended offer based on product analysis',
      status: 'completed',
      initiatedBy: 'ai',
      initiatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      result: 'Offer is now live for eligible customers.',
      relatedInsightId: insightId || null,
      metadata: offerData,
      canUndo: true,
    };
    seedData.aiActions.unshift(action);
    res.json({ success: true, data: action, message: 'Offer created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/actions/send-customer-message
router.post('/send-customer-message', (req, res) => {
  try {
    const { segment, message, channel } = req.body;
    const action = {
      id: `act-${uuidv4().slice(0, 8)}`,
      type: 'send_message',
      title: `Message sent to ${segment} customers`,
      description: `Sent via ${channel || 'Paytm notification'}`,
      reason: 'AI-recommended customer communication',
      status: 'completed',
      initiatedBy: 'merchant',
      initiatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      result: 'Messages queued for delivery.',
      relatedInsightId: null,
      metadata: { segment, message, channel },
      canUndo: false,
    };
    seedData.aiActions.unshift(action);
    res.json({ success: true, data: action, message: 'Messages scheduled for delivery' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/actions/generate-business-report
router.post('/generate-business-report', (req, res) => {
  try {
    const action = {
      id: `act-${uuidv4().slice(0, 8)}`,
      type: 'generate_report',
      title: 'Business report generated',
      description: 'Comprehensive 30-day business analysis report',
      reason: 'Scheduled or merchant-requested report',
      status: 'completed',
      initiatedBy: 'ai',
      initiatedAt: new Date().toISOString(),
      approvedAt: null,
      completedAt: new Date().toISOString(),
      result: 'Report generated. 5 opportunities identified. Health score: 82/100.',
      relatedInsightId: null,
      metadata: { period: '30d', healthScore: 82, opportunities: 5 },
      canUndo: false,
    };
    seedData.aiActions.unshift(action);
    res.json({ success: true, data: action, message: 'Report generated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/actions/undo/:id
router.post('/undo/:id', (req, res) => {
  try {
    const action = seedData.aiActions.find(a => a.id === req.params.id);
    if (!action) return res.status(404).json({ success: false, error: 'Action not found' });
    if (!action.canUndo) return res.status(400).json({ success: false, error: 'This action cannot be undone' });
    
    action.status = 'cancelled';
    action.result = 'Action undone by merchant.';
    
    // If it was a campaign, remove it
    if (action.type === 'create_campaign' && action.metadata?.campaignId) {
      const idx = seedData.campaigns.findIndex(c => c.id === action.metadata.campaignId);
      if (idx !== -1) seedData.campaigns.splice(idx, 1);
    }

    res.json({ success: true, data: action, message: 'Action undone successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
