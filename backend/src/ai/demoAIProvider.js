'use strict';

/**
 * DemoAIProvider — deterministic AI engine that works without an API key.
 * Generates context-aware responses based on merchant data.
 */

const { aiInsights, customerSegmentSummary, campaigns, dashboardKPIs, products, dailySales } = require('../data/seedData');

// AI Response Templates based on intent detection
const intentPatterns = {
  sales: ['sales', 'revenue', 'income', 'earn', 'money', 'how much', 'profit'],
  customers: ['customer', 'clients', 'buyers', 'who', 'target', 'segment'],
  products: ['product', 'item', 'menu', 'dish', 'food', 'bestsell', 'popular', 'slow'],
  campaigns: ['campaign', 'promotion', 'offer', 'discount', 'marketing'],
  growth: ['grow', 'increase', 'boost', 'improve', 'better', 'more'],
  drop: ['drop', 'decline', 'down', 'low', 'fall', 'decreas', 'why'],
  best: ['best', 'top', 'highest', 'most'],
  repeat: ['repeat', 'return', 'loyal', 'retain', 'retention'],
  opportunity: ['opportunit', 'chance', 'potential', 'find'],
  help: ['help', 'what can', 'what should', 'suggest', 'recommend'],
};

function detectIntent(message) {
  const lower = message.toLowerCase();
  const intents = [];
  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    if (keywords.some(kw => lower.includes(kw))) {
      intents.push(intent);
    }
  }
  return intents;
}

function formatCurrency(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

const responseTemplates = {
  sales_growth: {
    text: `📊 **Sales Overview for Rajesh Family Restaurant**\n\nHere's what I found by analyzing your last 90 days:\n\n**Today's Performance:**\n- Revenue: ₹48,650 (+12.4% vs yesterday)\n- Transactions: 327 (+8.2%)\n- Average Order Value: ₹149\n\n**Key Insights:**\n1. 📈 Your weekly revenue is trending upward — you're on track for your best month.\n2. ⚠️ Weekday lunch revenue is **18% below baseline** (₹8,200 vs ₹10,000 target).\n3. 🌙 Your peak hours are **7 PM–9 PM** generating 35% of daily revenue.\n\n**My top recommendation:** Launch a weekday lunch offer to recover ₹18K–₹25K/month in lost revenue.\n\nWould you like me to create a lunch campaign?`,
    actions: [
      { id: 'a1', label: 'Create Lunch Campaign', type: 'primary', actionType: 'create_campaign', metadata: { insightId: 'ins-001' } },
      { id: 'a2', label: 'See Full Analytics', type: 'secondary', actionType: 'navigate_analytics', metadata: {} },
    ]
  },
  customers_target: {
    text: `👥 **Customer Intelligence Analysis**\n\nI've analyzed your 8,420 customers and found the highest-priority targets:\n\n**🔴 At-Risk High-Value Customers — Top Priority**\n- **214 customers** with avg ₹1,850/visit\n- Haven't returned in 30–45 days\n- Estimated recoverable revenue: **₹3.2L**\n- Re-engagement rate with personalized offer: 31%\n\n**🟡 Frequent Customers — Protect**\n- 580 customers averaging ₹8,200 total spend\n- Currently active but no loyalty reward\n- Recommendation: Launch a loyalty program\n\n**🟢 New Customers — Convert**\n- 412 new customers joined recently\n- Only 38% made a second purchase\n- A second-visit discount could push this to 55%+\n\n**My highest-confidence recommendation:** Target the 214 at-risk customers with a comeback campaign.\n\nShould I create it?`,
    actions: [
      { id: 'a1', label: 'Create Comeback Campaign', type: 'primary', actionType: 'create_campaign', metadata: { insightId: 'ins-002', audience: 'at_risk' } },
      { id: 'a2', label: 'View Customer Segments', type: 'secondary', actionType: 'navigate_customers', metadata: {} },
    ]
  },
  products_analysis: {
    text: `🍽️ **Product Performance Analysis**\n\nHere's how your menu is performing:\n\n**⭐ Top Performers:**\n1. **Butter Chicken** — 482 orders, ₹96,400 revenue (+14% growth)\n2. **Paneer Tikka** — 381 orders, ₹68,580 revenue (+9% growth)\n3. **Chicken Biryani** — 260 orders, ₹57,200 revenue (+18% 🔥)\n\n**⚠️ Needs Attention:**\n- **Veg Sandwich** — only 92 orders (↓21% decline over 8 weeks)\n\n**💡 AI Opportunities:**\n1. **Beverage Bundle**: Only 28% of Paneer Tikka orders include a drink (industry avg: 65%). A "Meal + Drink" bundle could add ₹12K–₹15K/month.\n2. **Biryani Promotion**: Chicken Biryani is your fastest growing item — promote it for evening dinner slots.\n\nWhich opportunity would you like to act on?`,
    actions: [
      { id: 'a1', label: 'Create Bundle Offer', type: 'primary', actionType: 'bundle_products', metadata: { insightId: 'ins-003' } },
      { id: 'a2', label: 'Promote Biryani', type: 'secondary', actionType: 'create_offer', metadata: { productId: 'p005' } },
    ]
  },
  sales_drop: {
    text: `🔍 **Sales Drop Analysis**\n\nI've analyzed the dip in your sales data. Here's what I found:\n\n**What happened:**\n- Weekday lunch revenue (12 PM–2 PM): **18% below 8-week average**\n- Tuesday and Wednesday are your weakest days (₹6,800 avg vs ₹9,200 on Mondays)\n\n**Why this is happening:**\n1. 📍 **Local competition**: A new lunch spot may have opened nearby (pattern consistent with competitive entry)\n2. 🗓️ **No active lunch promotion**: Your last lunch offer ended 45 days ago\n3. ☀️ **Seasonal pattern**: Late September lunch traffic typically drops 12–15% — but your drop is larger than seasonal\n\n**What to do:**\n- The fastest recovery is a **targeted lunch campaign** for your 1,240 previous lunch customers\n- Expected recovery: ₹18K–₹25K/month within 2–3 weeks\n\nShall I create a weekday lunch campaign right now?`,
    actions: [
      { id: 'a1', label: 'Yes, Create Campaign', type: 'primary', actionType: 'create_campaign', metadata: { insightId: 'ins-001' } },
      { id: 'a2', label: 'Show More Analysis', type: 'secondary', actionType: 'navigate_analytics', metadata: {} },
    ]
  },
  best_products: {
    text: `🏆 **Your Best-Selling Products**\n\n| Product | Orders | Revenue | Trend |\n|---|---|---|---|\n| 🥇 Butter Chicken | 482 | ₹96,400 | ↑ 14% |\n| 🥈 Paneer Tikka | 381 | ₹68,580 | ↑ 9% |\n| 🥉 Chicken Biryani | 260 | ₹57,200 | ↑ 18% 🔥 |\n| 4. Naan (4 pcs) | 620 | ₹49,600 | ↑ 3% |\n| 5. Dal Makhani | 310 | ₹49,600 | ↑ 6% |\n\n**💡 AI Insight:**\nChicken Biryani is your **fastest-growing item** (+18%) but only ranks #3 in revenue. It has strong potential — consider featuring it in your next evening campaign.\n\nAlso note: Naan (620 orders) is your highest-volume item as an attachment. Bundle it more prominently with main courses.`,
    actions: [
      { id: 'a1', label: 'Promote Biryani Tonight', type: 'primary', actionType: 'create_offer', metadata: { productId: 'p005' } },
      { id: 'a2', label: 'View All Products', type: 'secondary', actionType: 'navigate_products', metadata: {} },
    ]
  },
  repeat_customers: {
    text: `🔄 **Customer Retention Analysis**\n\nYour returning customer rate is **42%** — here's how to improve it:\n\n**Current State:**\n- 3,540 returning customers (42% of transactions)\n- 120 VIP customers (avg ₹22,500 total spend)\n- 1,240 at-risk customers (haven't returned in 25–45 days)\n\n**Gap vs Best-in-Class:**\n- Best restaurants achieve 55–65% returning customer rate\n- Your gap: 13–23 percentage points\n- Potential revenue at 55% retention: **+₹1.2L/month**\n\n**Action Plan:**\n1. **Immediate:** Target 214 at-risk high-value customers with a comeback offer (31% conversion rate)\n2. **Short-term:** Launch a loyalty points program for frequent customers\n3. **Long-term:** Personalized birthday/anniversary offers for VIPs\n\nWhich action would you like to take first?`,
    actions: [
      { id: 'a1', label: 'Target At-Risk Customers', type: 'primary', actionType: 'create_campaign', metadata: { insightId: 'ins-002' } },
      { id: 'a2', label: 'Design Loyalty Program', type: 'secondary', actionType: 'create_offer', metadata: { type: 'loyalty' } },
    ]
  },
  campaign_creation: {
    text: `📣 **Campaign Recommendations**\n\nBased on your current business data, here are 3 campaigns I recommend:\n\n**🥇 Priority 1: Weekday Lunch Boost** (Confidence: 92%)\n- Target: 1,240 lunch customers\n- Offer: 15% off between 12 PM–2 PM\n- Expected impact: ₹18K–₹25K/month\n- ROI estimate: 3.2x\n\n**🥈 Priority 2: Comeback Campaign for At-Risk Customers** (Confidence: 89%)\n- Target: 214 high-value inactive customers\n- Offer: ₹150 cashback on next visit\n- Expected impact: ₹3.2L recoverable revenue\n- ROI estimate: 4.1x\n\n**🥉 Priority 3: Beverage Bundle** (Confidence: 85%)\n- Target: All customers\n- Offer: Main course + drink bundle (10% off)\n- Expected impact: ₹12K–₹15K/month\n- ROI estimate: 2.8x\n\nWhich campaign should I create first?`,
    actions: [
      { id: 'a1', label: 'Create Lunch Campaign', type: 'primary', actionType: 'create_campaign', metadata: { insightId: 'ins-001' } },
      { id: 'a2', label: 'Create Comeback Campaign', type: 'secondary', actionType: 'create_campaign', metadata: { insightId: 'ins-002' } },
    ]
  },
  opportunity: {
    text: `🎯 **Your Biggest Growth Opportunity**\n\nI analyzed your sales, customers, products, and campaigns. Here's what I found:\n\n**#1 OPPORTUNITY: Recover At-Risk High-Value Customers**\n\n- **Who:** 214 customers with avg ₹1,850/visit history\n- **Status:** Haven't returned in 30–45 days\n- **Confidence:** 89%\n- **Estimated recoverable revenue:** ₹3.2L\n\n**Why I'm confident:**\n- These customers have proven spending behavior\n- Their absence aligns with a competitor's recent promotion (seasonal pattern)\n- Personalized comeback offers have 31% conversion rate for this segment\n- The cost of a ₹150 cashback offer is fully offset at 82 conversions\n\n**Action:** Launch a personalized comeback campaign in the next 48 hours before more customers churn.\n\nShall I create this campaign for your review?`,
    actions: [
      { id: 'a1', label: '🚀 Create Campaign', type: 'primary', actionType: 'create_campaign', metadata: { insightId: 'ins-002' } },
      { id: 'a2', label: 'Show Full Analysis', type: 'secondary', actionType: 'navigate_opportunities', metadata: {} },
      { id: 'a3', label: 'Not Now', type: 'secondary', actionType: 'dismiss', metadata: {} },
    ]
  },
  general_help: {
    text: `👋 **Hi Rajesh! I'm GrowthPilot, your AI business partner.**\n\nI've analyzed your last 90 days of business data. Here's what I can help you with:\n\n**📊 Business Analysis**\n- "How is my business performing?"\n- "Why did sales drop yesterday?"\n- "What's my revenue trend?"\n\n**👥 Customer Intelligence**\n- "Which customers should I target?"\n- "How can I increase repeat customers?"\n- "Who are my best customers?"\n\n**🛍️ Product Insights**\n- "What are my best-selling products?"\n- "Which items are underperforming?"\n- "What should I promote next?"\n\n**📣 Campaigns**\n- "Create a campaign for inactive customers"\n- "What promotion should I run this week?"\n\n**🎯 Growth**\n- "Find my biggest growth opportunity"\n- "How can I increase sales this week?"\n\nWhat would you like to explore?`,
    actions: [
      { id: 'a1', label: 'Find Biggest Opportunity', type: 'primary', actionType: 'run_growth_mission', metadata: {} },
      { id: 'a2', label: 'Create a Campaign', type: 'secondary', actionType: 'navigate_campaigns', metadata: {} },
    ]
  },
};

function generateDemoResponse(message) {
  const intents = detectIntent(message);
  
  // Match to best template
  if (intents.includes('drop') || (intents.includes('sales') && intents.includes('drop'))) {
    return responseTemplates.sales_drop;
  }
  if (intents.includes('opportunity') || (intents.includes('growth') && intents.includes('find'))) {
    return responseTemplates.opportunity;
  }
  if (intents.includes('campaigns') || (intents.includes('growth') && intents.includes('campaigns'))) {
    return responseTemplates.campaign_creation;
  }
  if (intents.includes('best') && intents.includes('products')) {
    return responseTemplates.best_products;
  }
  if (intents.includes('products')) {
    return responseTemplates.products_analysis;
  }
  if (intents.includes('repeat') || intents.includes('customers') && intents.includes('repeat')) {
    return responseTemplates.repeat_customers;
  }
  if (intents.includes('customers') || intents.includes('target')) {
    return responseTemplates.customers_target;
  }
  if (intents.includes('sales') || intents.includes('growth') || intents.includes('increase')) {
    return responseTemplates.sales_growth;
  }
  
  return responseTemplates.general_help;
}

module.exports = { generateDemoResponse };
