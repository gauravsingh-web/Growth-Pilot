'use strict';

/**
 * AIService — orchestrates between GeminiProvider and DemoAIProvider.
 * Falls back to DemoAIProvider when Gemini is unavailable.
 */

const { generateDemoResponse } = require('./demoAIProvider');
const GeminiProvider = require('./geminiProvider');
const seedData = require('../data/seedData');

class AIService {
  constructor() {
    this.gemini = null;
    this.useGemini = false;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      console.log('[AIService] Gemini API key found — using GeminiProvider');
      this.gemini = new GeminiProvider(process.env.GEMINI_API_KEY);
      this.useGemini = true;
    } else {
      console.log('[AIService] No Gemini API key — using DemoAIProvider');
    }
  }

  getMerchantContext() {
    const { merchant, dashboardKPIs, customerSegmentSummary, products, campaigns, aiInsights, dailySales } = seedData;
    
    const topProducts = [...products].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
    const slowProducts = [...products].sort((a, b) => a.trend - b.trend).slice(0, 3);
    
    return {
      merchant,
      salesMetrics: {
        todayRevenue: dashboardKPIs.todayRevenue,
        todayTransactions: dashboardKPIs.todayTransactions,
        averageOrderValue: dashboardKPIs.averageOrderValue,
        weekRevenue: dailySales.slice(-7).reduce((s, d) => s + d.revenue, 0),
        monthRevenue: dailySales.slice(-30).reduce((s, d) => s + d.revenue, 0),
        revenueChange: dashboardKPIs.revenueChange,
        transactionChange: dashboardKPIs.transactionsChange,
        aovChange: dashboardKPIs.aovChange,
      },
      customerSegments: {
        total: 8420,
        new: 412,
        returning: 3540,
        inactive: 2000,
        vip: 120,
        atRisk: 1240,
      },
      productPerformance: { topProducts, slowProducts },
      campaigns,
      historicalTrends: dailySales.slice(-30),
      businessHours: { open: '08:00', close: '23:00' },
      healthScore: dashboardKPIs.healthScore,
      opportunities: aiInsights,
    };
  }

  async chat(message) {
    const context = this.getMerchantContext();

    if (this.useGemini && this.gemini && this.gemini.available) {
      try {
        const geminiResp = await this.gemini.generateResponse(message, context);
        return {
          success: true,
          source: 'gemini',
          response: geminiResp,
        };
      } catch (err) {
        console.warn('[AIService] Gemini failed, falling back to Demo:', err.message);
      }
    }

    // Demo fallback
    const demoResp = generateDemoResponse(message);
    return {
      success: true,
      source: 'demo',
      response: demoResp,
    };
  }

  async runGrowthMission() {
    // Simulated multi-step AI analysis
    return {
      success: true,
      mission: {
        title: 'Recover At-Risk High-Value Customers',
        description: 'Your biggest untapped growth opportunity based on 90 days of data.',
        potentialCustomers: 214,
        avgHistoricalSpend: 1850,
        estimatedRecoverableRevenue: 320000,
        confidence: 89,
        analysis: {
          sales: { completed: true, finding: 'Revenue growing at 12.4% but customer retention declining' },
          customers: { completed: true, finding: '214 high-value customers at risk of churn' },
          products: { completed: true, finding: 'Top products performing well; opportunity in beverages' },
          campaigns: { completed: true, finding: 'No active retention campaign for at-risk segment' },
          timing: { completed: true, finding: 'Optimal campaign launch window: now (within 48 hours)' },
        },
        recommendedAction: {
          type: 'create_campaign',
          label: 'Launch Personalized Comeback Campaign',
          insightId: 'ins-002',
          campaign: {
            name: 'Come Back, We Miss You!',
            audience: 'At-risk high-value customers (214)',
            offer: '₹150 cashback on next visit above ₹600',
            channel: 'WhatsApp + Paytm notification',
            expectedConversions: 66,
            expectedRevenue: 122100,
            roi: 4.1,
          }
        }
      }
    };
  }

  generateCampaignPreview(insightId) {
    const campaignTemplates = {
      'ins-001': {
        name: 'Weekday Lunch Boost',
        description: 'Targeted lunch promotion for previous lunch visitors',
        audience: 'Customers who purchased during lunch in the last 90 days',
        audienceCount: 1240,
        offer: '15% off all orders between 12 PM–2 PM',
        discountPercent: 15,
        schedule: 'Monday to Friday, 12:00 PM – 2:00 PM',
        duration: '30 days',
        estimatedReach: 1240,
        estimatedConversions: 174,
        estimatedRevenue: { min: 18000, max: 25000 },
        estimatedROI: 3.2,
        confidence: 92,
        channels: ['Paytm notification', 'SMS'],
      },
      'ins-002': {
        name: 'Come Back, We Miss You!',
        description: 'Personalized comeback campaign for at-risk high-value customers',
        audience: 'At-risk high-value customers (not visited in 30–45 days)',
        audienceCount: 214,
        offer: '₹150 cashback on orders above ₹600',
        discountPercent: null,
        schedule: 'Send immediately, valid for 14 days',
        duration: '14 days',
        estimatedReach: 214,
        estimatedConversions: 66,
        estimatedRevenue: { min: 110000, max: 140000 },
        estimatedROI: 4.1,
        confidence: 89,
        channels: ['Paytm notification', 'WhatsApp'],
      },
      'ins-003': {
        name: 'Meal + Drink Bundle Special',
        description: 'Bundle main course with beverage for higher AOV',
        audience: 'All customers',
        audienceCount: 8420,
        offer: 'Any main course + any drink at 10% off',
        discountPercent: 10,
        schedule: 'Ongoing',
        duration: '30 days',
        estimatedReach: 8420,
        estimatedConversions: 890,
        estimatedRevenue: { min: 12000, max: 15000 },
        estimatedROI: 2.8,
        confidence: 85,
        channels: ['Paytm notification', 'In-store display'],
      },
    };

    return campaignTemplates[insightId] || campaignTemplates['ins-001'];
  }
}

module.exports = new AIService();
