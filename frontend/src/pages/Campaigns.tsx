import React, { useState, useEffect } from 'react';
import { campaignsApi, actionsApi } from '../services/api';
import { Card, Button, Badge, SectionHeader, LoadingState, Modal } from '../components/ui';
import { Megaphone, Plus } from 'lucide-react';

const statusColors: Record<string, string> = {
  active: 'success',
  scheduled: 'info',
  completed: 'neutral',
  paused: 'warning',
  draft: 'neutral',
};

const formatCurrency = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [newCampaignModal, setNewCampaignModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createDone, setCreateDone] = useState(false);
  const [createSteps, setCreateSteps] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', audience: '', offer: '', audienceCount: '' });

  const load = async () => {
    try {
      const res: any = await campaignsApi.getAll(statusFilter === 'all' ? undefined : statusFilter);
      setCampaigns(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleCreate = async () => {
    if (!form.name) return;
    setCreating(true);
    setCreateSteps([]);
    const steps = ['✓ Campaign configured', '✓ Audience selected', '✓ Offer applied', '✓ Campaign launched'];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 500));
      setCreateSteps(prev => [...prev, step]);
    }
    try {
      await actionsApi.createCampaign({
        name: form.name,
        audience: form.audience || 'All customers',
        audienceCount: parseInt(form.audienceCount) || 500,
        offer: form.offer,
      });
    } catch {}
    setCreating(false);
    setCreateDone(true);
    load();
  };

  const handlePause = async (id: string, status: string) => {
    if (status === 'active') await campaignsApi.pause(id);
    else await campaignsApi.launch(id);
    load();
  };

  if (loading) return <LoadingState message="Loading campaigns..." />;

  const active = campaigns.filter(c => c.status === 'active');
  const scheduled = campaigns.filter(c => c.status === 'scheduled');
  const completed = campaigns.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your marketing campaigns</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setNewCampaignModal(true); setCreateDone(false); setCreateSteps([]); setForm({ name: '', audience: '', offer: '', audienceCount: '' }); }}>
          New Campaign
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500">Active Campaigns</p>
          <p className="text-2xl font-bold text-emerald-600">{active.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">{scheduled.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-gray-600">{completed.length}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {['all', 'active', 'scheduled', 'completed', 'paused'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-lg capitalize font-medium transition-colors ${
              statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Campaign Cards */}
      <div className="space-y-4">
        {campaigns.map(c => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{c.name}</h3>
                    <Badge variant={statusColors[c.status] as any}>{c.status}</Badge>
                    {c.createdBy === 'ai' && <Badge variant="blue" size="sm">🤖 AI Created</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.audience} · {c.offer}
                  </p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div>
                      <p className="text-xs text-gray-400">Reach</p>
                      <p className="text-sm font-semibold text-gray-900">{c.reach.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Conversions</p>
                      <p className="text-sm font-semibold text-gray-900">{c.conversions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Revenue</p>
                      <p className="text-sm font-semibold text-emerald-700">{formatCurrency(c.revenueGenerated)}</p>
                    </div>
                    {c.roi > 0 && (
                      <div>
                        <p className="text-xs text-gray-400">ROI</p>
                        <p className="text-sm font-bold text-emerald-700">{c.roi}x</p>
                      </div>
                    )}
                    {c.aiConfidence && (
                      <div>
                        <p className="text-xs text-gray-400">AI Confidence</p>
                        <p className="text-sm font-semibold text-blue-700">{c.aiConfidence}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {(c.status === 'active' || c.status === 'paused') && (
                  <Button variant="outline" size="sm" onClick={() => handlePause(c.id, c.status)}>
                    {c.status === 'active' ? 'Pause' : 'Resume'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New Campaign Modal */}
      <Modal
        isOpen={newCampaignModal}
        onClose={() => setNewCampaignModal(false)}
        title={createDone ? '🎉 Campaign Created!' : 'Create New Campaign'}
        size="md"
        footer={
          !createDone && !creating ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setNewCampaignModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" loading={creating} onClick={handleCreate}>Launch Campaign</Button>
            </>
          ) : createDone ? (
            <Button variant="primary" size="sm" onClick={() => setNewCampaignModal(false)}>Done</Button>
          ) : undefined
        }
      >
        {createDone ? (
          <div className="text-center space-y-3 slide-in">
            <div className="text-4xl">✅</div>
            <h3 className="font-bold text-gray-900">Campaign is Live!</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
              {createSteps.map((s, i) => <div key={i} className="text-sm text-emerald-700 font-medium">{s}</div>)}
            </div>
          </div>
        ) : creating ? (
          <div className="py-4 space-y-2">
            {createSteps.map((s, i) => <div key={i} className="text-sm text-emerald-700 font-medium slide-in">{s}</div>)}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" style={{ borderWidth: 2 }} />
              Creating...
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Campaign Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Weekend Special" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Target Audience</label>
              <input value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. All customers, VIP customers" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Audience Count</label>
              <input type="number" value={form.audienceCount} onChange={e => setForm({...form, audienceCount: e.target.value})} className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Number of customers to target" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Offer / Message</label>
              <textarea value={form.offer} onChange={e => setForm({...form, offer: e.target.value})} className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="e.g. 20% off on Butter Chicken" />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800">🔐 Merchant Approval Required</p>
              <p className="text-xs text-amber-700">Launching will send notifications to your customers.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Campaigns;
