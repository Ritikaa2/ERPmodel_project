import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const getPool = () => {
  if (!pool) {
    throw new Error('MySQL database connection is not available');
  }

  return pool;
};

const dbStatusToFrontend = (status: string) => {
  switch (status) {
    case 'DISPATCHED':
      return 'Confirmed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'DRAFT':
    default:
      return 'Draft';
  }
};

const frontendStatusToDb = (status: string) => {
  switch (status) {
    case 'Confirmed':
      return 'DISPATCHED';
    case 'Cancelled':
      return 'CANCELLED';
    case 'Draft':
    default:
      return 'DRAFT';
  }
};

export class ChallanController {
  static async getChallans(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const db = getPool();
      const { search, status } = req.query;

      let query = `
        SELECT
          c.id,
          c.challan_number,
          c.customer_id,
          cu.company_name AS customer_name,
          c.total_amount,
          c.status,
          c.created_by,
          u.name AS created_by_name,
          c.created_at,
          COALESCE(SUM(ci.quantity), 0) AS total_quantity
        FROM challans c
        INNER JOIN customers cu ON cu.id = c.customer_id
        LEFT JOIN users u ON u.id = c.created_by
        LEFT JOIN challan_items ci ON ci.challan_id = c.id
      `;

      const conditions: string[] = [];
      const params: any[] = [];

      if (search && typeof search === 'string') {
        conditions.push(`
          (
            LOWER(c.challan_number) LIKE ?
            OR LOWER(cu.company_name) LIKE ?
          )
        `);

        const searchValue = `%${search.toLowerCase()}%`;
        params.push(searchValue, searchValue);
      }

      if (status && typeof status === 'string' && status !== 'All') {
        const dbStatus = frontendStatusToDb(status);
        conditions.push(`c.status = ?`);
        params.push(dbStatus);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += `
        GROUP BY
          c.id,
          c.challan_number,
          c.customer_id,
          cu.company_name,
          c.total_amount,
          c.status,
          c.created_by,
          u.name,
          c.created_at
        ORDER BY c.id DESC
      `;

      const [rows]: any = await db.query(query, params);

      const challans = rows.map((challan: any) => ({
        id: challan.id,
        challan_number: challan.challan_number,
        customer_id: challan.customer_id,
        customer_name: challan.customer_name,
        total_amount: Number(challan.total_amount),
        total_quantity: Number(challan.total_quantity),
        status: dbStatusToFrontend(challan.status),
        created_by: challan.created_by,
        created_by_name: challan.created_by_name || 'Unknown User',
        created_at: challan.created_at,
      }));

      return res.status(200).json(ApiResponse.success(challans));
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const db = getPool();

      const challanId = Number(req.params.id);

      if (!Number.isInteger(challanId)) {
        throw ApiError.badRequest('Invalid challan ID');
      }

      const [challanRows]: any = await db.query(
        `
        SELECT
          c.id,
          c.challan_number,
          c.customer_id,
          cu.company_name AS customer_name,
          c.total_amount,
          c.status,
          c.created_by,
          u.name AS created_by_name,
          c.created_at
        FROM challans c
        INNER JOIN customers cu ON cu.id = c.customer_id
        LEFT JOIN users u ON u.id = c.created_by
        WHERE c.id = ?
        `,
        [challanId]
      );

      if (challanRows.length === 0) {
        throw ApiError.notFound('Sales Challan not found');
      }

      const [itemRows]: any = await db.query(
        `
        SELECT
          ci.id,
          ci.challan_id,
          ci.product_id,
          p.name AS product_name,
          p.sku,
          ci.quantity,
          ci.unit_price,
          ci.total_price
        FROM challan_items ci
        INNER JOIN products p ON p.id = ci.product_id
        WHERE ci.challan_id = ?
        ORDER BY ci.id ASC
        `,
        [challanId]
      );

      const challan = challanRows[0];

      const result = {
        id: challan.id,
        challan_number: challan.challan_number,
        customer_id: challan.customer_id,
        customer_name: challan.customer_name,
        total_amount: Number(challan.total_amount),
        total_quantity: itemRows.reduce(
          (sum: number, item: any) => sum + Number(item.quantity),
          0
        ),
        status: dbStatusToFrontend(challan.status),
        created_by: challan.created_by,
        created_by_name: challan.created_by_name || 'Unknown User',
        created_at: challan.created_at,
        items: itemRows.map((item: any) => ({
          id: item.id,
          challan_id: item.challan_id,
          product_id: item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          unit_price: Number(item.unit_price),
          quantity: Number(item.quantity),
          total_price: Number(item.total_price),
        })),
      };

      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  static async createChallan(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    const db = getPool();

    try {
      const { customer_id, items, status } = req.body;

      if (!customer_id) {
        throw ApiError.badRequest('Customer selection is required');
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw ApiError.badRequest(
          'Challan must contain at least one product item'
        );
      }

      if (!req.user?.userId) {
        throw ApiError.unauthorized('User authentication is required');
      }

      const customerId = Number(customer_id);

      const [customerRows]: any = await db.query(
        `
        SELECT id, company_name, contact_person
        FROM customers
        WHERE id = ?
        `,
        [customerId]
      );

      if (customerRows.length === 0) {
        throw ApiError.notFound('Selected customer not found');
      }

      const customer = customerRows[0];

      const requestedStatus =
        status === 'Confirmed' ? 'Confirmed' : 'Draft';

      const validatedItems: any[] = [];

      let totalAmount = 0;
      let totalQuantity = 0;

      // Validate every product before starting transaction
      for (const rawItem of items) {
        const productId = Number(rawItem.product_id);
        const quantity = Number(rawItem.quantity);

        if (!Number.isInteger(productId)) {
          throw ApiError.badRequest('Invalid product ID');
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw ApiError.badRequest(
            'Product quantity must be greater than 0'
          );
        }

        const [productRows]: any = await db.query(
          `
          SELECT
            id,
            name,
            sku,
            price,
            stock_quantity
          FROM products
          WHERE id = ?
          `,
          [productId]
        );

        if (productRows.length === 0) {
          throw ApiError.notFound(
            `Product ID ${productId} not found`
          );
        }

        const product = productRows[0];

        if (
          requestedStatus === 'Confirmed' &&
          Number(product.stock_quantity) < quantity
        ) {
          throw ApiError.badRequest(
            `Insufficient stock for "${product.name}" (${product.sku}). Available: ${product.stock_quantity}, Required: ${quantity}`
          );
        }

        const unitPrice = Number(product.price);
        const lineTotal = unitPrice * quantity;

        totalAmount += lineTotal;
        totalQuantity += quantity;

        validatedItems.push({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          unit_price: unitPrice,
          quantity,
          total_price: lineTotal,
        });
      }

      await db.query('START TRANSACTION');

      try {
        /*
         * Temporary unique challan number.
         * We update it after MySQL gives us the actual ID.
         */
        const temporaryNumber = `TEMP-${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}`;

        const dbStatus = frontendStatusToDb(requestedStatus);

        const [insertResult]: any = await db.query(
          `
          INSERT INTO challans
          (
            challan_number,
            customer_id,
            total_amount,
            status,
            created_by
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            temporaryNumber,
            customerId,
            totalAmount,
            dbStatus,
            req.user.userId,
          ]
        );

        const challanId = insertResult.insertId;

        const challanNumber = `CH-2026-${String(challanId).padStart(
          4,
          '0'
        )}`;

        await db.query(
          `
          UPDATE challans
          SET challan_number = ?
          WHERE id = ?
          `,
          [challanNumber, challanId]
        );

        for (const item of validatedItems) {
          await db.query(
            `
            INSERT INTO challan_items
            (
              challan_id,
              product_id,
              quantity,
              unit_price,
              total_price
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
              challanId,
              item.product_id,
              item.quantity,
              item.unit_price,
              item.total_price,
            ]
          );

          // Deduct stock only when challan is confirmed
          if (requestedStatus === 'Confirmed') {
            const [updateResult]: any = await db.query(
              `
              UPDATE products
              SET stock_quantity = stock_quantity - ?
              WHERE id = ?
                AND stock_quantity >= ?
              `,
              [
                item.quantity,
                item.product_id,
                item.quantity,
              ]
            );

            if (updateResult.affectedRows !== 1) {
              throw ApiError.badRequest(
                `Insufficient stock for "${item.product_name}"`
              );
            }
          }
        }

        await db.query('COMMIT');

        const responseData = {
          id: challanId,
          challan_number: challanNumber,
          customer_id: customer.id,
          customer_name: customer.company_name,
          total_amount: totalAmount,
          total_quantity: totalQuantity,
          status: requestedStatus,
          created_by: req.user.userId,
          created_by_name: req.user.email || 'Sales User',
          created_at: new Date(),
          items: validatedItems.map((item, index) => ({
            id: index + 1,
            challan_id: challanId,
            product_id: item.product_id,
            product_name: item.product_name,
            sku: item.sku,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total_price: item.total_price,
          })),
        };

        return res.status(201).json(
          ApiResponse.success(
            responseData,
            `Challan ${challanNumber} created successfully as ${requestedStatus}`
          )
        );
      } catch (transactionError) {
        await db.query('ROLLBACK');
        throw transactionError;
      }
    } catch (error) {
      next(error);
    }
  }

  static async updateChallanStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    const db = getPool();

    try {
      const challanId = Number(req.params.id);
      const { status } = req.body;

      if (!Number.isInteger(challanId)) {
        throw ApiError.badRequest('Invalid challan ID');
      }

      if (!['Confirmed', 'Cancelled'].includes(status)) {
        throw ApiError.badRequest(
          'Status must be Confirmed or Cancelled'
        );
      }

      const [challanRows]: any = await db.query(
        `
        SELECT id, challan_number, status
        FROM challans
        WHERE id = ?
        `,
        [challanId]
      );

      if (challanRows.length === 0) {
        throw ApiError.notFound('Challan not found');
      }

      const challan = challanRows[0];

      const [items]: any = await db.query(
        `
        SELECT
          ci.product_id,
          ci.quantity,
          p.name AS product_name,
          p.stock_quantity
        FROM challan_items ci
        INNER JOIN products p ON p.id = ci.product_id
        WHERE ci.challan_id = ?
        `,
        [challanId]
      );

      await db.query('START TRANSACTION');

      try {
        if (
          status === 'Confirmed' &&
          challan.status === 'DRAFT'
        ) {
          // Check stock first
          for (const item of items) {
            if (
              Number(item.stock_quantity) <
              Number(item.quantity)
            ) {
              throw ApiError.badRequest(
                `Insufficient stock for "${item.product_name}". Available: ${item.stock_quantity}, Required: ${item.quantity}`
              );
            }
          }

          // Deduct stock
          for (const item of items) {
            const [result]: any = await db.query(
              `
              UPDATE products
              SET stock_quantity = stock_quantity - ?
              WHERE id = ?
                AND stock_quantity >= ?
              `,
              [
                item.quantity,
                item.product_id,
                item.quantity,
              ]
            );

            if (result.affectedRows !== 1) {
              throw ApiError.badRequest(
                `Unable to update stock for "${item.product_name}"`
              );
            }
          }

          await db.query(
            `
            UPDATE challans
            SET status = 'DISPATCHED'
            WHERE id = ?
            `,
            [challanId]
          );
        } else if (
          status === 'Cancelled' &&
          challan.status !== 'CANCELLED'
        ) {
          // If previously confirmed/dispatched,
          // return stock back
          if (challan.status === 'DISPATCHED') {
            for (const item of items) {
              await db.query(
                `
                UPDATE products
                SET stock_quantity = stock_quantity + ?
                WHERE id = ?
                `,
                [
                  item.quantity,
                  item.product_id,
                ]
              );
            }
          }

          await db.query(
            `
            UPDATE challans
            SET status = 'CANCELLED'
            WHERE id = ?
            `,
            [challanId]
          );
        } else if (
          challan.status === 'DISPATCHED' &&
          status === 'Confirmed'
        ) {
          throw ApiError.badRequest(
            'Challan is already confirmed'
          );
        }

        await db.query('COMMIT');

        const [updatedRows]: any = await db.query(
          `
          SELECT
            id,
            challan_number,
            customer_id,
            total_amount,
            status,
            created_by,
            created_at
          FROM challans
          WHERE id = ?
          `,
          [challanId]
        );

        const updated = updatedRows[0];

        return res.status(200).json(
          ApiResponse.success(
            {
              ...updated,
              total_amount: Number(updated.total_amount),
              status: dbStatusToFrontend(updated.status),
            },
            `Challan status updated to ${status}`
          )
        );
      } catch (transactionError) {
        await db.query('ROLLBACK');
        throw transactionError;
      }
    } catch (error) {
      next(error);
    }
  }
}
