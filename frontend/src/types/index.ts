export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status?: 'ACTIVE' | 'INACTIVE';
}

export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  business_name: string;
  gstin?: string | null;
  type: CustomerType;
  address: string;
  status: CustomerStatus;
  follow_up_date?: string;
  notes?: string;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit_price: number;
  stock_quantity: number;
  min_stock_level: number;
  location: string;
  created_at?: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  created_by_name: string;
  created_at: string;
}

export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface ChallanItem {
  id?: number;
  challan_id?: number;
  product_id: number;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name: string;
  total_amount: number;
  total_quantity: number;
  status: ChallanStatus;
  created_by?: number;
  created_by_name: string;
  created_at: string;
  items?: ChallanItem[];
}
