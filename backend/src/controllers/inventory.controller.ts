import { Request, Response, NextFunction } from 'express';
import { inMemoryStore } from '../config/database';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class InventoryController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, lowStockOnly } = req.query;
      let products = inMemoryStore.products;

      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
      }

      if (category && typeof category === 'string' && category !== 'All') {
        products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }

      if (lowStockOnly === 'true') {
        products = products.filter((p) => p.stock_quantity <= p.min_stock_level);
      }

      return res.status(200).json(ApiResponse.success(products));
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, sku, category, unit_price, stock_quantity, min_stock_level, location } = req.body;

      if (!name || name.trim().length < 2) {
        throw ApiError.badRequest('Product Name is required');
      }

      if (!sku) {
        throw ApiError.badRequest('SKU Code is required');
      }

      const existingSKU = inMemoryStore.products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
      if (existingSKU) {
        throw new ApiError(409, 'Product with this SKU already exists');
      }

      const newId = inMemoryStore.products.length + 1;
      const newProduct = {
        id: newId,
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category: category || 'General',
        unit_price: Number(unit_price) || 0.0,
        stock_quantity: Number(stock_quantity) || 0,
        min_stock_level: Number(min_stock_level) || 10,
        location: location || 'WH-01',
        created_at: new Date().toISOString(),
      };

      inMemoryStore.products.unshift(newProduct);

      // Record initial stock movement if quantity > 0
      if (newProduct.stock_quantity > 0) {
        const stockLogs = (inMemoryStore as any).stock_movements || [];
        stockLogs.unshift({
          id: stockLogs.length + 1,
          product_id: newProduct.id,
          product_name: newProduct.name,
          sku: newProduct.sku,
          type: 'IN',
          quantity: newProduct.stock_quantity,
          reason: 'Initial Product Restock',
          created_by_name: req.user?.email || 'Admin',
          created_at: new Date().toISOString(),
        });
        (inMemoryStore as any).stock_movements = stockLogs;
      }

      return res.status(201).json(ApiResponse.success(newProduct, 'Product created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { type, quantity, reason } = req.body; // type = 'IN' | 'OUT'
      const productId = Number(id);

      const product = inMemoryStore.products.find((p) => p.id === productId);
      if (!product) {
        throw ApiError.notFound('Product not found');
      }

      const qty = Number(quantity);
      if (isNaN(qty) || qty <= 0) {
        throw ApiError.badRequest('Quantity must be greater than 0');
      }

      if (type === 'OUT' && product.stock_quantity < qty) {
        throw ApiError.badRequest(`Insufficient stock available. Current stock: ${product.stock_quantity}, requested reduction: ${qty}`);
      }

      if (type === 'IN') {
        product.stock_quantity += qty;
      } else {
        product.stock_quantity -= qty;
      }

      const stockLogs = (inMemoryStore as any).stock_movements || [];
      stockLogs.unshift({
        id: stockLogs.length + 1,
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        type: type,
        quantity: qty,
        reason: reason || 'Manual Stock Adjustment',
        created_by_name: req.user?.email || 'System User',
        created_at: new Date().toISOString(),
      });
      (inMemoryStore as any).stock_movements = stockLogs;

      return res.status(200).json(ApiResponse.success(product, 'Stock updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getStockMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const stockLogs = (inMemoryStore as any).stock_movements || [];
      return res.status(200).json(ApiResponse.success(stockLogs));
    } catch (error) {
      next(error);
    }
  }
}
