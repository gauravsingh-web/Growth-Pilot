import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import AICopilot from './pages/AICopilot';
import GrowthOpportunities from './pages/GrowthOpportunities';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Campaigns from './pages/Campaigns';
import AIActions from './pages/AIActions';
import ActionHistory from './pages/ActionHistory';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/copilot" element={<AICopilot />} />
          <Route path="/opportunities" element={<GrowthOpportunities />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/ai-actions" element={<AIActions />} />
          <Route path="/history" element={<ActionHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;
