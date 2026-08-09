import React, { useState, useEffect } from 'react';
import { StockMovement } from '../../types';
import { inventoryService } from '../../services/inventory.service';
import { ArrowRightLeft, Filter, Calendar, Loader2 } from 'lucide-react';

export const StockMovementsView: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState('All');

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getStockMovements();
      setMovements(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filteredMovements = movements.filter((m) => {
    if (typeFilter !== 'All' && m.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" /> Stock Movements Audit Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Complete historical record of inventory entries, dispatches & adjustments</p>
        </div>
      </div>

      {/* Filter Bar matching Blueprint #6 */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Movement Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Types (IN & OUT)</option>
              <option value="IN">IN (Stock Added)</option>
              <option value="OUT">OUT (Stock Dispatched)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-slate-600 dark:text-slate-300">01/05/2026 - 31/05/2026</span>
          </div>
        </div>

        <button
          onClick={fetchMovements}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Apply Filters</span>
        </button>
      </div>

      {/* Stock Movements Log Table matching Blueprint #6 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Quantity</th>
                <th className="p-3.5">Reason / Reference</th>
                <th className="p-3.5">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    <span>Loading stock movements log...</span>
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No stock movements logged.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3.5 text-slate-500 font-medium">
                      {new Date(m.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{m.product_name}</td>
                    <td className="p-3.5 font-mono text-slate-500">{m.sku}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`font-black ${m.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">{m.reason}</td>
                    <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{m.created_by_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing 1 to {filteredMovements.length} of {filteredMovements.length} entries</span>
          <span className="font-semibold text-indigo-600">Page 1 of 1</span>
        </div>
      </div>

    </div>
  );
};
