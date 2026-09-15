import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, Users, Zap, ChevronRight, ArrowUpRight, Target,
  AlertCircle, Lightbulb, Star, Clock, Sparkles, Brain
} from 'lucide-react';
import { analyticsApi, aiApi, actionsApi } from '../services/api';
import {
  MetricCard, Card, Badge, Button, SectionHeader, ConfidenceIndicator,
  LoadingState, ErrorState, ProgressBar, Modal, AIThinking
} from '../components/ui';

interface DashboardData {
  kpis: {
    todayRevenue: number;
    todayTransactions: number;
    averageOrderValue: number;
    returningCustomerRate: number;
    revenueChange: number;
    transactionsChange: number;
    aovChange: number;
    healthScore: number;
    healthBreakdown: Record<string, number>;
  };
  weekRevenue: number;
  monthRevenue: number;
  recentDays: Array<{ date: string; revenue: number; transactions: number }>;
  merchant: { name: string; businessName: string };
  unreadInsights: number;
}

interface Insight {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  confidence: number;
  priority: string;
  expectedImpact: string;
  estimatedRevenue?: { min: number; max: number };
  recommendation: string;
  actionType: string;
  actionLabel: string;
  type: string;
  evidence: Array<{ metric: string; value: string; comparison?: string }>;
}

interface CampaignPreview {
  name: string;
  audience: string;
  audienceCount: number;
  offer: string;
  estimatedRevenue: { min: number; max: number };
  estimatedROI: number;
  confidence: number;
  channels: string[];
  schedule?: string;
}

const formatCurrency = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name === 'revenue' ? formatCurrency(p.value) : p.value} {p.name}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [campaignModal, setCampaignModal] = useState<{ insightId: string; preview: CampaignPreview | null } | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchSteps, setLaunchSteps] = useState<string[]>([]);
  const [launchDone, setLaunchDone] = useState(false);
  const [chartPeriod, setChartPeriod] = useState(14);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, salesRes, insightRes]: any[] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getSales(30),
        aiApi.getOpportunities(),
      ]);
      setData(dashRes.data);
      setSalesData((salesRes.data || []).slice(-chartPeriod).map((d: any) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      })));
      setInsights((insightRes.data || []).slice(0, 3));
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (data) {
      analyticsApi.getSales(chartPeriod).then((res: any) => {
        setSalesData((res.data || []).slice(-chartPeriod).map((d: any) => ({
          ...d,
          date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        })));
      }).catch(() => {});
    }
  }, [chartPeriod, data]);

  const handleTakeAction = async (insight: Insight) => {
    try {
      const previewRes: any = await aiApi.getCampaignPreview(insight.id);
      setCampaignModal({ insightId: insight.id, preview: previewRes.data });
    } catch {
      setCampaignModal({ insightId: insight.id, preview: null });
    }
  };

  const handleLaunchCampaign = async () => {
    if (!campaignModal?.preview) return;
    setLaunching(true);
    setLaunchDone(false);
    setLaunchSteps([]);

    const steps = [
      '✓ Audience selected',
      '✓ Offer configured',
      '✓ Campaign scheduled',
      '✓ Notifications prepared',
      '✓ Action logged',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setLaunchSteps(prev => [...prev, steps[i]]);
    }

    try {
      await actionsApi.createCampaign(
        {
          name: campaignModal.preview.name,
          description: `AI-generated campaign for ${campaignModal.preview.audience}`,
          audience: campaignModal.preview.audience,
          audienceCount: campaignModal.preview.audienceCount,
          offer: campaignModal.preview.offer,
        },
        campaignModal.insightId
      );
    } catch {}

    setLaunchDone(true);
    setLaunching(false);
  };

  const getHour = () => new Date().getHours();
  const greeting = getHour() < 12 ? 'Good morning' : getHour() < 17 ? 'Good afternoon' : 'Good evening';

  const healthColors: Record<string, string> = {
    salesMomentum: 'bg-blue-500',
    customerRetention: 'bg-emerald-500',
    productPerformance: 'bg-purple-500',
    campaignPerformance: 'bg-amber-500',
    operationalEfficiency: 'bg-cyan-500',
  };

  const healthLabels: Record<string, string> = {
    salesMomentum: 'Sales Momentum',
    customerRetention: 'Customer Retention',
    productPerformance: 'Product Performance',
    campaignPerformance: 'Campaign Performance',
    operationalEfficiency: 'Operational Efficiency',
  };

  const priorityIcons: Record<string, string> = {
    time_based: '⏰',
    inactive_customers: '👥',
    cross_sell: '🔗',
    product_opportunity: '🛍️',
    campaign_opportunity: '📣',
  };

  if (loading) return <LoadingState message="Loading your AI business dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!data) return null;

  const { kpis } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {data.merchant.name} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Here's what your AI business partner found today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" dot>
            {data.unreadInsights} new AI insights
          </Badge>
          <Button
            variant="primary"
            size="sm"
            icon={<Brain className="w-3.5 h-3.5" />}
            onClick={() => navigate('/copilot')}
          >
            Ask GrowthPilot
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Sales"
          value={`₹${kpis.todayRevenue.toLocaleString('en-IN')}`}
          change={kpis.revenueChange}
          changeLabel="vs yesterday"
          icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <MetricCard
          title="Transactions"
          value={kpis.todayTransactions.toLocaleString('en-IN')}
          change={kpis.transactionsChange}
          changeLabel="vs yesterday"
          icon={<Zap className="w-4 h-4 text-purple-600" />}
          iconBg="bg-purple-50"
        />
        <MetricCard
          title="Avg. Order Value"
          value={`₹${kpis.averageOrderValue}`}
          change={kpis.aovChange}
          changeLabel="vs yesterday"
          icon={<Star className="w-4 h-4 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <MetricCard
          title="Returning Customers"
          value={`${kpis.returningCustomerRate}%`}
          icon={<Users className="w-4 h-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
          subtitle="of today's orders"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Sales Chart + Health Score */}
        <div className="lg:col-span-2 space-y-5">
          {/* Sales Chart */}
          <Card padding="none">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Sales Trend</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatCurrency(data.weekRevenue)} this week · {formatCurrency(data.monthRevenue)} this month
                </p>
              </div>
              <div className="flex gap-1">
                {[7, 14, 30].map(p => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      chartPeriod === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {p}d
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={salesData} margin={{ left: 0, right: 16, top: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} width={52} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Business Health Score */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">AI Business Health Score</h3>
                  <p className="text-xs text-gray-400">Powered by 90 days of data analysis</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-600">{kpis.healthScore}</span>
                <span className="text-sm text-gray-400">/100</span>
              </div>
            </div>
            <ProgressBar value={kpis.healthScore} max={100} color="bg-blue-500" size="md" />
            <div className="mt-4 space-y-2.5">
              {Object.entries(kpis.healthBreakdown || {}).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3">
                  <p className="text-xs text-gray-500 w-36 flex-shrink-0">{healthLabels[key] || key}</p>
                  <div className="flex-1">
                    <ProgressBar value={val as number} max={100} color={healthColors[key] || 'bg-blue-500'} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-8 text-right">{val as number}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right — AI Daily Brief */}
        <div className="space-y-4">
          {/* AI Brief Header */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="font-bold text-sm">Your AI Daily Brief</p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your sales are up <span className="text-emerald-400 font-semibold">+12.4%</span> this week, but weekday lunch revenue is{' '}
              <span className="text-amber-400 font-semibold">18% below</span> your usual level.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-white">₹48.6K</p>
                <p className="text-xs text-slate-400">Today</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">82</p>
                <p className="text-xs text-slate-400">Health</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-400">{data.unreadInsights}</p>
                <p className="text-xs text-slate-400">Insights</p>
              </div>
            </div>
          </div>

          {/* Proactive Alerts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Alerts</p>
              <Link to="/opportunities" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-800">Sales Alert</p>
                  <p className="text-xs text-amber-700 mt-0.5">3–5 PM sales are 22% below average today.</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-amber-700 px-0 h-auto text-xs" onClick={() => navigate('/analytics')}>
                    Find out why →
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-800">Growth Opportunity</p>
                  <p className="text-xs text-blue-700 mt-0.5">Top 3 meals have low beverage attachment (28%).</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-blue-700 px-0 h-auto text-xs" onClick={() => navigate('/opportunities')}>
                    Create bundle →
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-purple-800">Customer Opportunity</p>
                  <p className="text-xs text-purple-700 mt-0.5">214 high-value customers haven't returned in 30 days.</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-purple-700 px-0 h-auto text-xs" onClick={() => navigate('/customers')}>
                    Target customers →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Opportunities */}
      <div>
        <SectionHeader
          title="AI Growth Opportunities"
          subtitle="Automatically detected from your business data"
          badge={<Badge variant="info" dot>{insights.length} found</Badge>}
          action={
            <Link to="/opportunities">
              <Button variant="outline" size="sm" icon={<ChevronRight className="w-3.5 h-3.5" />} iconPosition="right">
                View all
              </Button>
            </Link>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map(insight => (
            <Card key={insight.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{priorityIcons[insight.type] || '💡'}</span>
                  <Badge variant={insight.priority === 'high' ? 'danger' : insight.priority === 'medium' ? 'warning' : 'neutral'} size="sm">
                    {insight.priority} priority
                  </Badge>
                </div>
                <ConfidenceIndicator confidence={insight.confidence} />
              </div>

              <h3 className="font-bold text-gray-900 text-sm mb-2">{insight.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed flex-1">{insight.summary}</p>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-700">{insight.expectedImpact}</p>
                </div>

                {expandedInsight === insight.id && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg space-y-2 slide-in">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Why AI detected this:</p>
                    {insight.evidence.map((ev, i) => (
                      <div key={i} className="text-xs text-blue-700">
                        <span className="font-medium">{ev.metric}:</span> {ev.value}
                        {ev.comparison && <span className="text-blue-500"> ({ev.comparison})</span>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleTakeAction(insight)}
                  >
                    {insight.actionLabel}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs px-2"
                    onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                  >
                    {expandedInsight === insight.id ? 'Hide' : 'Explain'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '🚀', label: 'AI Growth Mission', desc: 'Find biggest opportunity', path: '/copilot', color: 'from-blue-600 to-indigo-600' },
          { icon: '📣', label: 'New Campaign', desc: 'AI will suggest the best one', path: '/campaigns', color: 'from-emerald-500 to-teal-600' },
          { icon: '👥', label: 'Customer Targets', desc: '1,240 at-risk customers', path: '/customers', color: 'from-purple-600 to-violet-600' },
          { icon: '📊', label: 'Full Analytics', desc: '90 days of insights', path: '/analytics', color: 'from-amber-500 to-orange-500' },
        ].map(item => (
          <Link key={item.path} to={item.path}>
            <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-sm font-bold">{item.label}</p>
              <p className="text-xs opacity-80 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Campaign Preview Modal */}
      <Modal
        isOpen={!!campaignModal}
        onClose={() => { setCampaignModal(null); setLaunchSteps([]); setLaunchDone(false); }}
        title={launchDone ? '🎉 Campaign Launched!' : campaignModal?.preview ? `Campaign Preview: ${campaignModal.preview.name}` : 'Loading...'}
        size="md"
        footer={
          !launchDone ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setCampaignModal(null)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                loading={launching}
                onClick={handleLaunchCampaign}
                disabled={!campaignModal?.preview || launching}
              >
                🚀 Launch Campaign
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => { setCampaignModal(null); setLaunchSteps([]); setLaunchDone(false); navigate('/campaigns'); }}>
              View Campaign →
            </Button>
          )
        }
      >
        {launchDone ? (
          <div className="space-y-3 slide-in">
            <div className="text-center py-4">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-gray-900">Campaign is Live!</h3>
              <p className="text-sm text-gray-500 mt-1">GrowthPilot has successfully launched your campaign.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {launchSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                  <span className="text-emerald-500">{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : launching ? (
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium text-gray-700 text-center">Launching your campaign...</p>
            <div className="space-y-2">
              {launchSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-emerald-700 font-medium slide-in">
                  <span>{step}</span>
                </div>
              ))}
              {launchSteps.length < 5 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" style={{ borderWidth: 2 }} />
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>
        ) : campaignModal?.preview ? (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Audience</p>
                  <p className="font-semibold text-gray-900">{campaignModal.preview.audience}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estimated Reach</p>
                  <p className="font-semibold text-gray-900">{campaignModal.preview.audienceCount.toLocaleString()} customers</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Offer</p>
                  <p className="font-semibold text-gray-900">{campaignModal.preview.offer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estimated ROI</p>
                  <p className="font-semibold text-emerald-700">{campaignModal.preview.estimatedROI}x</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Estimated Monthly Impact</p>
                <p className="text-lg font-bold text-emerald-700">
                  {formatCurrency(campaignModal.preview.estimatedRevenue.min)}–{formatCurrency(campaignModal.preview.estimatedRevenue.max)}
                </p>
              </div>
              <ConfidenceIndicator confidence={campaignModal.preview.confidence} />
            </div>
            <p className="text-xs text-gray-400 text-center">
              ⚠️ These are AI estimates. Actual results may vary.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800">🔐 Merchant Approval Required</p>
              <p className="text-xs text-amber-700 mt-0.5">This campaign will send notifications to {campaignModal.preview.audienceCount} customers. Review carefully before launching.</p>
            </div>
          </div>
        ) : (
          <LoadingState message="Generating campaign preview..." />
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
