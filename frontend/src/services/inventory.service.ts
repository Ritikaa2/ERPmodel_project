import { apiFetch } from './api';
import { Product, StockMovement } from '../types';

export const inventoryService = {
  getProducts: async (search?: string, category?: string, lowStockOnly?: boolean): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    if (lowStockOnly) params.append('lowStockOnly', 'true');

    const queryString = params.toString();
    return apiFetch<Product[]>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    return apiFetch<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateStock: async (id: number, type: 'IN' | 'OUT', quantity: number, reason: string): Promise<Product> => {
    return apiFetch<Product>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ type, quantity, reason }),
    });
  },

  getStockMovements: async (): Promise<StockMovement[]> => {
    return apiFetch<StockMovement[]>('/products/movements');
  },
};
