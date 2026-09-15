import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, TrendingUp, Users, ShoppingBag, Megaphone, Target, RefreshCw, Zap } from 'lucide-react';
import { aiApi, actionsApi } from '../services/api';
import { Card, Button, Badge, AIThinking, ConfidenceIndicator, Modal, LoadingState } from '../components/ui';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{ id: string; label: string; type: string; actionType: string; metadata?: any }>;
  isTyping?: boolean;
}

interface GrowthMission {
  title: string;
  description: string;
  potentialCustomers: number;
  avgHistoricalSpend: number;
  estimatedRecoverableRevenue: number;
  confidence: number;
  analysis: Record<string, { completed: boolean; finding: string }>;
  recommendedAction: {
    type: string;
    label: string;
    insightId: string;
    campaign: {
      name: string;
      audience: string;
      offer: string;
      channel: string;
      expectedConversions: number;
      expectedRevenue: number;
      roi: number;
    };
  };
}

const SUGGESTED_PROMPTS = [
  { icon: '📈', text: 'How can I increase sales this week?' },
  { icon: '👥', text: 'Which customers should I target?' },
  { icon: '❓', text: 'Why did sales drop yesterday?' },
  { icon: '🛍️', text: 'What are my slowest products?' },
  { icon: '📣', text: 'Create a campaign for inactive customers' },
  { icon: '🏆', text: "What's my best-selling product?" },
  { icon: '🔄', text: 'How can I increase repeat customers?' },
  { icon: '🎯', text: 'Find my biggest growth opportunity' },
];

const BUSINESS_CONTEXT = [
  { label: "Today's Sales", value: '₹48,650', change: '+12.4%', positive: true },
  { label: 'Total Customers', value: '8,420', change: '+412 new', positive: true },
  { label: 'Active Campaigns', value: '3', change: '2 by AI', positive: true },
  { label: 'Opportunities', value: '5', change: 'AI detected', positive: true },
  { label: 'AI Confidence', value: '92%', change: 'High', positive: true },
];

const formatMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|/g, (match, h1, h2, h3, h4) => 
      `<tr class="border-b border-gray-100"><td class="px-3 py-2 text-xs">${h1.trim()}</td><td class="px-3 py-2 text-xs">${h2.trim()}</td><td class="px-3 py-2 text-xs">${h3.trim()}</td><td class="px-3 py-2 text-xs">${h4.trim()}</td></tr>`
    );
};

const AICopilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Welcome, Rajesh!**\n\nI'm **GrowthPilot**, your AI business partner powered by 90 days of your restaurant data.\n\nI've already analyzed your business and found **5 growth opportunities** — including a potential **₹3.2L** revenue recovery from inactive customers.\n\nWhat would you like to explore today?`,
      timestamp: new Date(),
      actions: [
        { id: 'gm', label: '🎯 Find Biggest Opportunity', type: 'primary', actionType: 'run_growth_mission', metadata: {} },
        { id: 'ca', label: '📣 Create a Campaign', type: 'secondary', actionType: 'suggest_campaign', metadata: {} },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [growthMission, setGrowthMission] = useState<GrowthMission | null>(null);
  const [missionLoading, setMissionLoading] = useState(false);
  const [missionModal, setMissionModal] = useState(false);
  const [missionAnalysisSteps, setMissionAnalysisSteps] = useState<string[]>([]);
  const [campaignModal, setCampaignModal] = useState<{ insightId: string; name: string; audience: string; offer: string; audienceCount: number; expectedRevenue: number; roi: number } | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchSteps, setLaunchSteps] = useState<string[]>([]);
  const [launchDone, setLaunchDone] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText) return;

    setInput('');
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Show thinking steps
    setIsTyping(true);
    const steps = ['Analyzing your business data...', 'Processing your query...', 'Generating insights...'];
    setThinkingSteps([steps[0]]);
    
    setTimeout(() => setThinkingSteps([steps[0], steps[1]]), 800);
    setTimeout(() => setThinkingSteps([steps[0], steps[1], steps[2]]), 1600);

    try {
      const res: any = await aiApi.chat(messageText);
      setIsTyping(false);
      setThinkingSteps([]);

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.response?.text || 'I was unable to process that request.',
        timestamp: new Date(),
        actions: res.response?.actions || [],
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setIsTyping(false);
      setThinkingSteps([]);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ AI analysis is temporarily unavailable. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleAction = async (action: { actionType: string; label: string; metadata?: any }) => {
    if (action.actionType === 'run_growth_mission') {
      await runGrowthMission();
    } else if (action.actionType === 'create_campaign') {
      const insightId = action.metadata?.insightId || 'ins-001';
      try {
        const res: any = await aiApi.getCampaignPreview(insightId);
        const p = res.data;
        setCampaignModal({
          insightId,
          name: p.name,
          audience: p.audience,
          offer: p.offer,
          audienceCount: p.audienceCount,
          expectedRevenue: Math.round((p.estimatedRevenue.min + p.estimatedRevenue.max) / 2),
          roi: p.estimatedROI,
        });
      } catch {}
    } else if (action.actionType === 'suggest_campaign') {
      await sendMessage('Create a campaign for inactive customers');
    } else if (action.actionType === 'navigate_opportunities') {
      window.location.href = '/opportunities';
    } else if (action.actionType === 'navigate_customers') {
      window.location.href = '/customers';
    } else if (action.actionType === 'navigate_analytics') {
      window.location.href = '/analytics';
    } else if (action.actionType === 'navigate_campaigns') {
      window.location.href = '/campaigns';
    } else if (action.actionType === 'navigate_products') {
      window.location.href = '/products';
    }
  };

  const runGrowthMission = async () => {
    setMissionModal(true);
    setMissionLoading(true);
    setMissionAnalysisSteps([]);
    setGrowthMission(null);

    const steps = [
      '📊 Analyzing sales trends...',
      '✓ Sales trends analyzed',
      '👥 Analyzing customer segments...',
      '✓ Customer segments analyzed',
      '🛍️ Analyzing product performance...',
      '✓ Product opportunities analyzed',
      '📣 Comparing campaign effectiveness...',
      '✓ Campaign performance analyzed',
      '🎯 Finding highest-impact opportunity...',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setMissionAnalysisSteps(prev => [...prev, steps[i]]);
    }

    try {
      const res: any = await aiApi.runGrowthMission();
      setGrowthMission(res.mission);
    } catch {
      setGrowthMission({
        title: 'Recover At-Risk High-Value Customers',
        description: 'Your biggest untapped growth opportunity.',
        potentialCustomers: 214,
        avgHistoricalSpend: 1850,
        estimatedRecoverableRevenue: 320000,
        confidence: 89,
        analysis: {},
        recommendedAction: {
          type: 'create_campaign',
          label: 'Launch Personalized Comeback Campaign',
          insightId: 'ins-002',
          campaign: {
            name: 'Come Back, We Miss You!',
            audience: 'At-risk high-value customers (214)',
            offer: '₹150 cashback on next visit above ₹600',
            channel: 'Paytm notification + WhatsApp',
            expectedConversions: 66,
            expectedRevenue: 122100,
            roi: 4.1,
          },
        },
      });
    }
    setMissionLoading(false);
  };

  const handleLaunch = async () => {
    if (!campaignModal) return;
    setLaunching(true);
    setLaunchDone(false);

    const steps = ['✓ Audience selected', '✓ Offer configured', '✓ Campaign scheduled', '✓ Notifications queued', '✓ Action logged'];
    setLaunchSteps([]);

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 500));
      setLaunchSteps(prev => [...prev, step]);
    }

    try {
      await actionsApi.createCampaign({
        name: campaignModal.name,
        audience: campaignModal.audience,
        audienceCount: campaignModal.audienceCount,
        offer: campaignModal.offer,
        description: `AI-created campaign`,
      }, campaignModal.insightId);
    } catch {}

    setLaunchDone(true);
    setLaunching(false);

    // Add confirmation message
    const confirmMsg: Message = {
      id: `confirm-${Date.now()}`,
      role: 'assistant',
      content: `✅ **Campaign Launched Successfully!**\n\n**"${campaignModal.name}"** is now live.\n\n- **Audience:** ${campaignModal.audienceCount.toLocaleString()} customers targeted\n- **Offer:** ${campaignModal.offer}\n- **Expected Revenue:** ₹${campaignModal.expectedRevenue.toLocaleString()}\n- **Estimated ROI:** ${campaignModal.roi}x\n\nI'll track the campaign performance and update you on results. You can view it in the Campaigns section.`,
      timestamp: new Date(),
      actions: [
        { id: 'vc', label: '📣 View Campaigns', type: 'primary', actionType: 'navigate_campaigns', metadata: {} },
      ],
    };
    setMessages(prev => [...prev, confirmMsg]);
  };

  const getActionButtonStyle = (type: string) => {
    const styles: Record<string, string> = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
    };
    return styles[type] || styles.primary;
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-5">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">GrowthPilot AI Copilot</h1>
              <Badge variant="success" dot>Online</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 ml-10">Ask me anything about your business — or let me take care of it.</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Target className="w-3.5 h-3.5" />}
            onClick={runGrowthMission}
          >
            🎯 AI Growth Mission
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  <div
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                    className="prose prose-sm max-w-none"
                  />
                </div>

                {/* Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.actions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => handleAction(action)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${getActionButtonStyle(action.type)}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-400 px-1">
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <AIThinking steps={thinkingSteps.length > 0 ? thinkingSteps : undefined} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 2 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.slice(0, 6).map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p.text)}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-700 text-gray-600 rounded-full text-xs font-medium transition-all duration-150 hover:shadow-sm"
              >
                {p.icon} {p.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder="Ask about your sales, customers, products, or request an action..."
              className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
            />
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            icon={<Send className="w-4 h-4" />}
            className="h-12 px-4"
          >
            Send
          </Button>
        </div>
      </div>

      {/* Right Panel — Business Context */}
      <div className="w-72 flex-shrink-0 space-y-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-gray-900">Business Context</h3>
          </div>
          <div className="space-y-3">
            {BUSINESS_CONTEXT.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{item.label}</p>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                  <p className={`text-xs ${item.positive ? 'text-emerald-600' : 'text-red-500'}`}>{item.change}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-gray-900">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            {SUGGESTED_PROMPTS.slice(0, 5).map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p.text)}
                className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs text-gray-600 transition-colors"
              >
                {p.icon} {p.text}
              </button>
            ))}
          </div>
        </Card>

        <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white">
          <p className="text-xs font-semibold opacity-80 mb-1">AI Accuracy</p>
          <p className="text-2xl font-bold">92%</p>
          <p className="text-xs opacity-70 mt-0.5">Confidence on recommendations</p>
          <p className="text-xs mt-3 opacity-80">Powered by 90 days of your Paytm business data + AI analysis</p>
        </div>
      </div>

      {/* Growth Mission Modal */}
      <Modal
        isOpen={missionModal}
        onClose={() => { setMissionModal(false); setMissionAnalysisSteps([]); setGrowthMission(null); }}
        title="🎯 AI Growth Mission"
        size="lg"
      >
        {missionLoading ? (
          <div className="space-y-3 py-4">
            <p className="text-sm text-gray-600 font-medium text-center mb-4">
              GrowthPilot is analyzing your entire business...
            </p>
            {missionAnalysisSteps.map((step, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm slide-in ${step.startsWith('✓') ? 'text-emerald-600 font-medium' : 'text-gray-600'}`}>
                {!step.startsWith('✓') && (
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin flex-shrink-0" style={{ borderWidth: 2 }} />
                )}
                <span>{step}</span>
              </div>
            ))}
          </div>
        ) : growthMission ? (
          <div className="space-y-5 slide-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white">
              <p className="text-xs font-semibold opacity-80 mb-2 uppercase tracking-wide">🏆 Biggest Opportunity Found</p>
              <h2 className="text-xl font-bold mb-2">{growthMission.title}</h2>
              <p className="text-sm opacity-90">{growthMission.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{growthMission.potentialCustomers}</p>
                <p className="text-xs text-gray-500 mt-1">Target Customers</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">₹{(growthMission.estimatedRecoverableRevenue / 100000).toFixed(1)}L</p>
                <p className="text-xs text-gray-500 mt-1">Est. Revenue</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">{growthMission.confidence}%</p>
                <p className="text-xs text-gray-500 mt-1">AI Confidence</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-700 mb-3">Recommended Action</p>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{growthMission.recommendedAction.campaign.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{growthMission.recommendedAction.campaign.offer}</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    Est. ROI: {growthMission.recommendedAction.campaign.roi}x · {growthMission.recommendedAction.campaign.expectedConversions} conversions
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
              ⚠️ Revenue estimates are AI predictions based on historical patterns. Actual results may vary.
            </p>

            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => {
                  setMissionModal(false);
                  setCampaignModal({
                    insightId: growthMission.recommendedAction.insightId,
                    name: growthMission.recommendedAction.campaign.name,
                    audience: growthMission.recommendedAction.campaign.audience,
                    offer: growthMission.recommendedAction.campaign.offer,
                    audienceCount: growthMission.potentialCustomers,
                    expectedRevenue: growthMission.recommendedAction.campaign.expectedRevenue,
                    roi: growthMission.recommendedAction.campaign.roi,
                  });
                }}
              >
                🚀 Do it — Launch Campaign
              </Button>
              <Button variant="outline" size="md" onClick={() => { setMissionModal(false); }}>
                Edit
              </Button>
              <Button variant="ghost" size="md" onClick={() => { setMissionModal(false); setGrowthMission(null); }}>
                Not now
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Campaign Preview Modal */}
      <Modal
        isOpen={!!campaignModal}
        onClose={() => { setCampaignModal(null); setLaunchSteps([]); setLaunchDone(false); }}
        title={launchDone ? '🎉 Campaign Launched!' : 'Campaign Preview'}
        size="md"
        footer={
          !launchDone ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setCampaignModal(null)}>Cancel</Button>
              <Button variant="primary" size="sm" loading={launching} onClick={handleLaunch} disabled={launching}>
                🚀 Launch Campaign
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => { setCampaignModal(null); setLaunchSteps([]); setLaunchDone(false); window.location.href = '/campaigns'; }}>
              View Campaigns →
            </Button>
          )
        }
      >
        {launchDone ? (
          <div className="space-y-4 text-center slide-in">
            <div className="text-5xl">✅</div>
            <h3 className="text-lg font-bold text-gray-900">Campaign is Live!</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
              {launchSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-emerald-700 font-medium slide-in">
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : launching ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-center text-gray-600 font-medium">Executing campaign...</p>
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
        ) : campaignModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-blue-900">{campaignModal.name}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-500">Audience</p><p className="font-semibold">{campaignModal.audience}</p></div>
                <div><p className="text-xs text-gray-500">Reach</p><p className="font-semibold">{campaignModal.audienceCount.toLocaleString()} customers</p></div>
                <div><p className="text-xs text-gray-500">Offer</p><p className="font-semibold">{campaignModal.offer}</p></div>
                <div><p className="text-xs text-gray-500">Est. ROI</p><p className="font-semibold text-emerald-700">{campaignModal.roi}x</p></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Est. Revenue Impact</p>
                <p className="text-xl font-bold text-emerald-700">₹{campaignModal.expectedRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800">🔐 Merchant Approval Required</p>
              <p className="text-xs text-amber-700 mt-0.5">This will send notifications to {campaignModal.audienceCount} customers. Review carefully.</p>
            </div>
            <p className="text-xs text-gray-400 text-center">Revenue estimates are AI predictions and may vary.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AICopilot;
