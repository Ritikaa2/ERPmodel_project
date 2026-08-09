import { apiFetch } from './api';
import { Customer } from '../types';

export const crmService = {
  getCustomers: async (search?: string, status?: string, type?: string): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    if (type && type !== 'All') params.append('type', type);

    const queryString = params.toString();
    return apiFetch<Customer[]>(`/customers${queryString ? `?${queryString}` : ''}`);
  },

  createCustomer: async (customerData: Partial<Customer>): Promise<Customer> => {
    return apiFetch<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  updateCustomer: async (id: number, customerData: Partial<Customer>): Promise<Customer> => {
    return apiFetch<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  },

  addFollowUpNote: async (id: number, note: string): Promise<Customer> => {
    return apiFetch<Customer>(`/customers/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },
};
