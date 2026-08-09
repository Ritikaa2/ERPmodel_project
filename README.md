# Mini ERP Portal

A production-style **Mini ERP & Operations Management Portal** designed for wholesale and distribution businesses.

The application provides a centralized platform to manage customers, products, inventory movements, sales delivery challans, business reports, and user activity. It also includes authentication and role-based access control to ensure that users can access functionality according to their assigned role.

---

## 📌 Project Overview

The Mini ERP Portal is designed to simplify day-to-day wholesale business operations by bringing multiple workflows into a single system.

The system provides modules for:

- User Authentication
- Role-Based Access Control
- Customer & CRM Management
- Product Management
- Inventory & Stock Movement Tracking
- Sales Delivery Challans
- Sales Reports & Financial Analytics
- Activity & Audit Logs
- MySQL Database Management

The goal is to provide a simple, centralized and user-friendly ERP interface for managing business operations efficiently.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

- User registration and login
- Form validation
- Secure password handling
- Forgot password functionality
- OTP-based password recovery
- Role-based access control
- Protected application routes
- User session management

Supported roles include:

- `ADMIN`
- `SALES`
- `WAREHOUSE`
- `ACCOUNTS`

Each role can access functionality according to its responsibilities.

---

### 📊 Dashboard

The dashboard provides a quick overview of important business information.

It displays:

- Total customers
- Today's challans
- Pending follow-ups
- Monthly sales
- Upcoming customer follow-ups
- Sales breakdown
- Important business metrics

The dashboard is personalized according to the logged-in user's role.

---

### 👥 Customers & CRM

The Customers module is used to manage customer accounts and follow-up information.

Features include:

- Add new customers
- View customer records
- Search customers
- Filter customers by type
- Filter customers by status
- Manage follow-up dates
- Update customer information
- Track customer status

Example customer statuses include:

- Lead
- Active
- Inactive

Customer types can include:

- Wholesale
- Retail
- Distributor

---

### 📦 Products & Stock Control

The Products module manages the product catalog and inventory information.

Each product can contain:

- Product name
- SKU
- Category
- Price
- Available stock
- Minimum stock level
- Warehouse location

Additional functionality includes:

- Add products
- Search products
- Filter by category
- Identify low-stock products
- Update product stock

---

### 🔄 Stock Movements

The Stock Movements module maintains a historical record of inventory changes.

It tracks:

- Stock IN
- Stock OUT
- Product
- SKU
- Quantity
- Reason/reference
- User responsible for the movement
- Date

For example, when stock is increased by `+20` units, the movement is recorded in the inventory audit history.

This provides better inventory visibility and accountability.

---

### 🧾 Sales Delivery Challans

The Challans module is designed to manage sales delivery documents.

Users can:

- Create new challans
- Select customers
- Add products
- Define quantities
- Calculate totals
- Track challan status
- Search challans
- View challan details
- Download/export challans as PDF

Challan statuses include:

- Draft
- Confirmed
- Cancelled

Each challan contains product details, quantities, prices and the final grand total.

---

### 📈 Reports & Financial Analytics

The Reports module provides business-level insights.

It includes:

- Total sales
- Revenue analysis
- Monthly revenue chart
- Sales trends
- Top customers
- Date-based filtering

This helps management understand sales performance and identify important business trends.

---

### 📝 Activity & Audit Logs

The Activity Logs module maintains an audit trail of important system activities.

Examples include:

- User login
- Customer updates
- Challan creation
- Stock restocking
- Inventory changes
- Other important business actions

Each log can contain:

- Timestamp
- Action
- Activity details
- User responsible

This improves transparency and accountability within the system.

---

## 🛡️ Role-Based Access Control

The application uses role-based authorization to control access to different modules.

### Admin

Admin users have access to overall system management and monitoring.

### Sales

Sales users primarily work with:

- Customers
- CRM
- Follow-ups
- Sales challans
- Sales-related information

### Warehouse

Warehouse users primarily manage:

- Products
- Inventory
- Stock movements
- Stock updates

### Accounts

Accounts users can work with:

- Sales information
- Financial reports
- Business analytics

This approach ensures that users only interact with features relevant to their responsibilities.

---

## 🗄️ Database

The application uses **MySQL** as the primary relational database.

The database stores information related to:

- Users
- Customers
- Products
- Stock movements
- Challans
- Challan items
- Activity logs

### User Table

The users table contains information such as:

```text
id
name
email
password_hash
role
status
reset_password_token
