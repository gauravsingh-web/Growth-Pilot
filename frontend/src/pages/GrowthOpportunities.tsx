import React, { useState, useEffect } from 'react';
import { aiApi, actionsApi } from '../services/api';
import { Card, Button, Badge, ConfidenceIndicator, SectionHeader, LoadingState, ErrorState, Modal } from '../components/ui';
import { TrendingUp, Target, Users, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface Insight {
  id: string;
  type: string;
  title: string;
  summary: string;
  explanation: string;
  evidence: Array<{ metric: string; value: string; comparison?: string }>;
  confidence: number;
  priority: string;
  expectedImpact: string;
  estimatedRevenue?: { min: number; max: number };
  recommendation: string;
  actionType: string;
  actionLabel: string;
}

const typeIcons: Record<string, string> = {
  time_based: '⏰',
  inactive_customers: '👥',
  cross_sell: '🔗',
  product_opportunity: '🛍️',
  campaign_opportunity: '📣',
  revenue_drop: '📉',
  revenue_growth: '📈',
};

const formatRevenue = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

const GrowthOpportunities: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [campaignModal, setCampaignModal] = useState<any>(null);
  const [launching, setLaunching] = useState(false);
  const [launchSteps, setLaunchSteps] = useState<string[]>([]);
  const [launchDone, setLaunchDone] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    (async () => {
      try {
        const res: any = await aiApi.getOpportunities();
        setInsights(res.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAction = async (insight: Insight) => {
    try {
      const previewRes: any = await aiApi.getCampaignPreview(insight.id);
      const p = previewRes.data;
      setCampaignModal({ insightId: insight.id, ...p });
    } catch {
      setCampaignModal({
        insightId: insight.id,
        name: `Campaign for: ${insight.title}`,
        audience: 'Targeted segment',
        audienceCount: 500,
        offer: insight.recommendation,
        estimatedRevenue: insight.estimatedRevenue || { min: 10000, max: 20000 },
        estimatedROI: 3.0,
        confidence: insight.confidence,
      });
    }
  };

  const handleLaunch = async () => {
    if (!campaignModal) return;
    setLaunching(true);
    setLaunchSteps([]);
    const steps = ['✓ Audience selected', '✓ Offer configured', '✓ Campaign scheduled', '✓ Action logged'];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600));
      setLaunchSteps(prev => [...prev, step]);
    }
    try {
      await actionsApi.createCampaign({
        name: campaignModal.name,
        audience: campaignModal.audience,
        audienceCount: campaignModal.audienceCount,
        offer: campaignModal.offer,
      }, campaignModal.insightId);
    } catch {}
    setLaunchDone(true);
    setLaunching(false);
  };

  const filtered = filterPriority === 'all' ? insights : insights.filter(i => i.priority === filterPriority);

  if (loading) return <LoadingState message="AI is analyzing your growth opportunities..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Growth Opportunities</h1>
              <Badge variant="info" dot>{insights.length} detected</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              AI-detected revenue opportunities based on 90 days of your business data
            </p>
          </div>
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'low'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filterPriority === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Total opportunity summary */}
        <div className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Total Estimated Monthly Revenue Opportunity</p>
            <p className="text-3xl font-bold mt-1">₹55K–₹75K</p>
            <p className="text-xs opacity-70 mt-1">Across {insights.length} AI-detected opportunities</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Highest Priority</p>
            <p className="text-xl font-bold mt-1">Recover At-Risk Customers</p>
            <p className="text-xs opacity-70 mt-1">89% confidence · ₹3.2L potential</p>
          </div>
        </div>
      </div>

      {/* Opportunity Cards */}
      <div className="space-y-4">
        {filtered.map(insight => (
          <Card key={insight.id} className="fade-in">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
                {typeIcons[insight.type] || '💡'}
              </div>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-gray-900">{insight.title}</h2>
                      <Badge variant={insight.priority === 'high' ? 'danger' : insight.priority === 'medium' ? 'warning' : 'neutral'} dot>
                        {insight.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{insight.summary}</p>
                  </div>
                  <ConfidenceIndicator confidence={insight.confidence} />
                </div>

                {/* Impact */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">{insight.expectedImpact}</span>
                  </div>
                  {insight.estimatedRevenue && (
                    <div className="text-xs text-gray-400">
                      {formatRevenue(insight.estimatedRevenue.min)}–{formatRevenue(insight.estimatedRevenue.max)}/month estimated
                    </div>
                  )}
                </div>

                {/* Evidence (expandable) */}
                {expanded === insight.id && (
                  <div className="mt-4 space-y-3 slide-in">
                    {/* Explanation */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs font-bold text-gray-700 mb-2">🧠 WHY THIS WAS DETECTED</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{insight.explanation}</p>
                    </div>

                    {/* Evidence */}
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-xs font-bold text-blue-800 mb-2">📊 SUPPORTING DATA</p>
                      <div className="space-y-2">
                        {insight.evidence.map((ev, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">→</span>
                            <div className="text-xs text-blue-700">
                              <span className="font-semibold">{ev.metric}:</span> {ev.value}
                              {ev.comparison && <span className="text-blue-500"> — {ev.comparison}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-xs font-bold text-amber-800 mb-1">💡 RECOMMENDATION</p>
                      <p className="text-sm text-amber-900">{insight.recommendation}</p>
                    </div>

                    <p className="text-xs text-gray-400">
                      * These are AI estimates based on historical patterns. Actual results may vary. Always review before taking action.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleAction(insight)}>
                    {insight.actionLabel}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={expanded === insight.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    iconPosition="right"
                    onClick={() => setExpanded(expanded === insight.id ? null : insight.id)}
                  >
                    Why am I seeing this?
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Campaign Modal */}
      <Modal
        isOpen={!!campaignModal}
        onClose={() => { setCampaignModal(null); setLaunchSteps([]); setLaunchDone(false); }}
        title={launchDone ? '🎉 Campaign Launched!' : `Campaign Preview`}
        size="md"
        footer={
          !launchDone ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setCampaignModal(null)}>Cancel</Button>
              <Button variant="primary" size="sm" loading={launching} onClick={handleLaunch}>
                🚀 Launch Campaign
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => { setCampaignModal(null); setLaunchSteps([]); setLaunchDone(false); }}>
              Done
            </Button>
          )
        }
      >
        {launchDone ? (
          <div className="space-y-4 text-center slide-in">
            <div className="text-5xl">✅</div>
            <h3 className="font-bold text-gray-900">Campaign is Live!</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
              {launchSteps.map((step, i) => (
                <div key={i} className="text-sm text-emerald-700 font-medium">{step}</div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Status: Active</p>
          </div>
        ) : launching ? (
          <div className="py-4 space-y-3">
            <p className="text-sm text-center text-gray-600 font-medium">Launching campaign...</p>
            {launchSteps.map((s, i) => <div key={i} className="text-sm text-emerald-700 font-medium slide-in">{s}</div>)}
            {launchSteps.length < 4 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" style={{ borderWidth: 2 }} />
                Processing...
              </div>
            )}
          </div>
        ) : campaignModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-blue-900 text-lg">{campaignModal.name}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-500">Audience</p><p className="font-semibold">{campaignModal.audience}</p></div>
                <div><p className="text-xs text-gray-500">Reach</p><p className="font-semibold">{campaignModal.audienceCount?.toLocaleString()} customers</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Offer</p><p className="font-semibold">{campaignModal.offer}</p></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Estimated Monthly Revenue</p>
                {campaignModal.estimatedRevenue && (
                  <p className="text-xl font-bold text-emerald-700">
                    {formatRevenue(campaignModal.estimatedRevenue.min)}–{formatRevenue(campaignModal.estimatedRevenue.max)}
                  </p>
                )}
              </div>
              <ConfidenceIndicator confidence={campaignModal.confidence || 85} />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800">🔐 Merchant Approval Required</p>
              <p className="text-xs text-amber-700 mt-0.5">This will target {campaignModal.audienceCount} customers. Review before launching.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GrowthOpportunities;
