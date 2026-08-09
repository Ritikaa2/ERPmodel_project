import { Request, Response, NextFunction } from 'express';
import {
  inMemoryStore,
  pool,
  isUsingInMemoryFallback,
} from '../config/database';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class CRMController {
  // GET ALL CUSTOMERS
  static async getCustomers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { search, status, type } = req.query;

      // MySQL mode
      if (pool && !isUsingInMemoryFallback) {
        let query = `
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
          query += `
            AND (
              LOWER(name) LIKE ?
              OR mobile LIKE ?
              OR LOWER(business_name) LIKE ?
              OR LOWER(email) LIKE ?
            )
          `;

          const searchValue = `%${search.toLowerCase()}%`;

          params.push(
            searchValue,
            `%${search}%`,
            searchValue,
            searchValue
          );
        }

        if (
          status &&
          typeof status === 'string' &&
          status !== 'All'
        ) {
          query += ` AND LOWER(status) = LOWER(?)`;
          params.push(status);
        }

        if (
          type &&
          typeof type === 'string' &&
          type !== 'All'
        ) {
          query += ` AND LOWER(type) = LOWER(?)`;
          params.push(type);
        }

        query += ` ORDER BY id DESC`;

        const [rows] = await pool.query(query, params);

        return res
          .status(200)
          .json(ApiResponse.success(rows));
      }

      // In-memory fallback
      let customers = [...inMemoryStore.customers];

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

  // CREATE CUSTOMER
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

      const cleanMobile = mobile?.replace(/\s+/g, '');

      if (
        !cleanMobile ||
        !/^[6-9]\d{9}$/.test(cleanMobile)
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

      const customerType = type || 'Wholesale';
      const customerStatus = status || 'Active';

      const customerFollowUp =
        follow_up_date ||
        new Date().toISOString().split('T')[0];

      // =========================
      // MYSQL
      // =========================
      if (pool && !isUsingInMemoryFallback) {
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
            cleanMobile,
            customerEmail,
            business_name.trim(),
            gstin?.trim() || null,
            customerType,
            address || '',
            customerStatus,
            customerFollowUp,
            notes || '',
          ]
        );

        const customerId = result.insertId;

        const [rows]: any = await pool.query(
          `
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
          WHERE id = ?
          `,
          [customerId]
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

      // =========================
      // IN-MEMORY FALLBACK
      // =========================

      const newId =
        inMemoryStore.customers.length > 0
          ? Math.max(
              ...inMemoryStore.customers.map(
                (c) => Number(c.id)
              )
            ) + 1
          : 1;

      const newCustomer = {
        id: newId,
        name: name.trim(),
        mobile: cleanMobile,
        email: customerEmail,
        business_name: business_name.trim(),
        gstin: gstin?.trim() || null,
        type: customerType,
        address: address || '',
        status: customerStatus,
        follow_up_date: customerFollowUp,
        notes: notes || '',
        created_at: new Date(),
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
    } catch (error: any) {
      console.error(
        '❌ CREATE CUSTOMER ERROR:',
        error?.message
      );

      next(error);
    }
  }

  // UPDATE CUSTOMER
  static async updateCustomer(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const customerId = Number(id);

      if (!customerId) {
        throw ApiError.badRequest(
          'Invalid customer ID'
        );
      }

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

      // =========================
      // MYSQL
      // =========================

      if (pool && !isUsingInMemoryFallback) {
        const fields: string[] = [];
        const values: any[] = [];

        if (name !== undefined) {
          fields.push('name = ?');
          values.push(name.trim());
        }

        if (mobile !== undefined) {
          fields.push('mobile = ?');
          values.push(
            mobile.replace(/\s+/g, '')
          );
        }

        if (email !== undefined) {
          fields.push('email = ?');
          values.push(email);
        }

        if (business_name !== undefined) {
          fields.push('business_name = ?');
          values.push(business_name);
        }

        if (gstin !== undefined) {
          fields.push('gstin = ?');
          values.push(gstin || null);
        }

        if (type !== undefined) {
          fields.push('type = ?');
          values.push(type);
        }

        if (address !== undefined) {
          fields.push('address = ?');
          values.push(address);
        }

        if (status !== undefined) {
          fields.push('status = ?');
          values.push(status);
        }

        if (follow_up_date !== undefined) {
          fields.push('follow_up_date = ?');
          values.push(follow_up_date);
        }

        if (notes !== undefined) {
          fields.push('notes = ?');
          values.push(notes);
        }

        if (fields.length === 0) {
          throw ApiError.badRequest(
            'No fields provided for update'
          );
        }

        values.push(customerId);

        const [result]: any = await pool.query(
          `
          UPDATE customers
          SET ${fields.join(', ')}
          WHERE id = ?
          `,
          values
        );

        if (result.affectedRows === 0) {
          throw ApiError.notFound(
            'Customer not found'
          );
        }

        const [rows]: any = await pool.query(
          `
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
          WHERE id = ?
          `,
          [customerId]
        );

        return res
          .status(200)
          .json(
            ApiResponse.success(
              rows[0],
              'Customer updated successfully'
            )
          );
      }

      // =========================
      // IN-MEMORY FALLBACK
      // =========================

      const index =
        inMemoryStore.customers.findIndex(
          (c) => Number(c.id) === customerId
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
            'Customer updated successfully'
          )
        );
    } catch (error: any) {
      console.error(
        '❌ UPDATE CUSTOMER ERROR:',
        error?.message
      );

      next(error);
    }
  }

  // ADD FOLLOW-UP NOTE
  static async addFollowUpNote(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { note } = req.body;

      const customerId = Number(id);

      if (!note || note.trim().length === 0) {
        throw ApiError.badRequest(
          'Follow-up note content is required'
        );
      }

      // =========================
      // MYSQL
      // =========================

      if (pool && !isUsingInMemoryFallback) {
        const [rows]: any = await pool.query(
          `
          SELECT *
          FROM customers
          WHERE id = ?
          `,
          [customerId]
        );

        if (rows.length === 0) {
          throw ApiError.notFound(
            'Customer not found'
          );
        }

        const customer = rows[0];

        const timestamp =
          new Date().toISOString();

        const newNote = `[${timestamp.slice(
          0,
          10
        )} - ${req.user?.email || 'User'}]: ${note}`;

        const updatedNotes = customer.notes
          ? `${customer.notes}\n${newNote}`
          : newNote;

        await pool.query(
          `
          UPDATE customers
          SET notes = ?
          WHERE id = ?
          `,
          [updatedNotes, customerId]
        );

        const [updatedRows]: any =
          await pool.query(
            `
            SELECT *
            FROM customers
            WHERE id = ?
            `,
            [customerId]
          );

        return res
          .status(200)
          .json(
            ApiResponse.success(
              updatedRows[0],
              'Follow-up note appended successfully'
            )
          );
      }

      // =========================
      // IN-MEMORY FALLBACK
      // =========================

      const customer =
        inMemoryStore.customers.find(
          (c) => Number(c.id) === customerId
        );

      if (!customer) {
        throw ApiError.notFound(
          'Customer not found'
        );
      }

      const timestamp =
        new Date().toISOString();

      const formattedNote = `[${timestamp.slice(
        0,
        10
      )} - ${req.user?.email || 'User'}]: ${note}`;

      customer.notes = customer.notes
        ? `${customer.notes}\n${formattedNote}`
        : formattedNote;

      return res
        .status(200)
        .json(
          ApiResponse.success(
            customer,
            'Follow-up note appended successfully'
          )
        );
    } catch (error: any) {
      console.error(
        '❌ FOLLOW-UP NOTE ERROR:',
        error?.message
      );

      next(error);
    }
  }
}
