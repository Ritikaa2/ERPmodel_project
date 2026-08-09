import React, { useState, useEffect } from 'react';
import { Challan } from '../../types';
import { challanService } from '../../services/challan.service';
import { Search, Filter, Download, Printer, Plus, CheckCircle2, XCircle, FileText, Loader2 } from 'lucide-react';

interface ChallanListDetailViewProps {
  onCreateClick: () => void;
}

export const ChallanListDetailView: React.FC<ChallanListDetailViewProps> = ({ onCreateClick }) => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const list = await challanService.getChallans(search, statusFilter);
      setChallans(list);
      if (list.length > 0 && !selectedChallan) {
        loadChallanDetail(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadChallanDetail = async (id: number) => {
    try {
      const fullDetail = await challanService.getChallanById(id);
      setSelectedChallan(fullDetail);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter]);

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Create CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Sales Delivery Challans
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Create, track dispatches, and export PDF delivery invoices</p>
        </div>

        <button
          onClick={onCreateClick}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Challan</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Challan # or Customer Name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Blueprint #8 Split Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Challan List Table */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Challan #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      <span>Loading challans...</span>
                    </td>
                  </tr>
                ) : challans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No sales challans found.
                    </td>
                  </tr>
                ) : (
                  challans.map((ch) => (
                    <tr
                      key={ch.id}
                      onClick={() => loadChallanDetail(ch.id)}
                      className={`cursor-pointer transition ${
                        selectedChallan?.id === ch.id
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/60 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{ch.challan_number}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{ch.customer_name}</td>
                      <td className="p-3 text-slate-500 font-medium">{new Date(ch.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                      <td className="p-3 font-bold">₹{Number(ch.total_amount).toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ch.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          ch.status === 'Draft' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {ch.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
            Showing 1 to {challans.length} of {challans.length} entries
          </div>
        </div>

        {/* Right: Challan Detail View matching Blueprint #8 */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between min-h-[420px]">
          {selectedChallan ? (
            <div className="space-y-6 print:p-8" id="printable-challan-invoice">
              
              {/* Top Detail Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Challan Detail</span>
                  <h3 className="text-xl font-mono font-black text-slate-900 dark:text-white">{selectedChallan.challan_number}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer: <strong className="text-slate-900 dark:text-white">{selectedChallan.customer_name}</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    Date: {new Date(selectedChallan.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  <span className={`px-3 py-1 rounded text-xs font-bold block text-center ${
                    selectedChallan.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                    selectedChallan.status === 'Draft' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedChallan.status}
                  </span>

                  <button
                    onClick={handlePrintPDF}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedChallan.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{item.product_name}</td>
                        <td className="p-3 font-mono text-slate-500">{item.sku}</td>
                        <td className="p-3 font-bold">{item.quantity}</td>
                        <td className="p-3">₹{item.unit_price}</td>
                        <td className="p-3 text-right font-bold">₹{Number(item.total_price).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Grand Total */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Total Line Items: {selectedChallan.items?.length || 0}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Grand Total</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    ₹{Number(selectedChallan.total_amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center my-auto">
              <FileText className="w-12 h-12 text-slate-300 mb-2" />
              <p className="font-bold text-sm">Select a challan from the list to view detail.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
