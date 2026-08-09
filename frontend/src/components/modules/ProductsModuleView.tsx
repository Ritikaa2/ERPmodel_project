import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { inventoryService } from '../../services/inventory.service';
import { Search, Filter, Plus, AlertTriangle, ArrowRightLeft, X, Loader2, AlertCircle } from 'lucide-react';

export const ProductsModuleView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Add Product modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Accessories',
    unit_price: '',
    stock_quantity: '',
    min_stock_level: '10',
    location: 'WH-01',
  });

  // Stock Adjustment modal state
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'IN' as 'IN' | 'OUT',
    quantity: '10',
    reason: 'Purchase Restock',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getProducts(search, categoryFilter, lowStockFilter);
      setProducts(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockFilter]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newProduct.name.trim()) {
      setFormError('Product Name is required');
      return;
    }
    if (!newProduct.sku.trim()) {
      setFormError('SKU Code is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await inventoryService.createProduct({
        name: newProduct.name.trim(),
        sku: newProduct.sku.trim().toUpperCase(),
        category: newProduct.category,
        unit_price: Number(newProduct.unit_price) || 0,
        stock_quantity: Number(newProduct.stock_quantity) || 0,
        min_stock_level: Number(newProduct.min_stock_level) || 10,
        location: newProduct.location,
      });

      setIsAddModalOpen(false);
      setNewProduct({
        name: '',
        sku: '',
        category: 'Accessories',
        unit_price: '',
        stock_quantity: '',
        min_stock_level: '10',
        location: 'WH-01',
      });
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForStock) return;

    const qty = Number(stockAdjustment.quantity);
    if (isNaN(qty) || qty <= 0) return;

    try {
      await inventoryService.updateStock(
        selectedProductForStock.id,
        stockAdjustment.type,
        qty,
        stockAdjustment.reason
      );

      setSelectedProductForStock(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Products Catalog & Stock Control</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage item pricing, warehouse bay locations, and reorder levels</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
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
            placeholder="Search products by name, SKU, category..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Bags">Bags</option>
            <option value="Accessories">Accessories</option>
            <option value="Switchgear">Switchgear</option>
            <option value="Electrical">Electrical</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <input
            type="checkbox"
            checked={lowStockFilter}
            onChange={(e) => setLowStockFilter(e.target.checked)}
            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
          />
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Only
          </span>
        </label>
      </div>

      {/* Products Table matching Blueprint #5 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price (₹)</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Min. Stock</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    <span>Loading products inventory...</span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No products found matching filter criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.stock_quantity <= p.min_stock_level;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="p-3.5 font-mono text-slate-500">{p.sku}</td>
                      <td className="p-3.5">{p.category}</td>
                      <td className="p-3.5 font-bold">₹{p.unit_price.toLocaleString('en-IN')}</td>
                      <td className="p-3.5">
                        <span className={`font-black flex items-center gap-1.5 ${isLowStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {p.stock_quantity}
                          {isLowStock && (
                            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                              Low
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">{p.min_stock_level}</td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{p.location}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedProductForStock(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-indigo-600" />
                          <span>Update Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing 1 to {products.length} of {products.length} entries</span>
          <span className="font-semibold text-indigo-600">Page 1 of 1</span>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Product to Inventory</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name*</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Laptop Bag"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU Code*</label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="BAG001"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category*</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="Bags">Bags</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Switchgear">Switchgear</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Price (₹)*</label>
                <input
                  type="number"
                  value={newProduct.unit_price}
                  onChange={(e) => setNewProduct({ ...newProduct, unit_price: e.target.value })}
                  placeholder="1200"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Stock*</label>
                <input
                  type="number"
                  value={newProduct.stock_quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                  placeholder="15"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Min. Stock Level*</label>
                <input
                  type="number"
                  value={newProduct.min_stock_level}
                  onChange={(e) => setNewProduct({ ...newProduct, min_stock_level: e.target.value })}
                  placeholder="10"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Warehouse Location</label>
                <input
                  type="text"
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                  placeholder="WH-01"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="col-span-2 pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  {isSubmitting ? 'Adding...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {selectedProductForStock && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Adjust Stock: {selectedProductForStock.name} ({selectedProductForStock.sku})
              </h3>
              <button onClick={() => setSelectedProductForStock(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Movement Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'IN' })}
                    className={`py-2 rounded-xl font-bold border transition ${
                      stockAdjustment.type === 'IN'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200'
                    }`}
                  >
                    + Stock IN (Restock)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'OUT' })}
                    className={`py-2 rounded-xl font-bold border transition ${
                      stockAdjustment.type === 'OUT'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200'
                    }`}
                  >
                    - Stock OUT (Issue)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: e.target.value })}
                  placeholder="10"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason / Reference</label>
                <input
                  type="text"
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })}
                  placeholder="Purchase Order #PO-991"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductForStock(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirm Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
