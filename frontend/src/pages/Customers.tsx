import React, { useState, useEffect } from 'react';
import { customersApi, actionsApi } from '../services/api';
import { Card, Button, Badge, SectionHeader, LoadingState, ErrorState, Modal, ProgressBar } from '../components/ui';
import { Users, TrendingUp, ArrowUpRight } from 'lucide-react';

const segmentColors: Record<string, string> = {
  vip: 'text-amber-700 bg-amber-50 border-amber-200',
  frequent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'high-value': 'text-purple-700 bg-purple-50 border-purple-200',
  new: 'text-blue-700 bg-blue-50 border-blue-200',
  occasional: 'text-gray-700 bg-gray-50 border-gray-200',
  'at-risk': 'text-orange-700 bg-orange-50 border-orange-200',
  inactive: 'text-red-700 bg-red-50 border-red-200',
};

const segmentIcons: Record<string, string> = {
  vip: '⭐', frequent: '🔄', 'high-value': '💎', new: '🆕',
  occasional: '🛒', 'at-risk': '⚠️', inactive: '😴',
};

const formatCurrency = (v: number) => `₹${v.toLocaleString('en-IN')}`;

const Customers: React.FC = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<string>('all');
  const [campaignModal, setCampaignModal] = useState<any>(null);
  const [launching, setLaunching] = useState(false);
  const [launchDone, setLaunchDone] = useState(false);
  const [launchSteps, setLaunchSteps] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [segRes, custRes, sumRes]: any[] = await Promise.all([
          customersApi.getSegments(),
          customersApi.getAll({ limit: 30 }),
          customersApi.getSummary(),
        ]);
        setSegments(segRes.data || []);
        setCustomers(custRes.data || []);
        setSummary(sumRes.data || {});
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const handleSegmentFilter = async (segment: string) => {
    setActiveSegment(segment);
    const res: any = await customersApi.getAll({ segment: segment === 'all' ? undefined : segment, limit: 30 });
    setCustomers(res.data || []);
  };

  const handleCreateCampaign = (seg: any) => {
    const campaigns: Record<string, any> = {
      'at-risk': { name: 'Come Back, We Miss You!', offer: '₹150 cashback on orders above ₹600', audience: 'At-risk customers', count: 1240 },
      inactive: { name: 'We Want You Back!', offer: '20% off your next meal', audience: 'Inactive customers', count: 2000 },
      new: { name: 'Second Visit Special', offer: '15% off on second order', audience: 'New customers', count: 412 },
      vip: { name: 'VIP Exclusive Offer', offer: '₹300 cashback on orders above ₹1500', audience: 'VIP customers', count: 120 },
    };
    setCampaignModal(campaigns[seg.segment] || { name: `Campaign for ${seg.label}`, offer: 'Special offer', audience: seg.label, count: seg.count });
  };

  const handleLaunch = async () => {
    if (!campaignModal) return;
    setLaunching(true);
    setLaunchSteps([]);
    const steps = ['✓ Audience selected', '✓ Offer configured', '✓ Campaign scheduled', '✓ Action logged'];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 500));
      setLaunchSteps(prev => [...prev, step]);
    }
    try {
      await actionsApi.createCampaign({
        name: campaignModal.name,
        audience: campaignModal.audience,
        audienceCount: campaignModal.count,
        offer: campaignModal.offer,
      });
    } catch {}
    setLaunchDone(true);
    setLaunching(false);
  };

  if (loading) return <LoadingState message="Loading customer intelligence..." />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Intelligence</h1>
        <p className="text-sm text-gray-500 mt-1">AI-powered customer segmentation and targeting</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-xs text-gray-500 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total?.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 mt-1">↑ +412 this month</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 mb-1">New Customers</p>
            <p className="text-2xl font-bold text-blue-600">{summary.new?.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Joined this month</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 mb-1">Returning Customers</p>
            <p className="text-2xl font-bold text-emerald-600">{summary.returning?.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">42% retention rate</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 mb-1">At-Risk Customers</p>
            <p className="text-2xl font-bold text-orange-600">{summary.atRisk?.toLocaleString()}</p>
            <p className="text-xs text-red-500 mt-1">⚠ Action needed</p>
          </Card>
        </div>
      )}

      {/* AI Segments */}
      <div>
        <SectionHeader title="AI Customer Segments" subtitle="Automatically classified by GrowthPilot" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((seg) => (
            <Card key={seg.segment} className={`border ${segmentColors[seg.segment]?.split(' ')[2] || 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{segmentIcons[seg.segment]}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{seg.label}</p>
                    <p className="text-lg font-bold" style={{ color: seg.color }}>{seg.count.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">{seg.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">Avg. Total Spend</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(seg.avgSpend)}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">💡 AI Recommendation</p>
                <p className="text-xs text-gray-600 mb-3">{seg.recommendation}</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => handleCreateCampaign(seg)}
                >
                  Create Campaign
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Customer List</h3>
          <div className="flex gap-1 flex-wrap">
            {['all', 'vip', 'at-risk', 'new', 'inactive'].map(s => (
              <button
                key={s}
                onClick={() => handleSegmentFilter(s)}
                className={`px-2.5 py-1 text-xs rounded-lg capitalize font-medium transition-colors ${
                  activeSegment === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Segment</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Orders</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Total Spend</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Avg Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 20).map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${segmentColors[c.segment] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                      {segmentIcons[c.segment]} {c.segment}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">{c.orderCount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(c.totalSpend)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(c.averageOrderValue)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(c.lastPurchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Campaign Modal */}
      <Modal
        isOpen={!!campaignModal}
        onClose={() => { setCampaignModal(null); setLaunchDone(false); setLaunchSteps([]); }}
        title={launchDone ? '🎉 Campaign Launched!' : 'Create Customer Campaign'}
        size="md"
        footer={
          !launchDone ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setCampaignModal(null)}>Cancel</Button>
              <Button variant="primary" size="sm" loading={launching} onClick={handleLaunch}>Launch Campaign</Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => { setCampaignModal(null); setLaunchDone(false); setLaunchSteps([]); }}>Done</Button>
          )
        }
      >
        {launchDone ? (
          <div className="text-center space-y-3 slide-in">
            <div className="text-4xl">✅</div>
            <h3 className="font-bold text-gray-900">Campaign is Live!</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
              {launchSteps.map((s, i) => <div key={i} className="text-sm text-emerald-700 font-medium">{s}</div>)}
            </div>
          </div>
        ) : launching ? (
          <div className="py-4 space-y-2">
            {launchSteps.map((s, i) => <div key={i} className="text-sm text-emerald-700 font-medium slide-in">{s}</div>)}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" style={{ borderWidth: 2 }} />
              Processing...
            </div>
          </div>
        ) : campaignModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">{campaignModal.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-xs text-gray-500">Audience</p><p className="font-medium">{campaignModal.audience}</p></div>
                <div><p className="text-xs text-gray-500">Reach</p><p className="font-medium">{campaignModal.count?.toLocaleString()} customers</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Offer</p><p className="font-medium">{campaignModal.offer}</p></div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800">🔐 Merchant Approval Required</p>
              <p className="text-xs text-amber-700 mt-0.5">This campaign will notify {campaignModal.count} customers.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
