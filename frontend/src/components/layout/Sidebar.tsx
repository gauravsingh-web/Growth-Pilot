import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Bot, TrendingUp, BarChart3, Users, 
  ShoppingBag, Megaphone, Zap, History, Settings, 
  ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/copilot', icon: Bot, label: 'AI Copilot' },
  { path: '/opportunities', icon: TrendingUp, label: 'Opportunities' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/products', icon: ShoppingBag, label: 'Products' },
  { path: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { path: '/ai-actions', icon: Zap, label: 'AI Actions' },
  { path: '/history', icon: History, label: 'Action History' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } min-h-screen flex-shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">GrowthPilot</p>
            <p className="text-xs text-gray-400">AI Business Partner</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}
              />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Demo Mode Badge */}
      {!collapsed && (
        <div className="mx-2 mb-4 px-3 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 pulse-dot" />
            <p className="text-xs font-semibold text-amber-700">Demo Mode</p>
          </div>
          <p className="text-xs text-amber-600 mt-0.5">Synthetic data loaded</p>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
};

export default Sidebar;
