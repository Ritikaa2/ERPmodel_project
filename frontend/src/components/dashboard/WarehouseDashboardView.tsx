import React from 'react';
import { Boxes, PackageCheck, AlertTriangle, ArrowRightLeft, ArrowRight } from 'lucide-react';

interface WarehouseDashboardViewProps {
  onNavigateToTab: (tab: string) => void;
}

export const WarehouseDashboardView: React.FC<WarehouseDashboardViewProps> = ({ onNavigateToTab }) => {
  return (
    <div className="space-y-6">
      
      {/* Top 4 Warehouse KPI Metrics matching Blueprint Image #2 Warehouse Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Products</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">85</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Stock (Units)</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">3,520</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Low Stock Items</p>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400">7</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Stock Movements</p>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">27</p>
        </div>
      </div>

      {/* Main Grid: Low Stock Alerts & Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Low Stock Alerts Table */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Low Stock Alerts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Items below configured reorder stock thresholds</p>
            </div>
            <button
              onClick={() => onNavigateToTab('Inventory')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Restock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">Product</th>
                  <th className="p-2.5">SKU</th>
                  <th className="p-2.5">Current Stock</th>
                  <th className="p-2.5">Min. Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr className="bg-rose-50/30 dark:bg-rose-950/20">
                  <td className="p-2.5 font-semibold text-slate-900 dark:text-white">Laptop Bag</td>
                  <td className="p-2.5 font-mono text-slate-500">BAG001</td>
                  <td className="p-2.5 font-bold text-rose-600">5</td>
                  <td className="p-2.5">10</td>
                </tr>
                <tr className="bg-rose-50/30 dark:bg-rose-950/20">
                  <td className="p-2.5 font-semibold text-slate-900 dark:text-white">Wireless Mouse</td>
                  <td className="p-2.5 font-mono text-slate-500">MOU002</td>
                  <td className="p-2.5 font-bold text-rose-600">3</td>
                  <td className="p-2.5">10</td>
                </tr>
                <tr className="bg-rose-50/30 dark:bg-rose-950/20">
                  <td className="p-2.5 font-semibold text-slate-900 dark:text-white">Keyboard</td>
                  <td className="p-2.5 font-mono text-slate-500">KEY001</td>
                  <td className="p-2.5 font-bold text-rose-600">8</td>
                  <td className="p-2.5">15</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Stock Movements Log */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-500" /> Recent Stock Movements
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Audit log of stock IN and OUT entries</p>
            </div>
            <button
              onClick={() => onNavigateToTab('Stock Movements')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { sku: 'KEY001', type: 'OUT', qty: -5, reason: 'Sales Challan CH-2024-0018' },
              { sku: 'BAG001', type: 'IN', qty: +20, reason: 'Purchase Restock' },
              { sku: 'MOU002', type: 'OUT', qty: -2, reason: 'Sales Challan CH-2024-0017' },
              { sku: 'USB001', type: 'IN', qty: +50, reason: 'Purchase Restock Batch' },
            ].map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">{log.sku}</span>
                  <span className="text-slate-500">{log.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {log.type}
                  </span>
                  <span className={`font-black ${log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {log.qty > 0 ? `+${log.qty}` : log.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
