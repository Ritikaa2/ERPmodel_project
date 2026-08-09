import { Request, Response, NextFunction } from 'express';
import { inMemoryStore } from '../config/database';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class ChallanController {
  static async getChallans(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status } = req.query;
      let challans = inMemoryStore.challans;

      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        challans = challans.filter(
          (c) =>
            c.challan_number.toLowerCase().includes(query) ||
            c.customer_name.toLowerCase().includes(query)
        );
      }

      if (status && typeof status === 'string' && status !== 'All') {
        challans = challans.filter((c) => c.status.toLowerCase() === status.toLowerCase());
      }

      return res.status(200).json(ApiResponse.success(challans));
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challanId = Number(id);

      const challan = inMemoryStore.challans.find((c) => c.id === challanId);
      if (!challan) {
        throw ApiError.notFound('Sales Challan not found');
      }

      const items = inMemoryStore.challan_items.filter((item) => item.challan_id === challanId);

      return res.status(200).json(ApiResponse.success({ ...challan, items }));
    } catch (error) {
      next(error);
    }
  }

  static async createChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { customer_id, items, status } = req.body; // status = 'Draft' | 'Confirmed'

      if (!customer_id) {
        throw ApiError.badRequest('Customer selection is required');
      }

      const customer = inMemoryStore.customers.find((c) => c.id === Number(customer_id));
      if (!customer) {
        throw ApiError.notFound('Selected customer not found');
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw ApiError.badRequest('Challan must contain at least one product item');
      }

      const requestedStatus = status === 'Confirmed' ? 'Confirmed' : 'Draft';
      const validatedLineItems: any[] = [];
      let calculatedTotalAmount = 0;
      let calculatedTotalQuantity = 0;

      // Validate stock availability for all items before committing
      for (const rawItem of items) {
        const product = inMemoryStore.products.find((p) => p.id === Number(rawItem.product_id));
        if (!product) {
          throw ApiError.notFound(`Product ID ${rawItem.product_id} not found`);
        }

        const qty = Number(rawItem.quantity);
        if (isNaN(qty) || qty <= 0) {
          throw ApiError.badRequest(`Invalid quantity for product "${product.name}"`);
        }

        if (requestedStatus === 'Confirmed' && product.stock_quantity < qty) {
          throw ApiError.badRequest(
            `Insufficient stock for "${product.name}" (${product.sku}). Available: ${product.stock_quantity}, Required: ${qty}`
          );
        }

        const unitPrice = Number(product.unit_price);
        const lineTotal = unitPrice * qty;

        calculatedTotalAmount += lineTotal;
        calculatedTotalQuantity += qty;

        validatedLineItems.push({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          unit_price: unitPrice,
          quantity: qty,
          total_price: lineTotal,
          productRef: product,
        });
      }

      const newChallanId = inMemoryStore.challans.length + 1;
      const challanNum = `CH-2026-${String(newChallanId).padStart(4, '0')}`;

      const newChallan = {
        id: newChallanId,
        challan_number: challanNum,
        customer_id: customer.id,
        customer_name: customer.business_name || customer.name,
        total_amount: calculatedTotalAmount,
        total_quantity: calculatedTotalQuantity,
        status: requestedStatus,
        created_by: req.user?.userId || 2,
        created_by_name: req.user?.email || 'Sales User',
        created_at: new Date().toISOString(),
      };

      // Add line items
      const createdItems = validatedLineItems.map((vItem, idx) => {
        const itemRecord = {
          id: inMemoryStore.challan_items.length + idx + 1,
          challan_id: newChallanId,
          product_id: vItem.product_id,
          product_name: vItem.product_name,
          sku: vItem.sku,
          unit_price: vItem.unit_price,
          quantity: vItem.quantity,
          total_price: vItem.total_price,
        };
        inMemoryStore.challan_items.push(itemRecord);

        // Deduct stock if Confirmed
        if (requestedStatus === 'Confirmed') {
          vItem.productRef.stock_quantity -= vItem.quantity;
          
          const stockLogs = (inMemoryStore as any).stock_movements || [];
          stockLogs.unshift({
            id: stockLogs.length + 1,
            product_id: vItem.product_id,
            product_name: vItem.product_name,
            sku: vItem.sku,
            type: 'OUT',
            quantity: vItem.quantity,
            reason: `Sales Challan ${challanNum}`,
            created_by_name: req.user?.email || 'Sales User',
            created_at: new Date().toISOString(),
          });
          (inMemoryStore as any).stock_movements = stockLogs;
        }

        return itemRecord;
      });

      inMemoryStore.challans.unshift(newChallan);

      return res.status(201).json(
        ApiResponse.success(
          { ...newChallan, items: createdItems },
          `Challan ${challanNum} created successfully as ${requestedStatus}`
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateChallanStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'Confirmed' | 'Cancelled'
      const challanId = Number(id);

      const challan = inMemoryStore.challans.find((c) => c.id === challanId);
      if (!challan) {
        throw ApiError.notFound('Challan not found');
      }

      if (challan.status === 'Confirmed' && status === 'Confirmed') {
        throw ApiError.badRequest('Challan is already confirmed');
      }

      const items = inMemoryStore.challan_items.filter((i) => i.challan_id === challanId);

      if (status === 'Confirmed' && challan.status === 'Draft') {
        // Validate stock before confirming
        for (const item of items) {
          const product = inMemoryStore.products.find((p) => p.id === item.product_id);
          if (!product || product.stock_quantity < item.quantity) {
            throw ApiError.badRequest(
              `Insufficient stock for "${item.product_name}". Available: ${product?.stock_quantity || 0}, Required: ${item.quantity}`
            );
          }
        }

        // Deduct stock
        for (const item of items) {
          const product = inMemoryStore.products.find((p) => p.id === item.product_id)!;
          product.stock_quantity -= item.quantity;

          const stockLogs = (inMemoryStore as any).stock_movements || [];
          stockLogs.unshift({
            id: stockLogs.length + 1,
            product_id: item.product_id,
            product_name: item.product_name,
            sku: item.sku,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Sales Challan ${challan.challan_number} Confirmation`,
            created_by_name: req.user?.email || 'Sales User',
            created_at: new Date().toISOString(),
          });
          (inMemoryStore as any).stock_movements = stockLogs;
        }

        challan.status = 'Confirmed';
      } else if (status === 'Cancelled') {
        // If it was Confirmed, restore stock
        if (challan.status === 'Confirmed') {
          for (const item of items) {
            const product = inMemoryStore.products.find((p) => p.id === item.product_id);
            if (product) {
              product.stock_quantity += item.quantity;
            }
          }
        }
        challan.status = 'Cancelled';
      }

      return res.status(200).json(ApiResponse.success(challan, `Challan status updated to ${status}`));
    } catch (error) {
      next(error);
    }
  }
}
