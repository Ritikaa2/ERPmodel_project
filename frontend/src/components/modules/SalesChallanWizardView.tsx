import React, { useState, useEffect } from 'react';
import { Customer, Product, ChallanStatus } from '../../types';
import { crmService } from '../../services/crm.service';
import { inventoryService } from '../../services/inventory.service';
import { challanService } from '../../services/challan.service';
import { Search, Plus, Trash2, CheckCircle2, ArrowRight, ArrowLeft, Loader2, AlertCircle, ShoppingCart } from 'lucide-react';

interface SalesChallanWizardViewProps {
  onComplete: () => void;
}

export const SalesChallanWizardView: React.FC<SalesChallanWizardViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Data sources
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Step 1: Customer Selection
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Step 2: Line Items
  const [lineItems, setLineItems] = useState<
    { product_id: number; quantity: number; unit_price: number; name: string; sku: string; availableStock: number }[]
  >([]);

  // Step 4: Created Challan Result
  const [createdChallanNum, setCreatedChallanNum] = useState<string>('');
  const [createdStatus, setCreatedStatus] = useState<ChallanStatus>('Draft');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadMasterData = async () => {
      setLoadingData(true);
      try {
        const [cList, pList] = await Promise.all([
          crmService.getCustomers(),
          inventoryService.getProducts(),
        ]);
        setCustomers(cList);
        setProducts(pList);

        if (cList.length > 0) setSelectedCustomerId(cList[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    loadMasterData();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Add dynamic product line item
  const addLineItem = () => {
    if (products.length === 0) return;
    const firstProduct = products[0];
    setLineItems([
      ...lineItems,
      {
        product_id: firstProduct.id,
        quantity: 1,
        unit_price: firstProduct.unit_price,
        name: firstProduct.name,
        sku: firstProduct.sku,
        availableStock: firstProduct.stock_quantity,
      },
    ]);
  };

  const updateLineItem = (index: number, field: string, val: any) => {
    const updated = [...lineItems];
    if (field === 'product_id') {
      const pid = Number(val);
      const prod = products.find((p) => p.id === pid);
      if (prod) {
        updated[index].product_id = prod.id;
        updated[index].name = prod.name;
        updated[index].sku = prod.sku;
        updated[index].unit_price = prod.unit_price;
        updated[index].availableStock = prod.stock_quantity;
      }
    } else if (field === 'quantity') {
      const q = Math.max(1, Number(val) || 1);
      updated[index].quantity = q;
    }
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const grandTotal = lineItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCreateChallan = async (status: ChallanStatus) => {
    setErrorMessage('');
    if (!selectedCustomerId) {
      setErrorMessage('Please select a customer');
      return;
    }
    if (lineItems.length === 0) {
      setErrorMessage('Please add at least one product item');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await challanService.createChallan({
        customer_id: selectedCustomerId,
        items: lineItems.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
        status,
      });

      setCreatedChallanNum(res.challan_number);
      setCreatedStatus(res.status);
      setStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create sales challan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Wizard Step Indicator Header matching Blueprint #7 */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
        {[
          { num: 1, title: 'Step 1: Select Customer' },
          { num: 2, title: 'Step 2: Add Products' },
          { num: 3, title: 'Step 3: Review' },
          { num: 4, title: 'Step 4: Success' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition ${
              step === s.num
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/50'
                : step > s.num
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
            }`}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${
              step === s.num ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
            }`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: SELECT CUSTOMER */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Select Customer Account</h3>
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search customer by name or business..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {customers
              .filter((c) => c.business_name.toLowerCase().includes(customerSearch.toLowerCase()) || c.name.toLowerCase().includes(customerSearch.toLowerCase()))
              .map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedCustomerId === c.id
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900/50'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{c.business_name}</p>
                    <p className="text-[11px] text-slate-500">{c.name} • {c.mobile}</p>
                    <span className="inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {c.type}
                    </span>
                  </div>
                  {selectedCustomerId === c.id && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </div>
              ))}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => {
                if (!selectedCustomerId) {
                  setErrorMessage('Please select a customer to proceed');
                  return;
                }
                setErrorMessage('');
                if (lineItems.length === 0) addLineItem();
                setStep(2);
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <span>Next: Add Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ADD PRODUCTS */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Line Items</h3>
            <button
              type="button"
              onClick={addLineItem}
              className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-100 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> + Add Another Product
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl grid grid-cols-12 gap-3 items-center text-xs">
                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Product</label>
                  <select
                    value={item.product_id}
                    onChange={(e) => updateLineItem(idx, 'product_id', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) - Stock: {p.stock_quantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    readOnly
                    value={item.unit_price}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300"
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div className="col-span-3 sm:col-span-2 text-right">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Total</label>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 block pt-2">
                    ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="col-span-1 text-right pt-4">
                  <button
                    onClick={() => removeLineItem(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={() => {
                if (lineItems.length === 0) {
                  setErrorMessage('Please add at least one line item');
                  return;
                }
                setErrorMessage('');
                setStep(3);
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <span>Next: Review Challan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW CHALLAN */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Review Challan Summary</h3>
              <p className="text-xs text-slate-500">Customer: <strong className="text-indigo-600">{selectedCustomer?.business_name}</strong></p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Challan Items</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {lineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{item.name}</td>
                    <td className="p-3 font-mono text-slate-500">{item.sku}</td>
                    <td className="p-3 font-bold">{item.quantity}</td>
                    <td className="p-3">₹{item.unit_price}</td>
                    <td className="p-3 text-right font-bold">₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-indigo-50/70 dark:bg-slate-900/70 rounded-2xl border border-indigo-100 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-500 font-semibold">Total Quantity: <strong className="text-slate-900 dark:text-white">{totalQuantity} Units</strong></p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Grand Total</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{grandTotal.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-3">
              <button
                disabled={isSubmitting}
                onClick={() => handleCreateChallan('Draft')}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition"
              >
                Save Draft
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleCreateChallan('Confirmed')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Challan</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION SCREEN */}
      {step === 4 && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Challan Created Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">Sales Delivery Challan generated in system database.</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 inline-block w-full">
            <p className="text-xs text-slate-400 uppercase font-bold">Challan Number</p>
            <p className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400 my-1">{createdChallanNum}</p>
            <span className={`px-3 py-1 rounded text-xs font-bold ${
              createdStatus === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              Status: {createdStatus}
            </span>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Go to Challan List →
          </button>
        </div>
      )}

    </div>
  );
};
