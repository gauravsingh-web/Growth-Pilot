import React from 'react';
import { Card, Badge } from '../components/ui';
import { Shield, Brain, Eye, Lock, FileText, Database } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and AI preferences</p>
      </div>

      {/* Merchant Profile */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Business Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-gray-500">Merchant Name</p><p className="font-semibold text-gray-900">Rajesh Kumar</p></div>
          <div><p className="text-xs text-gray-500">Business Name</p><p className="font-semibold text-gray-900">Rajesh Family Restaurant</p></div>
          <div><p className="text-xs text-gray-500">Category</p><p className="font-semibold text-gray-900">Restaurant</p></div>
          <div><p className="text-xs text-gray-500">Location</p><p className="font-semibold text-gray-900">Karol Bagh, New Delhi</p></div>
          <div><p className="text-xs text-gray-500">Paytm Merchant ID</p><p className="font-semibold text-gray-900 font-mono">PTM-MRC-2022-00814</p></div>
          <div><p className="text-xs text-gray-500">Member Since</p><p className="font-semibold text-gray-900">March 2022</p></div>
        </div>
      </Card>

      {/* Connected Data */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">Connected Data Sources</h2>
        <div className="space-y-3">
          {[
            { icon: <Database className="w-4 h-4" />, label: 'Paytm Payments Data', status: 'Connected', color: 'text-emerald-600' },
            { icon: <Database className="w-4 h-4" />, label: 'Sales History (90 days)', status: 'Synced', color: 'text-emerald-600' },
            { icon: <Database className="w-4 h-4" />, label: 'Customer Data', status: '8,420 customers', color: 'text-emerald-600' },
            { icon: <Database className="w-4 h-4" />, label: 'Product Catalog', status: '12 items', color: 'text-emerald-600' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600">
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className={`text-xs font-medium ${item.color}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 font-semibold">🔬 Demo Mode Active</p>
          <p className="text-xs text-amber-700 mt-0.5">All data shown is synthetic demo data. No real Paytm merchant or customer data is used.</p>
        </div>
      </Card>

      {/* AI & Data Controls */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">AI & Data Controls</h2>
        </div>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Eye className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900">AI Recommendations</p>
              <p className="text-xs mt-0.5">AI recommendations are based on your historical business data. Revenue estimates are predictions, not guarantees.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
            <Shield className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-900">Merchant Approval</p>
              <p className="text-xs mt-0.5">All customer-facing actions — including campaigns, messages, and offers — require your explicit approval before execution.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Lock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-purple-900">Data Privacy</p>
              <p className="text-xs mt-0.5">Customer data is used only to generate business insights for you. Sensitive information is not exposed unnecessarily.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Audit Logs</p>
              <p className="text-xs mt-0.5">All AI actions are logged and visible in the Action History for complete transparency. You can undo applicable actions.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Mode */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">AI Configuration</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-gray-900">AI Provider</p>
              <p className="text-xs text-gray-500">Current engine powering GrowthPilot</p>
            </div>
            <Badge variant="info">Demo AI (Deterministic)</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-gray-900">Gemini Integration</p>
              <p className="text-xs text-gray-500">Set GEMINI_API_KEY in backend .env to enable</p>
            </div>
            <Badge variant="neutral">Not configured</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-gray-900">Data Mode</p>
              <p className="text-xs text-gray-500">Synthetic demo data loaded</p>
            </div>
            <Badge variant="warning" dot>Demo Mode</Badge>
          </div>
        </div>
      </Card>

      {/* Future Roadmap */}
      <Card>
        <h2 className="font-bold text-gray-900 mb-4">🚀 Future Roadmap</h2>
        <div className="space-y-3">
          {[
            { phase: 'Phase 1', title: 'Merchant Analytics', status: 'complete', desc: 'Sales, customer, and product analysis' },
            { phase: 'Phase 2', title: 'AI Recommendations', status: 'complete', desc: 'AI-detected opportunities and insights' },
            { phase: 'Phase 3', title: 'Action Execution', status: 'complete', desc: 'Campaign creation and action system' },
            { phase: 'Phase 4', title: 'Multi-channel Campaigns', status: 'planned', desc: 'WhatsApp, SMS, email, Paytm Push' },
            { phase: 'Phase 5', title: 'Autonomous Growth Agent', status: 'planned', desc: 'AI acts autonomously with merchant oversight' },
            { phase: 'Phase 6', title: 'AI Business Partner', status: 'planned', desc: 'Personalized AI partner for every Paytm merchant' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'complete' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">{item.phase}:</span>
                  <span className="text-sm font-semibold text-gray-900">{item.title}</span>
                  {item.status === 'complete' && <Badge variant="success" size="sm">✓ Built</Badge>}
                  {item.status === 'planned' && <Badge variant="neutral" size="sm">Planned</Badge>}
                </div>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Settings;
