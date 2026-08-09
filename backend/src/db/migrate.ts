import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

const columnExists = async (tableName: string, columnName: string) => {
  if (!pool) return false;

  const [rows]: any = await pool.query(
    `
    SELECT COUNT(*) AS count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );

  return Number(rows[0]?.count || 0) > 0;
};

const addColumnIfMissing = async (
  tableName: string,
  columnName: string,
  definition: string
) => {
  if (!pool) return;

  if (!(await columnExists(tableName, columnName))) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    console.log(`Added missing DB column ${tableName}.${columnName}`);
  }
};

const runSchemaFile = async () => {
  if (!pool) return;

  const schemaPath = [
    path.join(__dirname, 'schema.sql'),
    path.join(process.cwd(), 'src', 'db', 'schema.sql'),
  ].find((candidate) => fs.existsSync(candidate));

  if (!schemaPath) return;

  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  const statements = schemaSql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
};

export const migrateDatabase = async () => {
  if (!pool) return;

  try {
    await runSchemaFile();

    const hasLegacyPrice = await columnExists('products', 'price');
    const hasUnitPrice = await columnExists('products', 'unit_price');
    await addColumnIfMissing('products', 'unit_price', 'DECIMAL(10,2) NOT NULL DEFAULT 0.00');
    await addColumnIfMissing('products', 'min_stock_level', 'INT NOT NULL DEFAULT 10');
    await addColumnIfMissing('products', 'location', "VARCHAR(50) NOT NULL DEFAULT 'WH-01'");
    await addColumnIfMissing('products', 'image_url', 'VARCHAR(500) DEFAULT NULL');

    if (hasLegacyPrice && !hasUnitPrice) {
      await pool.query('UPDATE products SET unit_price = price WHERE unit_price = 0');
    }

    const hasCompanyName = await columnExists('customers', 'company_name');
    const hasBusinessName = await columnExists('customers', 'business_name');
    await addColumnIfMissing('customers', 'business_name', 'VARCHAR(150) DEFAULT NULL');
    await addColumnIfMissing('customers', 'gstin', 'VARCHAR(20) DEFAULT NULL');
    await addColumnIfMissing('customers', 'type', "VARCHAR(30) NOT NULL DEFAULT 'Wholesale'");
    await addColumnIfMissing('customers', 'address', 'TEXT');
    await addColumnIfMissing('customers', 'status', "VARCHAR(30) NOT NULL DEFAULT 'Active'");
    await addColumnIfMissing('customers', 'follow_up_date', 'DATE DEFAULT NULL');
    await addColumnIfMissing('customers', 'notes', 'TEXT');

    if (hasCompanyName && !hasBusinessName) {
      await pool.query(`UPDATE customers SET business_name = company_name WHERE business_name IS NULL OR business_name = ''`);
    }
    await pool.query(`UPDATE customers SET business_name = name WHERE business_name IS NULL OR business_name = ''`);

    await addColumnIfMissing('challans', 'customer_name', 'VARCHAR(150) DEFAULT NULL');
    await addColumnIfMissing('challans', 'total_quantity', 'INT NOT NULL DEFAULT 0');
    await addColumnIfMissing('challans', 'created_by_name', 'VARCHAR(100) DEFAULT NULL');
    await pool.query(
      `
      UPDATE challans c
      LEFT JOIN customers cu ON cu.id = c.customer_id
      SET c.customer_name = COALESCE(c.customer_name, cu.business_name, cu.name, 'Customer')
      WHERE c.customer_name IS NULL OR c.customer_name = ''
      `
    );

    await addColumnIfMissing('challan_items', 'product_name', 'VARCHAR(150) DEFAULT NULL');
    await addColumnIfMissing('challan_items', 'sku', 'VARCHAR(50) DEFAULT NULL');
    await addColumnIfMissing('challan_items', 'unit_price', 'DECIMAL(10,2) NOT NULL DEFAULT 0.00');
    await addColumnIfMissing('challan_items', 'total_price', 'DECIMAL(12,2) NOT NULL DEFAULT 0.00');
    await pool.query(
      `
      UPDATE challan_items ci
      LEFT JOIN products p ON p.id = ci.product_id
      SET
        ci.product_name = COALESCE(ci.product_name, p.name, 'Product'),
        ci.sku = COALESCE(ci.sku, p.sku, 'SKU'),
        ci.unit_price = IF(ci.unit_price = 0, COALESCE(p.unit_price, ci.unit_price), ci.unit_price),
        ci.total_price = IF(ci.total_price = 0, ci.unit_price * ci.quantity, ci.total_price)
      WHERE ci.product_name IS NULL
         OR ci.sku IS NULL
         OR ci.unit_price = 0
         OR ci.total_price = 0
      `
    );

    await pool.query(
      `
      UPDATE challans c
      SET c.total_quantity = (
        SELECT COALESCE(SUM(ci.quantity), 0)
        FROM challan_items ci
        WHERE ci.challan_id = c.id
      )
      WHERE c.total_quantity = 0
      `
    );

    console.log('Database schema migration check complete.');
  } catch (error: any) {
    console.warn(`Database migration notice: ${error.message}`);
  }
};
