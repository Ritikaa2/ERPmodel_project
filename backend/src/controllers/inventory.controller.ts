import { Request, Response, NextFunction } from 'express';
import { inMemoryStore, pool } from '../config/database';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { uploadToS3OrLocal } from '../utils/s3';

const productColumnExists = async (columnName: string) => {
  if (!pool) return false;

  const [rows]: any = await pool.query(
    `
    SELECT COUNT(*) AS count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = ?
    `,
    [columnName]
  );

  return Number(rows[0]?.count || 0) > 0;
};

export class InventoryController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, lowStockOnly } = req.query;

      if (pool) {
        let sql = `
          SELECT
            id,
            name,
            sku,
            category,
            unit_price,
            stock_quantity,
            min_stock_level,
            location,
            created_at
          FROM products
          WHERE 1=1
        `;
        const params: any[] = [];

        if (search && typeof search === 'string') {
          sql += ` AND (LOWER(name) LIKE ? OR LOWER(sku) LIKE ? OR LOWER(category) LIKE ?)`;
          const searchValue = `%${search.toLowerCase()}%`;
          params.push(searchValue, searchValue, searchValue);
        }

        if (category && typeof category === 'string' && category !== 'All') {
          sql += ` AND LOWER(category) = LOWER(?)`;
          params.push(category);
        }

        if (lowStockOnly === 'true') {
          sql += ` AND stock_quantity <= min_stock_level`;
        }

        sql += ` ORDER BY id DESC`;
        const [rows]: any = await pool.query(sql, params);
        const products = rows.map((p: any) => ({
          ...p,
          unit_price: Number(p.unit_price),
          stock_quantity: Number(p.stock_quantity),
          min_stock_level: Number(p.min_stock_level),
          image_url: p.image_url || null,
        }));

        return res.status(200).json(ApiResponse.success(products));
      }

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

  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw ApiError.badRequest('Please select an image file to upload');
      }

      const imageUrl = await uploadToS3OrLocal(req.file);

      return res.status(200).json(
        ApiResponse.success(
          { imageUrl },
          'Product image uploaded successfully to AWS S3 / Local Storage'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, sku, category, unit_price, stock_quantity, min_stock_level, location, image_url } = req.body;

      if (!name || name.trim().length < 2) {
        throw ApiError.badRequest('Product Name is required');
      }

      if (!sku) {
        throw ApiError.badRequest('SKU Code is required');
      }

      const cleanSku = sku.trim().toUpperCase();
      const newProductData = {
        name: name.trim(),
        sku: cleanSku,
        category: category || 'General',
        unit_price: Number(unit_price) || 0.0,
        stock_quantity: Number(stock_quantity) || 0,
        min_stock_level: Number(min_stock_level) || 10,
        location: location || 'WH-01',
        image_url: image_url || null,
      };

      if (pool) {
        const [existingRows]: any = await pool.query('SELECT id FROM products WHERE LOWER(sku) = LOWER(?)', [cleanSku]);
        if (existingRows.length > 0) {
          throw new ApiError(409, 'Product with this SKU already exists');
        }

        const hasImageUrlColumn = await productColumnExists('image_url');
        const productColumns = [
          'name',
          'sku',
          'category',
          'unit_price',
          'stock_quantity',
          'min_stock_level',
          'location',
          ...(hasImageUrlColumn ? ['image_url'] : []),
        ];
        const productValues = [
          newProductData.name,
          newProductData.sku,
          newProductData.category,
          newProductData.unit_price,
          newProductData.stock_quantity,
          newProductData.min_stock_level,
          newProductData.location,
          ...(hasImageUrlColumn ? [newProductData.image_url] : []),
        ];

        const [result]: any = await pool.query(
          `
          INSERT INTO products
          (${productColumns.join(', ')})
          VALUES (${productColumns.map(() => '?').join(', ')})
          `,
          productValues
        );

        if (newProductData.stock_quantity > 0) {
          await pool.query(
            `
            INSERT INTO stock_movements
            (product_id, product_name, sku, type, quantity, reason, created_by_name)
            VALUES (?, ?, ?, 'IN', ?, ?, ?)
            `,
            [result.insertId, newProductData.name, newProductData.sku, newProductData.stock_quantity, 'Initial Product Restock', req.user?.email || 'Admin']
          );
        }

        const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
        const product = rows[0];
        product.unit_price = Number(product.unit_price);
        product.image_url = product.image_url || null;
        return res.status(201).json(ApiResponse.success(product, 'Product created successfully'));
      }

      const existingSKU = inMemoryStore.products.find((p) => p.sku.toLowerCase() === cleanSku.toLowerCase());
      if (existingSKU) {
        throw new ApiError(409, 'Product with this SKU already exists');
      }

      const newProduct = {
        id: inMemoryStore.products.length + 1,
        ...newProductData,
        created_at: new Date().toISOString(),
      };

      inMemoryStore.products.unshift(newProduct);

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
      const { type, quantity, reason } = req.body;
      const productId = Number(id);
      const qty = Number(quantity);

      if (!Number.isInteger(productId)) {
        throw ApiError.badRequest('Invalid product ID');
      }

      if (isNaN(qty) || qty <= 0) {
        throw ApiError.badRequest('Quantity must be greater than 0');
      }

      if (!['IN', 'OUT'].includes(type)) {
        throw ApiError.badRequest('Stock movement type must be IN or OUT');
      }

      if (pool) {
        const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (rows.length === 0) {
          throw ApiError.notFound('Product not found');
        }

        const product = rows[0];
        if (type === 'OUT' && Number(product.stock_quantity) < qty) {
          throw ApiError.badRequest(`Insufficient stock available. Current stock: ${product.stock_quantity}, requested reduction: ${qty}`);
        }

        await pool.query('START TRANSACTION');
        try {
          await pool.query(
            `UPDATE products SET stock_quantity = stock_quantity ${type === 'IN' ? '+' : '-'} ? WHERE id = ?`,
            [qty, productId]
          );
          await pool.query(
            `
            INSERT INTO stock_movements
            (product_id, product_name, sku, type, quantity, reason, created_by_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [product.id, product.name, product.sku, type, qty, reason || 'Manual Stock Adjustment', req.user?.email || 'System User']
          );
          await pool.query('COMMIT');
        } catch (transactionError) {
          await pool.query('ROLLBACK');
          throw transactionError;
        }

        const [updatedRows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
        const updatedProduct = updatedRows[0];
        updatedProduct.unit_price = Number(updatedProduct.unit_price);
        updatedProduct.image_url = updatedProduct.image_url || null;
        return res.status(200).json(ApiResponse.success(updatedProduct, 'Stock updated successfully'));
      }

      const product = inMemoryStore.products.find((p) => p.id === productId);
      if (!product) {
        throw ApiError.notFound('Product not found');
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
      if (pool) {
        const [rows] = await pool.query('SELECT * FROM stock_movements ORDER BY id DESC');
        return res.status(200).json(ApiResponse.success(rows));
      }

      const stockLogs = (inMemoryStore as any).stock_movements || [];
      return res.status(200).json(ApiResponse.success(stockLogs));
    } catch (error) {
      next(error);
    }
  }
}
