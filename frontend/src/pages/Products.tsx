import React, { useState, useEffect } from 'react';
import { productsApi } from '../services/api';
import { Card, Badge, SectionHeader, LoadingState, TrendArrow } from '../components/ui';
import { ShoppingBag } from 'lucide-react';

const formatCurrency = (v: number) => `₹${v.toLocaleString('en-IN')}`;

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'revenue' | 'orders' | 'trend'>('revenue');

  useEffect(() => {
    (async () => {
      try {
        const res: any = await productsApi.getAll({ sort: sortBy, order: 'desc' });
        setProducts(res.data || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [sortBy]);

  if (loading) return <LoadingState message="Loading product intelligence..." />;

  const totalRevenue = products.reduce((s: number, p: any) => s + p.totalRevenue, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">AI analysis of your menu performance</p>
        </div>
        <div className="flex gap-1">
          {(['revenue', 'orders', 'trend'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 text-xs rounded-lg capitalize font-medium transition-colors ${
                sortBy === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Sort by {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Declining Products</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{products.filter((p: any) => p.trend < 0).length}</p>
          <p className="text-xs text-red-500">Need attention</p>
        </Card>
      </div>

      {/* Products Table */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3">
          <h3 className="font-bold text-gray-900">Menu Performance</h3>
          <p className="text-xs text-gray-400">AI insights for each product</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Orders</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Revenue</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Trend</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">AI Insight</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any, i: number) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {i < 3 && <span className="text-xs font-bold text-amber-500">#{i + 1}</span>}
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral" size="sm">{p.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{p.totalOrders.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(p.totalRevenue)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">₹{p.price}</td>
                  <td className="px-4 py-3 text-center">
                    <TrendArrow value={p.trend} />
                  </td>
                  <td className="px-4 py-3">
                    <p className={`text-xs ${p.trend < 0 ? 'text-red-600' : p.trend > 10 ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {p.trend < 0 ? '⚠ ' : p.trend > 10 ? '🔥 ' : '💡 '}{p.aiInsight}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="font-bold text-blue-900 mb-2">💡 Bundle Opportunity</p>
          <p className="text-sm text-blue-700">Paneer Tikka and Butter Chicken have only 28–42% beverage attachment rate. A meal + drink bundle at 10% discount could add ₹12K–₹15K/month.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-bold text-red-900 mb-2">⚠ Declining Product Alert</p>
          <p className="text-sm text-red-700">Veg Sandwich is down 21% over 8 weeks. Consider running a snack combo (Sandwich + Chai = ₹140) to reverse the trend.</p>
        </div>
      </div>
    </div>
  );
};

export default Products;
