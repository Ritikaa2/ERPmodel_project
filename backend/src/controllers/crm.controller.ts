import { Request, Response, NextFunction } from 'express';
import { inMemoryStore, pool, isUsingInMemoryFallback } from '../config/database';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class CRMController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, type } = req.query;
      let customers = inMemoryStore.customers;

      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        customers = customers.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.mobile.includes(query) ||
            c.business_name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query)
        );
      }

      if (status && typeof status === 'string' && status !== 'All') {
        customers = customers.filter((c) => c.status.toLowerCase() === status.toLowerCase());
      }

      if (type && typeof type === 'string' && type !== 'All') {
        customers = customers.filter((c) => c.type.toLowerCase() === type.toLowerCase());
      }

      return res.status(200).json(ApiResponse.success(customers));
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, mobile, email, business_name, gstin, type, address, status, follow_up_date, notes } = req.body;

      if (!name || name.trim().length < 2) {
        throw ApiError.badRequest('Customer Name is required');
      }

      if (!mobile || !/^[6-9]\d{9}$/.test(mobile.replace(/\s+/g, ''))) {
        throw ApiError.badRequest('Valid 10-digit Indian Mobile Number is required');
      }

      if (!business_name) {
        throw ApiError.badRequest('Business Name is required');
      }

      const newId = inMemoryStore.customers.length + 1;
      const newCustomer = {
        id: newId,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email ? email.trim() : `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        business_name: business_name.trim(),
        gstin: gstin ? gstin.trim() : null,
        type: type || 'Wholesale',
        address: address || '',
        status: status || 'Active',
        follow_up_date: follow_up_date || new Date().toISOString().split('T')[0],
        notes: notes || '',
        created_at: new Date().toISOString(),
      };

      inMemoryStore.customers.unshift(newCustomer);

      return res.status(201).json(ApiResponse.success(newCustomer, 'Customer added successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customerId = Number(id);
      const index = inMemoryStore.customers.findIndex((c) => c.id === customerId);

      if (index === -1) {
        throw ApiError.notFound('Customer not found');
      }

      inMemoryStore.customers[index] = {
        ...inMemoryStore.customers[index],
        ...req.body,
        id: customerId,
      };

      return res.status(200).json(ApiResponse.success(inMemoryStore.customers[index], 'Customer updated'));
    } catch (error) {
      next(error);
    }
  }

  static async addFollowUpNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const customerId = Number(id);

      const customer = inMemoryStore.customers.find((c) => c.id === customerId);
      if (!customer) {
        throw ApiError.notFound('Customer not found');
      }

      if (!note || note.trim().length === 0) {
        throw ApiError.badRequest('Follow-up note content is required');
      }

      const timestamp = new Date().toISOString();
      customer.notes = customer.notes ? `${customer.notes}\n[${timestamp.slice(0,10)} - ${req.user?.email}]: ${note}` : `[${timestamp.slice(0,10)} - ${req.user?.email}]: ${note}`;

      return res.status(200).json(ApiResponse.success(customer, 'Follow-up note appended successfully'));
    } catch (error) {
      next(error);
    }
  }
}
