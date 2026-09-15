'use strict';

const express = require('express');
const router = express.Router();
const seedData = require('../data/seedData');

// GET /api/analytics/sales
router.get('/sales', (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period, 10);
    const data = seedData.dailySales.slice(-days);
    res.json({ success: true, data, period: days });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/hourly
router.get('/hourly', (req, res) => {
  try {
    res.json({ success: true, data: seedData.hourlySales });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/dashboard
router.get('/dashboard', (req, res) => {
  try {
    const recent = seedData.dailySales.slice(-7);
    const weekRevenue = recent.reduce((s, d) => s + d.revenue, 0);
    const monthRevenue = seedData.dailySales.slice(-30).reduce((s, d) => s + d.revenue, 0);
    
    res.json({
      success: true,
      data: {
        kpis: seedData.dashboardKPIs,
        weekRevenue,
        monthRevenue,
        recentDays: recent,
        merchant: seedData.merchant,
        unreadInsights: seedData.aiInsights.filter(i => !i.isRead).length,
        activeActions: seedData.aiActions.filter(a => a.status === 'completed').length,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/category
router.get('/category', (req, res) => {
  try {
    const categorySales = {};
    seedData.products.forEach(p => {
      if (!categorySales[p.category]) {
        categorySales[p.category] = { category: p.category, revenue: 0, transactions: 0 };
      }
      categorySales[p.category].revenue += p.totalRevenue;
      categorySales[p.category].transactions += p.totalOrders;
    });
    
    const total = Object.values(categorySales).reduce((s, c) => s + c.revenue, 0);
    const result = Object.values(categorySales).map(c => ({
      ...c,
      percentage: parseFloat(((c.revenue / total) * 100).toFixed(1)),
    })).sort((a, b) => b.revenue - a.revenue);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
