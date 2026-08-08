export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Customer {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin?: string;
  city: string;
  state: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalOrders?: number;
  createdAt: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stockQuantity: number;
  minStockLevel: number;
  warehouseLocation: string;
}

export type ChallanStatus = 'DRAFT' | 'PENDING_DISPATCH' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface ChallanItem {
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Challan {
  id: number;
  challanNumber: string;
  customerId: number;
  customerName: string;
  totalAmount: number;
  status: ChallanStatus;
  items: ChallanItem[];
  createdByName: string;
  dispatchDate?: string;
  createdAt: string;
}
