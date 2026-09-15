import React, { useState, useEffect } from 'react';
import { actionsApi } from '../services/api';
import { Card, LoadingState } from '../components/ui';
import { Clock } from 'lucide-react';

const typeIcons: Record<string, string> = {
  create_campaign: '📣',
  create_offer: '🎁',
  send_message: '💬',
  generate_report: '📊',
  segment_customers: '👥',
  bundle_products: '🔗',
};

const ActionHistory: React.FC = () => {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await actionsApi.getHistory();
        setActions(res.data || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState message="Loading action history..." />;

  // Group by date
  const grouped: Record<string, any[]> = {};
  actions.forEach(a => {
    const d = new Date(a.initiatedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label;
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(a);
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Action History</h1>
        <p className="text-sm text-gray-500 mt-1">Complete timeline of AI and merchant actions</p>
      </div>

      {Object.entries(grouped).map(([date, acts]) => (
        <div key={date}>
          <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200" />
            {date}
            <div className="h-px flex-1 bg-gray-200" />
          </h2>
          <div className="space-y-2">
            {acts.map(action => (
              <div key={action.id} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors slide-in">
                {/* Timeline dot */}
                <div className="flex flex-col items-center mt-1">
                  <div className={`w-3 h-3 rounded-full ${action.status === 'completed' ? 'bg-emerald-500' : action.status === 'cancelled' ? 'bg-gray-400' : 'bg-blue-500'}`} />
                  <div className="w-0.5 h-full bg-gray-100 mt-1 min-h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{typeIcons[action.type] || '🤖'}</span>
                      <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                      {action.initiatedBy === 'ai' && (
                        <span className="text-xs text-blue-600 font-medium">AI</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(action.initiatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                  {action.result && (
                    <p className="text-xs text-emerald-700 mt-1 font-medium">{action.result}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionHistory;
