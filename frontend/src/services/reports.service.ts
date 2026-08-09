import { apiFetch } from './api';

export interface AnalyticsData {
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  totalSalesRevenue: number;
  confirmedChallansCount: number;
  draftChallansCount: number;
  topCustomers: { name: string; spend: number }[];
  salesData: { day: string; sales: number }[];
}

export const reportsService = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    return apiFetch<AnalyticsData>('/reports/analytics');
  },
};
