import React, { useState, useEffect } from 'react';
import { reportsService, AnalyticsData } from '../../services/reports.service';
import { BarChart3, Calendar, Filter, TrendingUp, Users, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ReportsAnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await reportsService.getAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Filter Bar matching Blueprint #9 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Sales Report & Financial Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Revenue contribution, order volume trends & top client rankings</p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs text-xs">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-700 dark:text-slate-200">01/05/2026 - 31/05/2026</span>
          <button className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition ml-2">
            Filter
          </button>
        </div>
      </div>

      {/* Total Sales KPI Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs max-w-sm">
        <span className="text-xs font-semibold text-slate-500 uppercase block">Total Sales</span>
        <div className="flex items-center gap-3 my-1">
          <span className="text-3xl font-black text-slate-900 dark:text-white">
            ₹{data?.totalSalesRevenue ? data.totalSalesRevenue.toLocaleString('en-IN') : '2,45,000'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12%
          </span>
        </div>
        <p className="text-[11px] text-slate-400">Calculated from all confirmed delivery challans</p>
      </div>

      {/* Main Grid: Bar Chart & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts Bar Chart matching Blueprint #9 */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Monthly Revenue Bar Chart</h3>
          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.salesData || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales']} />
                  <Bar dataKey="sales" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Customers Ranking matching Blueprint #9 */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" /> Top Customers
          </h3>

          <div className="space-y-3">
            {[
              { name: 'Rahul Traders', spend: '₹85,000' },
              { name: 'ABC Retail', spend: '₹65,000' },
              { name: 'Neha Distributors', spend: '₹49,000' },
              { name: 'Kumar Stores', spend: '₹25,000' },
            ].map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{c.spend}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
