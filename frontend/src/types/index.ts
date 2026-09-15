// Merchant & Business Types
export interface Merchant {
  id: string;
  name: string;
  businessName: string;
  category: string;
  location: string;
  phone: string;
  email: string;
  joinedDate: string;
  paytmMerchantId: string;
}

// Transaction Types
export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  customerId: string;
  customerName: string;
  items: TransactionItem[];
  paymentMethod: 'upi' | 'card' | 'cash' | 'wallet';
  category: string;
  timeOfDay: 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
}

// Customer Types
export type CustomerSegment = 'vip' | 'frequent' | 'new' | 'at-risk' | 'inactive' | 'high-value' | 'occasional';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  totalSpend: number;
  orderCount: number;
  averageOrderValue: number;
  segment: CustomerSegment;
  preferredCategory?: string;
  location?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  totalOrders: number;
  totalRevenue: number;
  trend: number; // percentage change
  aiInsight?: string;
  attachmentRate?: number; // how often it's bought with other items
}

// Campaign Types
export type CampaignStatus = 'active' | 'scheduled' | 'completed' | 'paused' | 'draft';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  audience: string;
  audienceCount: number;
  offer: string;
  discountPercent?: number;
  startDate: string;
  endDate?: string;
  status: CampaignStatus;
  reach: number;
  conversions: number;
  revenueGenerated: number;
  roi: number;
  createdAt: string;
  createdBy: 'merchant' | 'ai';
  aiConfidence?: number;
}

// AI Insight Types
export type InsightType = 
  | 'revenue_drop' 
  | 'revenue_growth' 
  | 'inactive_customers'
  | 'high_value_customers'
  | 'product_opportunity'
  | 'cross_sell'
  | 'campaign_opportunity'
  | 'time_based'
  | 'repeat_customer'
  | 'risk_alert';

export type InsightPriority = 'high' | 'medium' | 'low';

export interface InsightEvidence {
  metric: string;
  value: string;
  comparison?: string;
}

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  summary: string;
  explanation: string;
  evidence: InsightEvidence[];
  confidence: number; // 0-100
  priority: InsightPriority;
  expectedImpact: string;
  estimatedRevenue?: { min: number; max: number };
  recommendation: string;
  actionType: string;
  actionLabel: string;
  detectedAt: string;
  isRead: boolean;
}

// AI Action Types
export type ActionType = 
  | 'create_campaign'
  | 'create_offer'
  | 'send_message'
  | 'create_coupon'
  | 'generate_report'
  | 'flag_risk'
  | 'segment_customers'
  | 'bundle_products';

export type ActionStatus = 'pending' | 'approved' | 'executing' | 'completed' | 'failed' | 'cancelled';

export interface AIAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  reason: string;
  status: ActionStatus;
  initiatedBy: 'ai' | 'merchant';
  initiatedAt: string;
  approvedAt?: string;
  completedAt?: string;
  result?: string;
  relatedInsightId?: string;
  metadata?: Record<string, unknown>;
  canUndo: boolean;
}

// Sales Analytics Types
export interface DailySales {
  date: string;
  revenue: number;
  transactions: number;
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface HourlySales {
  hour: number;
  revenue: number;
  transactions: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
  transactions: number;
  percentage: number;
}

// Merchant Context (AI Engine)
export interface MerchantContext {
  merchant: Merchant;
  salesMetrics: {
    todayRevenue: number;
    todayTransactions: number;
    todayAOV: number;
    weekRevenue: number;
    monthRevenue: number;
    revenueChange: number; // % vs last period
    transactionChange: number;
    aovChange: number;
  };
  customerSegments: {
    total: number;
    new: number;
    returning: number;
    inactive: number;
    vip: number;
    atRisk: number;
  };
  productPerformance: {
    topProducts: Product[];
    slowProducts: Product[];
  };
  campaigns: Campaign[];
  historicalTrends: DailySales[];
  businessHours: { open: string; close: string };
  healthScore: number;
  opportunities: AIInsight[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard KPI
export interface DashboardKPIs {
  todayRevenue: number;
  todayTransactions: number;
  averageOrderValue: number;
  returningCustomerRate: number;
  revenueChange: number;
  transactionsChange: number;
  aovChange: number;
  healthScore: number;
  healthBreakdown: {
    salesMomentum: number;
    customerRetention: number;
    productPerformance: number;
    campaignPerformance: number;
    operationalEfficiency: number;
  };
}

// Chat / Copilot Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: ChatAction[];
  isTyping?: boolean;
}

export interface ChatAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  actionType: string;
  metadata?: Record<string, unknown>;
}

// Notification Types
export interface Notification {
  id: string;
  category: 'growth' | 'sales' | 'customers' | 'operations' | 'campaigns';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  timestamp: string;
  actionLabel?: string;
  actionType?: string;
}
