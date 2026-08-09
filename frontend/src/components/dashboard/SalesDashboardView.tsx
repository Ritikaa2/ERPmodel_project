import React from 'react';
import { Users, FileText, Clock, WalletCards, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesDashboardViewProps {
  onNavigateToTab: (tab: string) => void;
}

const salesBreakdownData = [
  { name: 'Confirmed', value: 200000, color: '#4f46e5' },
  { name: 'Draft', value: 30000, color: '#3b82f6' },
  { name: 'Cancelled', value: 15000, color: '#f43f5e' },
];

export const SalesDashboardView: React.FC<SalesDashboardViewProps> = ({ onNavigateToTab }) => {
  return (
    <div className="space-y-6">
      
      {/* Top 4 Sales KPI Metrics matching Blueprint Image #2 Sales Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">My Customers</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">+10%</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">45</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Challans Today</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">+5%</span>
          </div>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">12</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Follow-ups</p>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">Urgent</span>
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">5</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sales This Month</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">+15%</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">₹2,45,000</p>
        </div>
      </div>

      {/* Main Grid: Upcoming Follow-ups & Sales Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upcoming CRM Follow-ups Table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Upcoming Follow-ups</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled client calls and deal follow-up reminders</p>
            </div>
            <button
              onClick={() => onNavigateToTab('Customers')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Customers CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Follow-up Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Rahul Traders</td>
                  <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400">20 May 2026</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">PENDING</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">ABC Retail</td>
                  <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400">21 May 2026</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">SCHEDULED</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Neha Distributors</td>
                  <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400">22 May 2026</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">QUOTATION_SENT</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Kumar Stores</td>
                  <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400">24 May 2026</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">PENDING</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales This Month Donut Chart matching Blueprint */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Sales This Month Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Confirmed vs Draft vs Cancelled orders</p>

            <div className="h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']} />
                  <Pie
                    data={salesBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {salesBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">₹2,45,000</span>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Confirmed</span>
                <span className="font-bold text-slate-900 dark:text-white">₹2,00,000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Draft</span>
                <span className="font-bold text-slate-900 dark:text-white">₹30,000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Cancelled</span>
                <span className="font-bold text-slate-900 dark:text-white">₹15,000</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
