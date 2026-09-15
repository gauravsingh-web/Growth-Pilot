import React, { useState, useEffect } from 'react';
import { actionsApi } from '../services/api';
import { Card, Badge, Button, SectionHeader, LoadingState, EmptyState } from '../components/ui';
import { Zap, CheckCircle, XCircle, Clock, Undo } from 'lucide-react';

const typeIcons: Record<string, string> = {
  create_campaign: '📣',
  create_offer: '🎁',
  send_message: '💬',
  create_coupon: '🎫',
  generate_report: '📊',
  flag_risk: '⚠️',
  segment_customers: '👥',
  bundle_products: '🔗',
};

const statusBadge: Record<string, any> = {
  completed: { variant: 'success', label: '✓ Completed' },
  executing: { variant: 'info', label: '⟳ Executing' },
  pending: { variant: 'warning', label: '⏳ Pending' },
  failed: { variant: 'danger', label: '✕ Failed' },
  cancelled: { variant: 'neutral', label: '✕ Cancelled' },
};

const AIActions: React.FC = () => {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res: any = await actionsApi.getHistory();
      setActions(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUndo = async (id: string) => {
    try {
      await actionsApi.undo(id);
      load();
    } catch {}
  };

  if (loading) return <LoadingState message="Loading AI action history..." />;

  const completed = actions.filter(a => a.status === 'completed');
  const pending = actions.filter(a => a.status === 'pending');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Actions Center</h1>
        <p className="text-sm text-gray-500 mt-1">Actions performed by GrowthPilot on your behalf</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{completed.length}</p>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
          <p className="text-xs text-gray-500 mt-1">Pending Approval</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{actions.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Actions</p>
        </Card>
      </div>

      {/* AI Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-900">About AI Actions</p>
          <p className="text-sm text-blue-700 mt-0.5">
            GrowthPilot performs actions on your behalf based on AI analysis. All customer-facing actions require your approval before execution. 
            This log provides full transparency of what AI has done for your business.
          </p>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {actions.length === 0 ? (
          <EmptyState
            icon={<Zap />}
            title="No AI actions yet"
            description="GrowthPilot will automatically detect opportunities and suggest actions here."
          />
        ) : (
          actions.map(action => (
            <Card key={action.id} className="slide-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                  {typeIcons[action.type] || '🤖'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
                        <Badge variant={statusBadge[action.status]?.variant || 'neutral'} size="sm">
                          {statusBadge[action.status]?.label || action.status}
                        </Badge>
                        {action.initiatedBy === 'ai' && <Badge variant="blue" size="sm">🤖 AI</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                    </div>
                    {action.canUndo && action.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Undo className="w-3.5 h-3.5" />}
                        onClick={() => handleUndo(action.id)}
                        className="text-xs text-gray-400 hover:text-red-600"
                      >
                        Undo
                      </Button>
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Reason: </span>
                      <span className="text-gray-600">{action.reason}</span>
                    </div>
                    {action.result && (
                      <div className="md:col-span-2">
                        <span className="text-gray-400">Result: </span>
                        <span className={action.status === 'completed' ? 'text-emerald-700 font-medium' : 'text-gray-600'}>{action.result}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(action.initiatedAt).toLocaleString('en-IN', { 
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}</span>
                    {action.approvedAt && (
                      <>
                        <span>·</span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600">Approved</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AIActions;
