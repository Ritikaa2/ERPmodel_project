import { Request, Response, NextFunction } from 'express';
import { inMemoryStore, pool } from '../config/database';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class CRMController {
  static async getCustomers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { search, status, type } = req.query;

      if (pool) {
        let sql = `
          SELECT
            id,
            name,
            mobile,
            email,
            business_name,
            gstin,
            type,
            address,
            status,
            follow_up_date,
            notes,
            created_at
          FROM customers
          WHERE 1=1
        `;

        const params: any[] = [];

        if (search && typeof search === 'string') {
          sql += `
            AND (
              name LIKE ?
              OR mobile LIKE ?
              OR business_name LIKE ?
              OR email LIKE ?
            )
          `;

          const searchValue = `%${search}%`;

          params.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue
          );
        }

        if (
          status &&
          typeof status === 'string' &&
          status !== 'All'
        ) {
          sql += ` AND LOWER(status) = LOWER(?)`;
          params.push(status);
        }

        if (
          type &&
          typeof type === 'string' &&
          type !== 'All'
        ) {
          sql += ` AND LOWER(type) = LOWER(?)`;
          params.push(type);
        }

        sql += ` ORDER BY id DESC`;

        const [rows] = await pool.query(sql, params);

        return res
          .status(200)
          .json(ApiResponse.success(rows));
      }

      let customers = inMemoryStore.customers;

      if (search && typeof search === 'string') {
        const query = search.toLowerCase();

        customers = customers.filter(
          (c) =>
            c.name?.toLowerCase().includes(query) ||
            c.mobile?.includes(query) ||
            c.business_name?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query)
        );
      }

      if (
        status &&
        typeof status === 'string' &&
        status !== 'All'
      ) {
        customers = customers.filter(
          (c) =>
            c.status?.toLowerCase() ===
            status.toLowerCase()
        );
      }

      if (
        type &&
        typeof type === 'string' &&
        type !== 'All'
      ) {
        customers = customers.filter(
          (c) =>
            c.type?.toLowerCase() ===
            type.toLowerCase()
        );
      }

      return res
        .status(200)
        .json(ApiResponse.success(customers));
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        name,
        mobile,
        email,
        business_name,
        gstin,
        type,
        address,
        status,
        follow_up_date,
        notes,
      } = req.body;

      if (!name || name.trim().length < 2) {
        throw ApiError.badRequest(
          'Customer Name is required'
        );
      }

      if (
        !mobile ||
        !/^[6-9]\d{9}$/.test(
          mobile.replace(/\s+/g, '')
        )
      ) {
        throw ApiError.badRequest(
          'Valid 10-digit Indian Mobile Number is required'
        );
      }

      if (!business_name) {
        throw ApiError.badRequest(
          'Business Name is required'
        );
      }

      const customerEmail =
        email?.trim() ||
        `${name
          .toLowerCase()
          .replace(/\s+/g, '')}@example.com`;

      if (pool) {
        const [result]: any = await pool.query(
          `
          INSERT INTO customers
          (
            name,
            mobile,
            email,
            business_name,
            gstin,
            type,
            address,
            status,
            follow_up_date,
            notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            name.trim(),
            mobile.trim(),
            customerEmail,
            business_name.trim(),
            gstin?.trim() || null,
            type || 'Wholesale',
            address || '',
            status || 'Active',
            follow_up_date || null,
            notes || '',
          ]
        );

        const [rows]: any = await pool.query(
          `SELECT * FROM customers WHERE id = ?`,
          [result.insertId]
        );

        return res
          .status(201)
          .json(
            ApiResponse.success(
              rows[0],
              'Customer added successfully'
            )
          );
      }

      const newId =
        inMemoryStore.customers.length + 1;

      const newCustomer = {
        id: newId,
        name: name.trim(),
        mobile: mobile.trim(),
        email: customerEmail,
        business_name: business_name.trim(),
        gstin: gstin?.trim() || null,
        type: type || 'Wholesale',
        address: address || '',
        status: status || 'Active',
        follow_up_date:
          follow_up_date ||
          new Date().toISOString().split('T')[0],
        notes: notes || '',
        created_at: new Date().toISOString(),
      };

      inMemoryStore.customers.unshift(newCustomer);

      return res
        .status(201)
        .json(
          ApiResponse.success(
            newCustomer,
            'Customer added successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customerId = Number(req.params.id);

      if (pool) {
        const {
          name,
          mobile,
          email,
          business_name,
          gstin,
          type,
          address,
          status,
          follow_up_date,
          notes,
        } = req.body;

        const [result]: any = await pool.query(
          `
          UPDATE customers
          SET
            name = ?,
            mobile = ?,
            email = ?,
            business_name = ?,
            gstin = ?,
            type = ?,
            address = ?,
            status = ?,
            follow_up_date = ?,
            notes = ?
          WHERE id = ?
          `,
          [
            name,
            mobile,
            email,
            business_name,
            gstin || null,
            type || 'Wholesale',
            address || '',
            status || 'Active',
            follow_up_date || null,
            notes || '',
            customerId,
          ]
        );

        if (result.affectedRows === 0) {
          throw ApiError.notFound(
            'Customer not found'
          );
        }

        const [rows]: any = await pool.query(
          `SELECT * FROM customers WHERE id = ?`,
          [customerId]
        );

        return res
          .status(200)
          .json(
            ApiResponse.success(
              rows[0],
              'Customer updated'
            )
          );
      }

      const index =
        inMemoryStore.customers.findIndex(
          (c) => c.id === customerId
        );

      if (index === -1) {
        throw ApiError.notFound(
          'Customer not found'
        );
      }

      inMemoryStore.customers[index] = {
        ...inMemoryStore.customers[index],
        ...req.body,
        id: customerId,
      };

      return res
        .status(200)
        .json(
          ApiResponse.success(
            inMemoryStore.customers[index],
            'Customer updated'
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async addFollowUpNote(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customerId = Number(req.params.id);
      const { note } = req.body;

      if (!note || note.trim().length === 0) {
        throw ApiError.badRequest(
          'Follow-up note content is required'
        );
      }

      if (pool) {
        const [rows]: any = await pool.query(
          `SELECT * FROM customers WHERE id = ?`,
          [customerId]
        );

        if (!rows.length) {
          throw ApiError.notFound(
            'Customer not found'
          );
        }

        const customer = rows[0];

        const timestamp =
          new Date().toISOString();

        const newNotes = customer.notes
          ? `${customer.notes}\n[${timestamp.slice(
              0,
              10
            )} - ${req.user?.email}]: ${note}`
          : `[${timestamp.slice(
              0,
              10
            )} - ${req.user?.email}]: ${note}`;

        await pool.query(
          `UPDATE customers SET notes = ? WHERE id = ?`,
          [newNotes, customerId]
        );

        customer.notes = newNotes;

        return res
          .status(200)
          .json(
            ApiResponse.success(
              customer,
              'Follow-up note appended successfully'
            )
          );
      }

      const customer =
        inMemoryStore.customers.find(
          (c) => c.id === customerId
        );

      if (!customer) {
        throw ApiError.notFound(
          'Customer not found'
        );
      }

      const timestamp =
        new Date().toISOString();

      customer.notes = customer.notes
        ? `${customer.notes}\n[${timestamp.slice(
            0,
            10
          )} - ${req.user?.email}]: ${note}`
        : `[${timestamp.slice(
            0,
            10
          )} - ${req.user?.email}]: ${note}`;

      return res
        .status(200)
        .json(
          ApiResponse.success(
            customer,
            'Follow-up note appended successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
