import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { analyticsApi } from '../services/api';
import { Card, MetricCard, SectionHeader, LoadingState, ErrorState, Badge } from '../components/ui';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#06b6d4', '#84cc16'];

const formatCurrency = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' && p.name !== 'transactions' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState(30);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartTab, setChartTab] = useState<'revenue' | 'transactions' | 'aov'>('revenue');

  const load = async () => {
    try {
      setLoading(true);
      const [sales, hourly, category]: any[] = await Promise.all([
        analyticsApi.getSales(period),
        analyticsApi.getHourly(),
        analyticsApi.getCategory(),
      ]);
      setSalesData((sales.data || []).map((d: any) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      })));
      setHourlyData(hourly.data || []);
      setCategoryData(category.data || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [period]);

  // Computed stats
  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalTransactions = salesData.reduce((s, d) => s + d.transactions, 0);
  const avgDailyRevenue = Math.round(totalRevenue / Math.max(salesData.length, 1));
  const avgAOV = Math.round(totalRevenue / Math.max(totalTransactions, 1));

  const peakHour = hourlyData.reduce((a, b) => (a.revenue > b.revenue ? a : b), { hour: 0, revenue: 0 });

  if (loading) return <LoadingState message="Analyzing your sales data..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Deep insights from your business performance data</p>
        </div>
        <div className="flex gap-1">
          {[
            { label: 'Today', val: 1 },
            { label: '7 Days', val: 7 },
            { label: '30 Days', val: 30 },
            { label: '90 Days', val: 90 },
          ].map(p => (
            <button
              key={p.val}
              onClick={() => setPeriod(p.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p.val ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title={`Revenue (${period}d)`} value={formatCurrency(totalRevenue)} change={12.4} changeLabel="vs prev period" />
        <MetricCard title={`Transactions (${period}d)`} value={totalTransactions.toLocaleString()} change={8.2} changeLabel="vs prev period" />
        <MetricCard title="Avg. Daily Revenue" value={formatCurrency(avgDailyRevenue)} />
        <MetricCard title="Avg. Order Value" value={`₹${avgAOV}`} change={3.8} changeLabel="vs prev period" />
      </div>

      {/* Sales Chart */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Sales Trend</h3>
            <p className="text-xs text-gray-400">Last {period} days</p>
          </div>
          <div className="flex gap-1">
            {(['revenue', 'transactions', 'aov'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setChartTab(tab)}
                className={`px-3 py-1 text-xs rounded-lg capitalize font-medium transition-colors ${
                  chartTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {tab === 'aov' ? 'Avg Order' : tab}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={salesData} margin={{ left: 0, right: 20, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(salesData.length / 8)} />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={56}
              tickFormatter={v => chartTab === 'revenue' || chartTab === 'aov' ? formatCurrency(v) : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={chartTab === 'aov' ? 'averageOrderValue' : chartTab}
              name={chartTab}
              stroke="#3b82f6" strokeWidth={2} fill="url(#grad1)" dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Hourly Sales */}
        <Card padding="none">
          <div className="px-5 pt-5 pb-3">
            <h3 className="font-bold text-gray-900">Hourly Sales Pattern</h3>
            <p className="text-xs text-gray-400">Peak hour: {peakHour.hour}:00 (₹{(peakHour.revenue / 1000).toFixed(1)}K/hr avg)</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} margin={{ left: 0, right: 16, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={h => `${h}h`} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44}
                tickFormatter={v => formatCurrency(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="revenue" radius={[3, 3, 0, 0]}>
                {hourlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.hour === peakHour.hour ? '#3b82f6' : entry.revenue > 5000 ? '#60a5fa' : '#bfdbfe'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Revenue by Category</h3>
          <div className="flex items-center gap-4">
            <PieChart width={140} height={140}>
              <Pie data={categoryData} dataKey="revenue" cx={65} cy={65} innerRadius={40} outerRadius={65} paddingAngle={2}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <div className="flex-1 space-y-2">
              {categoryData.slice(0, 6).map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <p className="text-xs text-gray-600 flex-1 truncate">{cat.category}</p>
                  <p className="text-xs font-semibold text-gray-900">{cat.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Mix */}
      <Card>
        <SectionHeader title="New vs Returning Customers" subtitle="Daily breakdown" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={salesData.slice(-14)} margin={{ left: 0, right: 16, top: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={32} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="returningCustomers" name="Returning" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="newCustomers" name="New" stackId="a" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 justify-end">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500" /><span className="text-xs text-gray-500">Returning</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-xs text-gray-500">New</span></div>
        </div>
      </Card>

      {/* AI Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl">🤖</span>
        <div>
          <p className="text-sm font-bold text-blue-900">AI Insight: Peak Hour Optimization</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Your 7 PM–9 PM slot generates 35% of daily revenue. However, order processing time is 22% slower during this period.
            Pre-preparing your top 3 items could handle 15–20% more orders and add ₹8K–₹12K/month.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
