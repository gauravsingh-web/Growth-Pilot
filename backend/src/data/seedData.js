'use strict';

const { v4: uuidv4 } = require('uuid');

// Seeded random number generator for deterministic data
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seededRandom(42);

function randBetween(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  return parseFloat((rand() * (max - min) + min).toFixed(decimals));
}

function pickRandom(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

// =============================================================
// MERCHANT
// =============================================================
const merchant = {
  id: 'merchant-001',
  name: 'Rajesh Kumar',
  businessName: 'Rajesh Family Restaurant',
  category: 'Restaurant',
  location: 'Karol Bagh, New Delhi, India',
  phone: '+91-98765-43210',
  email: 'rajesh@rajeshrestaurant.com',
  joinedDate: '2022-03-15',
  paytmMerchantId: 'PTM-MRC-2022-00814'
};

// =============================================================
// PRODUCTS
// =============================================================
const products = [
  { id: 'p001', name: 'Butter Chicken', category: 'Main Course', price: 200, baseOrders: 480, trend: 14, aiInsight: 'High demand — your bestseller', attachmentRate: 0.42 },
  { id: 'p002', name: 'Paneer Tikka', category: 'Starter', price: 180, baseOrders: 380, trend: 9, aiInsight: 'Strong opportunity for beverage bundle', attachmentRate: 0.28 },
  { id: 'p003', name: 'Dal Makhani', category: 'Main Course', price: 160, baseOrders: 310, trend: 6, aiInsight: 'Consistent performer', attachmentRate: 0.55 },
  { id: 'p004', name: 'Naan (4 pcs)', category: 'Bread', price: 80, baseOrders: 620, trend: 3, aiInsight: 'High attachment item — pairs well with main courses', attachmentRate: 0.78 },
  { id: 'p005', name: 'Chicken Biryani', category: 'Rice', price: 220, baseOrders: 260, trend: 18, aiInsight: 'Fast growing — consider promoting at dinner', attachmentRate: 0.31 },
  { id: 'p006', name: 'Masala Chai', category: 'Beverages', price: 40, baseOrders: 190, trend: -5, aiInsight: 'Low attach rate despite high margin', attachmentRate: 0.22 },
  { id: 'p007', name: 'Mango Lassi', category: 'Beverages', price: 80, baseOrders: 142, trend: 12, aiInsight: 'Growing summer demand', attachmentRate: 0.18 },
  { id: 'p008', name: 'Veg Sandwich', category: 'Snacks', price: 120, baseOrders: 92, trend: -21, aiInsight: 'Declining — consider promotion or removal', attachmentRate: 0.08 },
  { id: 'p009', name: 'Gulab Jamun', category: 'Dessert', price: 80, baseOrders: 185, trend: 7, aiInsight: 'Good cross-sell with main course meals', attachmentRate: 0.25 },
  { id: 'p010', name: 'Tandoori Chicken', category: 'Starter', price: 240, baseOrders: 210, trend: 11, aiInsight: 'Weekend peak item', attachmentRate: 0.36 },
  { id: 'p011', name: 'Veg Thali', category: 'Combo', price: 180, baseOrders: 320, trend: 4, aiInsight: 'Popular lunch option', attachmentRate: 0.60 },
  { id: 'p012', name: 'Fish Curry', category: 'Main Course', price: 260, baseOrders: 145, trend: 8, aiInsight: 'Niche but loyal customer base', attachmentRate: 0.42 },
];

// Compute totals for products
const productsWithTotals = products.map(p => ({
  ...p,
  totalOrders: p.baseOrders,
  totalRevenue: p.baseOrders * p.price,
}));

// =============================================================
// CUSTOMERS (8,420 total — generate sample of 200 for API)
// =============================================================
const firstNames = ['Amit', 'Priya', 'Rahul', 'Sunita', 'Vikram', 'Anjali', 'Ravi', 'Pooja', 'Sanjay', 'Deepa',
  'Arjun', 'Kavita', 'Rohit', 'Meera', 'Nikhil', 'Shreya', 'Aakash', 'Divya', 'Manish', 'Rekha',
  'Suresh', 'Nisha', 'Ramesh', 'Geeta', 'Vivek', 'Anita', 'Kiran', 'Suman', 'Pankaj', 'Lata'];
const lastNames = ['Sharma', 'Gupta', 'Singh', 'Kumar', 'Verma', 'Mehta', 'Joshi', 'Patel', 'Yadav', 'Mishra',
  'Agarwal', 'Saxena', 'Kapoor', 'Malhotra', 'Srivastava', 'Dubey', 'Tiwari', 'Pandey', 'Chauhan', 'Bhatt'];

const segmentDistribution = [
  { segment: 'vip', count: 120, minSpend: 15000, maxSpend: 45000, minOrders: 40, maxOrders: 120, daysSinceLastPurchase: [1, 14] },
  { segment: 'frequent', count: 580, minSpend: 5000, maxSpend: 15000, minOrders: 15, maxOrders: 40, daysSinceLastPurchase: [1, 21] },
  { segment: 'high-value', count: 210, minSpend: 8000, maxSpend: 30000, minOrders: 10, maxOrders: 30, daysSinceLastPurchase: [1, 30] },
  { segment: 'new', count: 412, minSpend: 200, maxSpend: 1500, minOrders: 1, maxOrders: 3, daysSinceLastPurchase: [1, 30] },
  { segment: 'occasional', count: 3858, minSpend: 500, maxSpend: 4000, minOrders: 3, maxOrders: 12, daysSinceLastPurchase: [14, 60] },
  { segment: 'at-risk', count: 1240, minSpend: 2000, maxSpend: 8000, minOrders: 8, maxOrders: 25, daysSinceLastPurchase: [25, 45] },
  { segment: 'inactive', count: 2000, minSpend: 500, maxSpend: 3000, minOrders: 2, maxOrders: 10, daysSinceLastPurchase: [60, 120] },
];

const customers = [];
const today = new Date('2026-09-16');

segmentDistribution.forEach(({ segment, count, minSpend, maxSpend, minOrders, maxOrders, daysSinceLastPurchase }) => {
  const sampleCount = Math.min(count, Math.max(5, Math.floor(count * 0.025)));
  for (let i = 0; i < sampleCount; i++) {
    const firstName = pickRandom(firstNames);
    const lastName = pickRandom(lastNames);
    const orderCount = randBetween(minOrders, maxOrders);
    const totalSpend = randBetween(minSpend, maxSpend);
    const daysSince = randBetween(daysSinceLastPurchase[0], daysSinceLastPurchase[1]);
    const lastPurchase = new Date(today);
    lastPurchase.setDate(lastPurchase.getDate() - daysSince);
    const firstPurchase = new Date(lastPurchase);
    firstPurchase.setDate(firstPurchase.getDate() - randBetween(30, 365));

    customers.push({
      id: `cust-${segment}-${i}`,
      name: `${firstName} ${lastName}`,
      phone: `+91-${randBetween(70000, 99999)}-${randBetween(10000, 99999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      firstPurchaseDate: firstPurchase.toISOString().split('T')[0],
      lastPurchaseDate: lastPurchase.toISOString().split('T')[0],
      totalSpend,
      orderCount,
      averageOrderValue: Math.round(totalSpend / orderCount),
      segment,
      preferredCategory: pickRandom(['Main Course', 'Starter', 'Rice', 'Combo']),
      location: pickRandom(['Karol Bagh', 'Rajouri Garden', 'Pitampura', 'Rohini', 'Patel Nagar', 'Subhash Nagar']),
    });
  }
});

// =============================================================
// TRANSACTIONS (90 days)
// =============================================================
const paymentMethods = ['upi', 'card', 'cash', 'wallet'];
const timeSlots = [
  { slot: 'morning', hours: [8, 9, 10, 11], weight: 0.12 },
  { slot: 'lunch', hours: [12, 13, 14], weight: 0.28 },
  { slot: 'afternoon', hours: [15, 16, 17], weight: 0.10 },
  { slot: 'evening', hours: [18, 19], weight: 0.18 },
  { slot: 'night', hours: [19, 20, 21, 22], weight: 0.32 },
];

const transactions = [];
const startDate = new Date(today);
startDate.setDate(startDate.getDate() - 90);

for (let d = 0; d < 90; d++) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + d);
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Weekend has more transactions
  const baseTransactions = isWeekend ? randBetween(380, 430) : randBetween(280, 350);
  
  // Recent days have slightly higher numbers (growth trend)
  const growthFactor = 1 + (d / 90) * 0.12;
  const dayTransactions = Math.floor(baseTransactions * growthFactor);

  for (let t = 0; t < dayTransactions; t++) {
    // Pick time slot
    const timeRoll = rand();
    let cumulative = 0;
    let slot = timeSlots[0];
    for (const ts of timeSlots) {
      cumulative += ts.weight;
      // Reduce lunch on weekdays
      const adjustedWeight = !isWeekend && ts.slot === 'lunch' ? ts.weight * 0.75 : ts.weight;
      if (timeRoll < adjustedWeight + (cumulative - ts.weight)) { slot = ts; break; }
      if (timeRoll < cumulative) { slot = ts; break; }
    }
    const hour = pickRandom(slot.hours);

    // Pick products (1-4 items)
    const numItems = rand() < 0.5 ? 1 : rand() < 0.7 ? 2 : rand() < 0.85 ? 3 : 4;
    const shuffledProducts = [...products].sort(() => rand() - 0.5);
    const selectedProducts = shuffledProducts.slice(0, numItems);

    const items = selectedProducts.map(p => ({
      productId: p.id,
      productName: p.name,
      quantity: rand() < 0.8 ? 1 : 2,
      price: p.price,
    }));

    const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const custIndex = Math.floor(rand() * customers.length);
    const customer = customers[custIndex] || customers[0];

    const txDate = new Date(date);
    txDate.setHours(hour, randBetween(0, 59), randBetween(0, 59));

    transactions.push({
      id: `tx-${d}-${t}`,
      timestamp: txDate.toISOString(),
      amount,
      customerId: customer.id,
      customerName: customer.name,
      items,
      paymentMethod: pickRandom(paymentMethods),
      category: selectedProducts[0].category,
      timeOfDay: slot.slot,
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
    });
  }
}

// Sort transactions by date
transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// =============================================================
// CAMPAIGNS
// =============================================================
const campaigns = [
  {
    id: 'camp-001',
    name: 'Weekend Family Combo',
    description: 'Special weekend combo offers for families',
    audience: 'Families with 3+ orders',
    audienceCount: 2420,
    offer: '20% off on Veg Thali + 2 drinks',
    discountPercent: 20,
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'completed',
    reach: 2420,
    conversions: 318,
    revenueGenerated: 42600,
    roi: 3.8,
    createdAt: '2026-07-28T10:00:00.000Z',
    createdBy: 'merchant',
    aiConfidence: null,
  },
  {
    id: 'camp-002',
    name: 'Monsoon Special Menu',
    description: 'Celebrate monsoon with hot beverages and soups',
    audience: 'All customers',
    audienceCount: 5200,
    offer: 'Buy chai + snack for ₹99',
    discountPercent: 15,
    startDate: '2026-07-15',
    endDate: '2026-08-15',
    status: 'completed',
    reach: 5200,
    conversions: 892,
    revenueGenerated: 88300,
    roi: 4.2,
    createdAt: '2026-07-10T09:00:00.000Z',
    createdBy: 'merchant',
    aiConfidence: null,
  },
  {
    id: 'camp-003',
    name: 'VIP Loyalty Reward',
    description: 'Exclusive rewards for top customers',
    audience: 'VIP customers (top 120)',
    audienceCount: 120,
    offer: '₹200 cashback on orders above ₹800',
    discountPercent: null,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: 'active',
    reach: 120,
    conversions: 64,
    revenueGenerated: 38400,
    roi: 2.9,
    createdAt: '2026-08-28T14:00:00.000Z',
    createdBy: 'ai',
    aiConfidence: 87,
  },
  {
    id: 'camp-004',
    name: 'Student Lunch Deal',
    description: 'Affordable lunch combo for students',
    audience: 'Customers who order lunch on weekdays',
    audienceCount: 890,
    offer: 'Veg Thali + Chai for ₹130',
    discountPercent: 28,
    startDate: '2026-09-10',
    endDate: '2026-09-30',
    status: 'active',
    reach: 890,
    conversions: 142,
    revenueGenerated: 18460,
    roi: 2.1,
    createdAt: '2026-09-08T11:00:00.000Z',
    createdBy: 'merchant',
    aiConfidence: null,
  },
  {
    id: 'camp-005',
    name: 'Evening Biryani Festival',
    description: 'Special biryani offers every evening',
    audience: 'Customers who ordered biryani',
    audienceCount: 1840,
    offer: 'Chicken Biryani + Raita + Gulab Jamun for ₹280',
    discountPercent: 22,
    startDate: '2026-09-20',
    endDate: null,
    status: 'scheduled',
    reach: 0,
    conversions: 0,
    revenueGenerated: 0,
    roi: 0,
    createdAt: '2026-09-15T16:00:00.000Z',
    createdBy: 'ai',
    aiConfidence: 82,
  },
];

// =============================================================
// AI INSIGHTS
// =============================================================
const aiInsights = [
  {
    id: 'ins-001',
    type: 'time_based',
    title: 'Increase weekday lunch sales',
    summary: 'Weekday lunch revenue is 18% below your 8-week baseline.',
    explanation: 'Your weekday lunch revenue (12 PM–2 PM) averages ₹8,200/day, while weekend lunch brings in ₹12,400/day. Analysis of 90 days shows customers who visit during lunch are 27% more likely to purchase when an offer is available. Similar promotions in comparable restaurants increased lunch transactions by 14%.',
    evidence: [
      { metric: 'Weekday lunch revenue', value: '₹8,200/day', comparison: '18% below 8-week average' },
      { metric: 'Weekend lunch revenue', value: '₹12,400/day', comparison: '52% higher than weekday' },
      { metric: 'Lunch customers in last 90 days', value: '1,240 customers', comparison: 'who visited Mon-Fri 12-2 PM' },
      { metric: 'Offer response rate', value: '27% lift', comparison: 'when a lunch offer is active' },
    ],
    confidence: 92,
    priority: 'high',
    expectedImpact: '+₹18,000–₹25,000 monthly revenue',
    estimatedRevenue: { min: 18000, max: 25000 },
    recommendation: 'Create a 15% weekday lunch offer targeting previous lunch visitors.',
    actionType: 'create_campaign',
    actionLabel: 'Create Lunch Campaign',
    detectedAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: 'ins-002',
    type: 'inactive_customers',
    title: 'Recover at-risk high-value customers',
    summary: '214 high-value customers haven\'t returned in 30+ days.',
    explanation: 'You have 214 customers with historical average spend of ₹1,850/visit who haven\'t purchased in 30–45 days. Based on their purchase frequency (avg 12 visits/year), they are likely at risk of churning to competitors. A personalized comeback offer has shown 31% re-engagement rate in similar campaigns.',
    evidence: [
      { metric: 'At-risk high-value customers', value: '214 customers', comparison: 'avg ₹1,850 per visit' },
      { metric: 'Last purchase', value: '30–45 days ago', comparison: 'above normal interval' },
      { metric: 'Historical avg frequency', value: '12 visits/year', comparison: 'expected visit: 30 days' },
      { metric: 'Comeback offer success rate', value: '31% re-engagement', comparison: 'based on similar campaigns' },
    ],
    confidence: 89,
    priority: 'high',
    expectedImpact: 'Estimated ₹3.2L recoverable revenue',
    estimatedRevenue: { min: 280000, max: 350000 },
    recommendation: 'Launch personalized comeback campaign with ₹150 cashback offer.',
    actionType: 'create_campaign',
    actionLabel: 'Create Comeback Campaign',
    detectedAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: 'ins-003',
    type: 'cross_sell',
    title: 'Increase beverage attach rate',
    summary: 'Paneer Tikka and Butter Chicken have low beverage attach — 72% of orders skip drinks.',
    explanation: 'Analysis shows only 28% of Paneer Tikka orders and 42% of Butter Chicken orders include a beverage. Industry benchmarks for sit-down restaurants show 60–70% beverage attach rates. Creating a meal + drink bundle could significantly increase average order value.',
    evidence: [
      { metric: 'Paneer Tikka beverage attach', value: '28%', comparison: '42% below benchmark' },
      { metric: 'Butter Chicken beverage attach', value: '42%', comparison: '28% below benchmark' },
      { metric: 'Industry benchmark', value: '60–70% attach rate', comparison: 'for sit-down restaurants' },
      { metric: 'Revenue per transaction', value: '+₹80–₹120', comparison: 'if beverages bundled' },
    ],
    confidence: 85,
    priority: 'medium',
    expectedImpact: '+₹12,000–₹15,000 monthly revenue',
    estimatedRevenue: { min: 12000, max: 15000 },
    recommendation: 'Create a "Meal + Drink" bundle with 10% bundle discount.',
    actionType: 'bundle_products',
    actionLabel: 'Create Bundle Offer',
    detectedAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: 'ins-004',
    type: 'time_based',
    title: 'Capitalize on 7 PM–9 PM peak hours',
    summary: 'Your busiest 2-hour window generates 35% of daily revenue — optimize staffing.',
    explanation: 'Your evening rush (7–9 PM) consistently generates 35% of daily revenue. However, average order processing time increases by 22% during this period, suggesting possible capacity constraints. Increasing kitchen efficiency or pre-preparing popular items could handle 15–20% more orders.',
    evidence: [
      { metric: 'Revenue from 7–9 PM', value: '35% of daily revenue', comparison: 'highest 2-hour window' },
      { metric: 'Avg order time (peak)', value: '+22% slower', comparison: 'vs non-peak hours' },
      { metric: 'Missed orders estimate', value: '~45 orders/week', comparison: 'due to capacity limits' },
      { metric: 'Potential extra orders', value: '15–20% increase', comparison: 'with optimized prep' },
    ],
    confidence: 78,
    priority: 'medium',
    expectedImpact: '+₹8,000–₹12,000 monthly revenue',
    estimatedRevenue: { min: 8000, max: 12000 },
    recommendation: 'Pre-prepare top 3 items during 5–7 PM to reduce peak hour wait times.',
    actionType: 'generate_report',
    actionLabel: 'Generate Staffing Report',
    detectedAt: new Date().toISOString(),
    isRead: true,
  },
  {
    id: 'ins-005',
    type: 'product_opportunity',
    title: 'Promote Veg Sandwich before it declines further',
    summary: 'Veg Sandwich sales down 21% over 8 weeks. Intervention needed.',
    explanation: 'Veg Sandwich has declined from 116 to 92 orders per week over the last 8 weeks (21% drop). This may be due to seasonal preferences or increased competition from nearby stalls. A targeted promotional offer or menu refresh could reverse the trend.',
    evidence: [
      { metric: 'Current weekly orders', value: '92/week', comparison: 'down from 116 (21% decline)' },
      { metric: 'Revenue impact', value: '₹2,880 lost/week', comparison: 'vs 8 weeks ago' },
      { metric: 'Customer feedback', value: 'No negative reviews', comparison: 'likely price/awareness issue' },
    ],
    confidence: 72,
    priority: 'low',
    expectedImpact: 'Recover ₹5,000–₹8,000 monthly revenue',
    estimatedRevenue: { min: 5000, max: 8000 },
    recommendation: 'Create a "Snack Deal" — Veg Sandwich + Chai for ₹140 (save ₹20).',
    actionType: 'create_offer',
    actionLabel: 'Create Snack Offer',
    detectedAt: new Date().toISOString(),
    isRead: true,
  },
];

// =============================================================
// AI ACTIONS HISTORY
// =============================================================
const now = new Date('2026-09-16T00:05:00.000Z');
const aiActions = [
  {
    id: 'act-001',
    type: 'create_campaign',
    title: 'Created VIP Loyalty Reward campaign',
    description: 'AI identified 120 VIP customers and created a personalized loyalty campaign.',
    reason: 'VIP segment identified; targeted retention to maintain high-value customers.',
    status: 'completed',
    initiatedBy: 'ai',
    initiatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000 + 300000).toISOString(),
    completedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000 + 600000).toISOString(),
    result: 'Campaign launched. 64/120 conversions so far. ROI: 2.9x',
    relatedInsightId: null,
    metadata: { campaignId: 'camp-003', audience: 120, conversions: 64 },
    canUndo: false,
  },
  {
    id: 'act-002',
    type: 'segment_customers',
    title: 'Identified 214 at-risk high-value customers',
    description: 'AI analyzed purchase frequency and flagged 214 previously active high-value customers.',
    reason: 'Customers with avg ₹1,850/visit not returning in 30+ days.',
    status: 'completed',
    initiatedBy: 'ai',
    initiatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    approvedAt: null,
    completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 120000).toISOString(),
    result: 'Segment created: 214 at-risk customers. Recommended comeback campaign.',
    relatedInsightId: 'ins-002',
    metadata: { segmentSize: 214, avgSpend: 1850 },
    canUndo: false,
  },
  {
    id: 'act-003',
    type: 'generate_report',
    title: 'Generated daily business analysis',
    description: 'Completed daily 90-day trend analysis for merchant dashboard.',
    reason: 'Scheduled daily AI business health check.',
    status: 'completed',
    initiatedBy: 'ai',
    initiatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    approvedAt: null,
    completedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000 + 180000).toISOString(),
    result: 'Health score: 82/100. 5 opportunities identified.',
    relatedInsightId: null,
    metadata: { healthScore: 82, opportunities: 5 },
    canUndo: false,
  },
  {
    id: 'act-004',
    type: 'create_campaign',
    title: 'Created Student Lunch Deal campaign',
    description: 'Merchant approved AI suggestion for a student lunch discount.',
    reason: 'Weekday lunch revenue 18% below baseline — targeted promotion recommended.',
    status: 'completed',
    initiatedBy: 'merchant',
    initiatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 200000).toISOString(),
    completedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 400000).toISOString(),
    result: 'Campaign active. 142 conversions. ₹18,460 revenue generated.',
    relatedInsightId: 'ins-001',
    metadata: { campaignId: 'camp-004', conversions: 142 },
    canUndo: false,
  },
];

// =============================================================
// DAILY SALES (pre-aggregated for charts)
// =============================================================
const dailySales = [];
for (let d = 89; d >= 0; d--) {
  const date = new Date(today);
  date.setDate(date.getDate() - d);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const growthFactor = 1 + ((89 - d) / 89) * 0.12;

  const baseRevenue = isWeekend ? randBetween(55000, 70000) : randBetween(38000, 52000);
  const revenue = Math.round(baseRevenue * growthFactor);
  const transactions = isWeekend ? randBetween(370, 430) : randBetween(280, 350);
  const newCust = randBetween(8, 18);
  const returningCust = transactions - newCust;

  dailySales.push({
    date: date.toISOString().split('T')[0],
    revenue,
    transactions,
    averageOrderValue: Math.round(revenue / transactions),
    newCustomers: newCust,
    returningCustomers: returningCust,
  });
}

// =============================================================
// HOURLY SALES (average pattern)
// =============================================================
const hourlySales = [
  { hour: 8, revenue: 1200, transactions: 8 },
  { hour: 9, revenue: 1800, transactions: 12 },
  { hour: 10, revenue: 2100, transactions: 14 },
  { hour: 11, revenue: 2800, transactions: 18 },
  { hour: 12, revenue: 5400, transactions: 36 },
  { hour: 13, revenue: 6200, transactions: 41 },
  { hour: 14, revenue: 4800, transactions: 32 },
  { hour: 15, revenue: 2200, transactions: 15 },
  { hour: 16, revenue: 1800, transactions: 12 },
  { hour: 17, revenue: 2400, transactions: 16 },
  { hour: 18, revenue: 4200, transactions: 28 },
  { hour: 19, revenue: 7800, transactions: 52 },
  { hour: 20, revenue: 8900, transactions: 59 },
  { hour: 21, revenue: 6400, transactions: 43 },
  { hour: 22, revenue: 3200, transactions: 21 },
];

// =============================================================
// DASHBOARD KPIs
// =============================================================
const todaySales = dailySales[dailySales.length - 1];
const yesterdaySales = dailySales[dailySales.length - 2];

const dashboardKPIs = {
  todayRevenue: 48650,
  todayTransactions: 327,
  averageOrderValue: 149,
  returningCustomerRate: 42,
  revenueChange: 12.4,
  transactionsChange: 8.2,
  aovChange: 3.8,
  healthScore: 82,
  healthBreakdown: {
    salesMomentum: 87,
    customerRetention: 76,
    productPerformance: 84,
    campaignPerformance: 79,
    operationalEfficiency: 82,
  },
};

// =============================================================
// CUSTOMER SEGMENT SUMMARY
// =============================================================
const customerSegmentSummary = [
  { segment: 'vip', label: 'VIP Customers', count: 120, avgSpend: 22500, description: 'Top customers by spend and frequency', color: '#f59e0b', recommendation: 'Send exclusive early access offers' },
  { segment: 'frequent', label: 'Frequent Customers', count: 580, avgSpend: 8200, description: 'Customers who order 15+ times', color: '#10b981', recommendation: 'Loyalty points program' },
  { segment: 'high-value', label: 'High-Value Customers', count: 210, avgSpend: 15000, description: 'High-spend customers, moderate frequency', color: '#6366f1', recommendation: 'Premium bundle offers' },
  { segment: 'new', label: 'New Customers', count: 412, avgSpend: 680, description: 'Joined in the last 30 days', color: '#00BAF2', recommendation: 'Second-visit discount' },
  { segment: 'occasional', label: 'Occasional Customers', count: 3858, avgSpend: 2200, description: 'Visit 3–12 times per year', color: '#64748b', recommendation: 'Re-engagement campaign' },
  { segment: 'at-risk', label: 'At-Risk Customers', count: 1240, avgSpend: 4800, description: 'Previously active, haven\'t returned in 25–45 days', color: '#f97316', recommendation: 'Send personalized comeback offer' },
  { segment: 'inactive', label: 'Inactive Customers', count: 2000, avgSpend: 1800, description: 'No purchase in 60+ days', color: '#ef4444', recommendation: 'Win-back campaign with strong incentive' },
];

// =============================================================
// NOTIFICATIONS
// =============================================================
const notifications = [
  {
    id: 'notif-001',
    category: 'growth',
    title: 'Growth Opportunity Detected',
    message: 'Potential ₹25K monthly revenue opportunity detected from weekday lunch campaign.',
    priority: 'high',
    isRead: false,
    timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    actionLabel: 'View Opportunity',
    actionType: 'view_insight',
  },
  {
    id: 'notif-002',
    category: 'customers',
    title: 'Customer Alert',
    message: '214 high-value customers haven\'t returned in 30+ days. Risk of churn is high.',
    priority: 'high',
    isRead: false,
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    actionLabel: 'Create Campaign',
    actionType: 'create_campaign',
  },
  {
    id: 'notif-003',
    category: 'sales',
    title: 'Sales Milestone',
    message: 'Today\'s sales are 12.4% above your 30-day average. Great performance!',
    priority: 'medium',
    isRead: false,
    timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    actionLabel: 'View Analytics',
    actionType: 'view_analytics',
  },
  {
    id: 'notif-004',
    category: 'operations',
    title: 'Peak Hour Alert',
    message: 'Your 7 PM–9 PM slot generates 35% of daily revenue. Consider staff optimization.',
    priority: 'medium',
    isRead: true,
    timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    actionLabel: 'View Report',
    actionType: 'generate_report',
  },
  {
    id: 'notif-005',
    category: 'campaigns',
    title: 'Campaign Performance',
    message: 'VIP Loyalty Reward campaign has 64 conversions so far. ROI: 2.9x',
    priority: 'low',
    isRead: true,
    timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    actionLabel: 'View Campaign',
    actionType: 'view_campaign',
  },
];

module.exports = {
  merchant,
  products: productsWithTotals,
  customers,
  transactions,
  campaigns,
  aiInsights,
  aiActions,
  dailySales,
  hourlySales,
  dashboardKPIs,
  customerSegmentSummary,
  notifications,
};
