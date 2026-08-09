import React from 'react';
import { Users, Boxes, AlertTriangle, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardViewProps {
  onNavigateToTab: (tab: string) => void;
}

const liveSalesData = [
  { day: '01 May', sales: 12000 },
  { day: '05 May', sales: 18500 },
  { day: '09 May', sales: 25200 },
  { day: '13 May', sales: 21000 },
  { day: '17 May', sales: 36500 },
  { day: '21 May', sales: 31200 },
  { day: '25 May', sales: 42100 },
  { day: '29 May', sales: 45500 },
];

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigateToTab }) => {
  return (
    <div className="space-y-6">
      
      {/* Top 4 KPI Metrics matching Blueprint Image #2 Admin Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Customers</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">120</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Products</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">+5%</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">85</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Low Stock Items</p>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">-2%</span>
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400">7</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Challans Today</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">+8%</span>
          </div>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">18</p>
        </div>
      </div>

      {/* Main Grid: Sales Overview Chart & Recent Challans List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Overview Line Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Sales Overview (This Month)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly revenue trend across wholesale orders</p>
            </div>
            <button
              onClick={() => onNavigateToTab('Reports')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveSalesData}>
                <defs>
                  <linearGradient id="adminSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales']} />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fill="url(#adminSalesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Challans List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Challans</h3>
              <button
                onClick={() => onNavigateToTab('Challans')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {[
                { id: 'CH-2024-0018', customer: 'Rahul Traders', amount: '₹45,000', status: 'DISPATCHED' },
                { id: 'CH-2024-0017', customer: 'ABC Retail', amount: '₹12,500', status: 'DELIVERED' },
                { id: 'CH-2024-0016', customer: 'Neha Distributors', amount: '₹18,200', status: 'PENDING' },
                { id: 'CH-2024-0015', customer: 'Kumar Stores', amount: '₹5,400', status: 'DRAFT' },
              ].map((ch, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">{ch.id}</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{ch.customer}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white block">{ch.amount}</span>
                    <span className="text-[10px] font-bold text-slate-400">{ch.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('Challans')}
            className="mt-4 w-full py-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-xl hover:bg-indigo-100 transition text-center"
          >
            Open Sales Challan Manager →
          </button>
        </div>

      </div>

    </div>
  );
};
