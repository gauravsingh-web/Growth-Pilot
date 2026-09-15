# Paytm GrowthPilot AI 🚀

**Track 1: Merchant Growth AI — Paytm Hackathon 2026**

> *"Your AI business partner, powered by your Paytm business data."*

---

## 🎯 Problem

Over 30 million merchants use Paytm, but most lack the analytical tools, time, or expertise to turn their payment data into actionable business decisions. They don't know:
- Why sales dropped yesterday
- Which customers are about to leave
- Which products are underperforming
- What promotions to run and for whom

## 💡 Solution

**GrowthPilot AI** is an AI-powered business copilot that transforms raw payment and sales data into intelligent business decisions — and executes them.

```
DATA → AI INSIGHT → RECOMMENDATION → MERCHANT APPROVAL → ACTION → RESULT
```

The AI doesn't just tell merchants what to do. It **does it for them** — with their approval.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)               │
│  Dashboard | Copilot | Analytics | Customers | Products  │
│  Campaigns | AI Actions | Action History | Settings      │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP (proxied)
┌─────────────────────────▼───────────────────────────────┐
│                   Backend (Node.js + Express)            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              AI Service Layer                    │   │
│  │  AIProvider                                      │   │
│  │  ├── GeminiProvider (when GEMINI_API_KEY set)   │   │
│  │  └── DemoAIProvider (deterministic fallback)    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Data Layer                          │   │
│  │  Synthetic Merchant Data (90 days, seeded)      │   │
│  │  Merchant | Transactions | Customers | Products  │   │
│  │  Campaigns | AI Insights | AI Actions           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Routes: /api/analytics | /api/ai | /api/actions        │
│          /api/customers | /api/products | /api/campaigns│
└─────────────────────────────────────────────────────────┘
```

### AI Agent Architecture

```
Merchant Context Engine
↓
Data Analysis Engine (90 days of sales, customers, products)
↓
Opportunity Detection Engine (5 insight types)
↓
Recommendation Engine (confidence-scored)
↓
Action Planner (campaign templates, impact estimates)
↓
Action Executor (mock APIs — campaign creation, segmentation)
↓
Outcome Tracker (action history, results)
```

---

## ✨ Features

### Dashboard
- Real-time KPI cards (Revenue, Transactions, AOV, Retention)
- AI Business Health Score (82/100 with 5-dimensional breakdown)
- Interactive sales trend charts (7/14/30 day views)
- AI Daily Brief with proactive alerts
- Growth opportunity cards with one-click actions

### AI Copilot
- Natural language conversation interface
- Context-aware responses based on merchant data
- Action buttons embedded in responses (Create Campaign, Analyze, etc.)
- **AI Growth Mission** — analyzes entire business to find #1 opportunity
- Campaign preview → approval → execution flow with live progress

### Growth Opportunities
- 5 AI-detected opportunities from 90 days of data
- Expandable explainability panels ("Why am I seeing this?")
- Evidence-based confidence scores (72%–92%)
- One-click campaign creation from any insight

### Sales Analytics
- Interactive charts: Area, Bar, Pie
- Filters: Today / 7 Days / 30 Days / 90 Days
- Revenue, Transactions, Average Order Value views
- Hourly sales pattern with peak detection
- Category breakdown pie chart
- New vs returning customer stacked chart

### Customer Intelligence
- 8,420 customers across 7 AI segments (VIP, At-Risk, Inactive, etc.)
- Segment-specific AI recommendations
- Filterable customer table
- Campaign creation from any segment

### Product Intelligence
- Full menu performance table
- AI insights per product (growth, decline, bundle opportunity)
- Beverage attachment rate analysis
- Sortable by revenue / orders / trend

### Campaign Management
- Active, Scheduled, Completed campaigns
- AI-created vs merchant-created labels
- ROI and conversion tracking
- Campaign creation form with approval step
- Pause/Resume controls

### AI Actions
- Complete action log with transparency
- Undo capability for applicable actions
- Initiated-by indicator (AI vs Merchant)
- Reason, result, and timestamp for each action

### Action History
- Date-grouped timeline view
- Visual timeline indicators
- Full audit trail

### Settings
- Merchant profile
- Data source connections
- AI & Data Controls (responsible AI section)
- Future Roadmap (Phases 1–6)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | Node.js, Express |
| AI (Primary) | Google Gemini 1.5 Flash (optional) |
| AI (Fallback) | Custom DemoAIProvider (deterministic) |
| Data | Synthetic seeded data (90 days) |
| Icons | Lucide React |

---

## 🚀 Setup & Running

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment (Optional: Gemini AI)

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY to enable real AI responses
# Without it, the app works perfectly with DemoAI
```

### 3. Start Backend

```bash
# From /backend directory
npm start
# or for development with auto-reload:
npm run dev
```

Backend runs on: **http://localhost:5000**

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 5. Start Frontend

```bash
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 🔑 Environment Variables

### Backend (`/backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port (default: 5000) |
| `GEMINI_API_KEY` | No | Google Gemini API key for real AI responses |
| `NODE_ENV` | No | `development` or `production` |

> **Note:** The app works fully without `GEMINI_API_KEY` using the DemoAIProvider.

---

## 🎬 Demo Mode

The application ships in **Demo Mode** by default:

- **Merchant:** Rajesh Kumar — Rajesh Family Restaurant, Karol Bagh, New Delhi
- **Data:** 90 days of synthetic sales data (deterministic seed)
- **AI:** DemoAIProvider with context-aware responses for all query types
- **Customers:** 8,420 synthetic customer profiles across 7 segments
- **Products:** 12 menu items with realistic revenue and trend data

> All data is clearly labeled as "Synthetic Demo Data"

---

## 🤖 AI Workflow

### Implemented AI Actions

1. **`POST /api/ai/chat`** — Natural language copilot with intent detection
2. **`POST /api/ai/growth-mission`** — Full business analysis to find #1 opportunity
3. **`GET /api/ai/opportunities`** — 5 pre-detected AI business insights
4. **`GET /api/ai/campaign-preview/:insightId`** — AI-generated campaign template
5. **`POST /api/actions/create-campaign`** — Creates campaign + logs action
6. **`POST /api/actions/create-offer`** — Creates promotional offer
7. **`POST /api/actions/send-customer-message`** — Queues customer messages
8. **`POST /api/actions/generate-business-report`** — Generates analysis report
9. **`POST /api/actions/undo/:id`** — Undoes a logged action

### AI Insight Types
- `time_based` — Sales patterns by time of day / week
- `inactive_customers` — At-risk customer detection
- `cross_sell` — Product attachment rate opportunities
- `product_opportunity` — Declining product alerts
- `campaign_opportunity` — Revenue recovery opportunities

---

## 🗺️ API Reference

```
GET  /health                          Health check
GET  /api/merchant                    Merchant profile

GET  /api/analytics/dashboard         Dashboard KPIs
GET  /api/analytics/sales?period=30   Daily sales data
GET  /api/analytics/hourly            Hourly sales pattern
GET  /api/analytics/category          Revenue by category

GET  /api/customers                   Customer list (filterable)
GET  /api/customers/segments          AI segment summary
GET  /api/customers/summary           Quick stats

GET  /api/products                    Product list (sortable)
GET  /api/products/top                Top performing products
GET  /api/products/slow               Declining products

GET  /api/campaigns                   Campaign list
POST /api/campaigns/create            Create campaign
POST /api/campaigns/:id/launch        Launch campaign
POST /api/campaigns/:id/pause         Pause campaign

POST /api/ai/chat                     AI copilot conversation
POST /api/ai/growth-mission           Full AI business analysis
GET  /api/ai/opportunities            AI-detected opportunities
GET  /api/ai/campaign-preview/:id     Campaign template generation
POST /api/ai/mark-insight-read/:id    Mark insight as read

GET  /api/actions/history             Action log
POST /api/actions/create-campaign     Create campaign + log action
POST /api/actions/create-offer        Create offer + log action
POST /api/actions/generate-report     Generate report + log
POST /api/actions/undo/:id            Undo an action

GET  /api/notifications               Proactive AI notifications
POST /api/notifications/mark-read/:id Mark notification read
POST /api/notifications/mark-all-read Mark all notifications read
```

---

## 🎬 Demo Flow (3–5 minutes)

1. **Open Dashboard** → See greeting, KPI cards, AI health score (82/100)
2. **View AI Insights** → 3 growth opportunities with confidence scores
3. **Click "Increase weekday sales"** → AI explains the 18% revenue gap
4. **Click "Create Lunch Campaign"** → Campaign preview with audience (1,240 customers)
5. **Click "Launch Campaign"** → See execution animation with live steps
6. **Open AI Copilot** → Click "AI Growth Mission"
7. **Watch multi-step analysis** → Sales → Customers → Products → Campaigns → Result
8. **See #1 opportunity** → "Recover 214 at-risk customers" (₹3.2L potential)
9. **Click "Do it"** → Full campaign creation flow
10. **Visit Action History** → See the complete audit trail

---

## 🔮 Future Roadmap

| Phase | Feature | Status |
|---|---|---|
| Phase 1 | Merchant Analytics Dashboard | ✅ Built |
| Phase 2 | AI Recommendations Engine | ✅ Built |
| Phase 3 | AI Action Execution System | ✅ Built |
| Phase 4 | Multi-channel Campaigns (WhatsApp, SMS, Email) | 🗺️ Planned |
| Phase 5 | Autonomous Growth Agent | 🗺️ Planned |
| Phase 6 | Personalized AI Partner for every Paytm merchant | 🗺️ Planned |

---

## 💙 Why This Matters for Paytm

Paytm processes transactions for **30+ million merchants** in India. Every transaction is a data signal.

**GrowthPilot turns those signals into revenue:**

- Payment data → Business intelligence
- Business intelligence → AI recommendations
- Recommendations → Merchant actions
- Actions → Revenue growth

**The vision:** Every small merchant in India gets an AI business partner — the kind of intelligence previously only available to large enterprises with dedicated analytics teams.

**The Paytm advantage:** Transaction data, merchant history, customer behavior, and payment patterns are uniquely available to Paytm. GrowthPilot is designed to be the intelligence layer on top of this data.

At scale, GrowthPilot could:
- Increase merchant GMV by 15–30%
- Improve merchant retention on Paytm
- Enable AI-powered credit decisions (spending patterns → loan eligibility)
- Create new revenue streams through premium AI features
- Differentiate Paytm's merchant product globally

---

## 📁 Project Structure

```
paytm-growthpilot/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── layout/        (Sidebar, Topbar, AppLayout)
│       │   └── ui/            (Design system components)
│       ├── pages/             (10 application pages)
│       ├── services/          (API service layer)
│       └── types/             (Shared TypeScript types)
├── backend/
│   └── src/
│       ├── ai/                (GeminiProvider, DemoAIProvider, AIService)
│       ├── data/              (Synthetic seed data — 90 days)
│       └── routes/            (API routes)
└── README.md
```

---

*Built with ❤️ for the Paytm Hackathon 2026 — Track 1: Merchant Growth AI*
#   G r o w t h - P i l o t  
 