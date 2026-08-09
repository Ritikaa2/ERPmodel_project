import { apiFetch } from './api';
import { Challan, ChallanStatus } from '../types';

export interface CreateChallanPayload {
  customer_id: number;
  items: {
    product_id: number;
    quantity: number;
  }[];
  status: ChallanStatus;
}

export const challanService = {
  getChallans: async (search?: string, status?: string): Promise<Challan[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);

    const queryString = params.toString();
    return apiFetch<Challan[]>(`/challans${queryString ? `?${queryString}` : ''}`);
  },

  getChallanById: async (id: number): Promise<Challan> => {
    return apiFetch<Challan>(`/challans/${id}`);
  },

  createChallan: async (payload: CreateChallanPayload): Promise<Challan> => {
    return apiFetch<Challan>('/challans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateChallanStatus: async (id: number, status: ChallanStatus): Promise<Challan> => {
    return apiFetch<Challan>(`/challans/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
