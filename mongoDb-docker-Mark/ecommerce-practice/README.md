# E-commerce Practice Exercise

## Overview

Build an Express server that manages products (stored in MongoDB) and orders (stored in MySQL) for an e-commerce system. This exercise will help you practice working with both MongoDB and MySQL databases in a single application.

## Learning Objectives

- Work with both MongoDB and MySQL in one application
- Understand when to use each database type
- Practice cross-database operations
- Handle relationships between NoSQL and SQL data
- Practice SQL and MongoDB endpoints simultaneously

## Database Design

### MongoDB - Products Collection

**Why MongoDB:** Products have flexible schema (varying attributes, categories), and we want to practice document-based storage.

**Schema:**
- `_id` (ObjectId)
- `name` (string, unique, required)
- `description` (string)
- `price` (number, required)
- `category` (string)
- `stock` (number, default: 0)
- `totalOrdersCount` (number, default: 0) - counter for orders
- `createdAt` (Date)
- `updatedAt` (Date)

### MySQL - Orders Table

**Why MySQL:** Orders are transactional data with structured relationships, perfect for relational database.

**Schema:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `productId` (VARCHAR(24), references MongoDB _id as string)
- `quantity` (INT, required)
- `customerName` (VARCHAR(255), required)
- `totalPrice` (DECIMAL(10,2), calculated: quantity * product.price)
- `orderDate` (DATETIME, default: CURRENT_TIMESTAMP)

## Prerequisites

- Node.js (v14 or higher)
- Docker (already running on your system)
- MongoDB running on port 27018
- MySQL running on port 3306
- npm or yarn

## Setup Instructions

1. **Create package.json:**
Create a `package.json` file with `"type": "module"` to use ES modules:
```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

2. **Install dependencies:**
```bash
npm install express nodemon dotenv mongodb mysql2
```

3. **Start Docker containers:**
```bash
docker-compose up -d
```

Make sure your docker-compose.yml includes both MongoDB and MySQL services.

## Step-by-Step Implementation Order

**IMPORTANT:** Follow these steps in order. Complete at minimum Steps 1-7 to have a working application.

### Step 1: Initialize MySQL Database and Tables

Create `utils/mysql.js` with an `initSqlDb()` function that:
- Connects to MySQL
- Creates the database if it doesn't exist (name it `ecommerce`)
- Creates the `orders` table with the schema:
  ```sql
  CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    productId VARCHAR(24) NOT NULL,
    quantity INT NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    orderDate DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
- Call this function in `server.js` before starting the Express server

**Connection details:**
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `root`
- Database: `ecommerce`

### Step 2: Initialize MongoDB Database and Indexes

Create `utils/mongodb.js` with an `initMongoDb()` function that:
- Connects to MongoDB
- Gets the `products` collection
- Creates a unique index on the `name` field: `{ name: 1 }, { unique: true }`
- Call this function in `server.js` before starting the Express server

**Connection details:**
- URL: `mongodb://admin:password123@localhost:27018/ecommerce?authSource=admin`
- Database: `ecommerce`
- Collection: `products`

### Step 3: Create Database Connection Functions

- In `utils/mysql.js`: Create `getMysqlConnection()` function that returns MySQL connection
- In `utils/mongodb.js`: Create `getMongoDbConnection()` function that returns MongoDB database instance
- Create Express middleware in `server.js` that attaches both connections to `req` object:
  - `req.mysqlConn` - MySQL connection
  - `req.mongoDbConn` - MongoDB database connection

### Step 4: POST /api/products (MongoDB)

Create the endpoint to add new products:
- Route: `POST /api/products`
- Controller: `createProduct` in `controllers/products.js`
- Body: `{ "name": "Laptop", "description": "Gaming laptop", "price": 999.99, "category": "Electronics", "stock": 10 }`
- **CRITICAL:** Handle MongoDB duplicate key error:
  ```javascript
  catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: "Product with this name already exists" 
      });
    }
    // ... other error handling
  }
  ```
- Response 201: Created product with `_id` converted to `id` string
- Response 409: Product name already exists

### Step 5: GET /api/products (MongoDB)

Create endpoints to retrieve products:
- Route: `GET /api/products` - Get all products (optional `?category=Electronics` filter)
- Route: `GET /api/products/:id` - Get single product by ID
- Controllers: `getProducts` and `getProduct` in `controllers/products.js`
- Validate ObjectId format before querying
- Response 200: Products array or single product
- Response 404: Product not found

### Step 6: POST /api/orders (MySQL + MongoDB)

Create the endpoint to add new orders:
- Route: `POST /api/orders`
- Controller: `createOrder` in `controllers/orders.js`
- Body: `{ "productId": "mongoObjectId", "quantity": 2, "customerName": "John Doe" }`
- **Cross-database validation:** First check if product exists in MongoDB
- Calculate `totalPrice = quantity * product.price`
- Insert order into MySQL
- Increment `totalOrdersCount` in MongoDB product document
- Response 201: Created order
- Response 404: Product not found

### Step 7: GET /api/orders (MySQL)

Create endpoints to retrieve orders:
- Route: `GET /api/orders` - Get all orders (optional `?productId=mongoObjectId` filter)
- Route: `GET /api/orders/:id` - Get single order by ID
- Controllers: `getOrders` and `getOrder` in `controllers/orders.js`
- Validate integer ID format
- Response 200: Orders array or single order
- Response 404: Order not found

### Step 8: PUT /api/products/:id (MongoDB) - Bonus

Update existing products:
- Route: `PUT /api/products/:id`
- Controller: `updateProduct` in `controllers/products.js`
- Body: Partial update `{ "price": 899.99, "stock": 5 }`
- **CRITICAL:** Handle duplicate name error (error.code === 11000) if updating name
- Response 200: Updated product
- Response 404: Product not found
- Response 409: Product name already exists (if updating name)

### Step 9: DELETE /api/products/:id (MongoDB) - Bonus

Delete products:
- Route: `DELETE /api/products/:id`
- Controller: `deleteProduct` in `controllers/products.js`
- Response 200: Success message
- Response 404: Product not found

### Step 10: PUT /api/orders/:id (MySQL + MongoDB) - Bonus

Update existing orders:
- Route: `PUT /api/orders/:id`
- Controller: `updateOrder` in `controllers/orders.js`
- Body: Partial update `{ "quantity": 3, "customerName": "Jane Doe" }`
- **Cross-database operations:**
  - If quantity changes, recalculate `totalPrice = newQuantity * product.price`
  - Update order in MySQL
  - Adjust `totalOrdersCount` in MongoDB product if needed (if productId changes)
- Response 200: Updated order
- Response 404: Order not found or Product not found (if productId changes)

### Step 11: DELETE /api/orders/:id (MySQL + MongoDB) - Bonus

Delete orders:
- Route: `DELETE /api/orders/:id`
- Controller: `deleteOrder` in `controllers/orders.js`
- **Cross-database operations:**
  - Delete order from MySQL
  - Decrement `totalOrdersCount` in MongoDB product document
- Response 200: Success message
- Response 404: Order not found

## Minimum Viable Completion

You must complete at minimum:
- ✅ Step 1: MySQL database and table initialization
- ✅ Step 2: MongoDB database and unique index initialization
- ✅ Step 3: Database connection functions and middleware
- ✅ Step 4: POST /api/products
- ✅ Step 5: GET /api/products (both endpoints)
- ✅ Step 6: POST /api/orders
- ✅ Step 7: GET /api/orders (both endpoints)

## Error Handling Requirements

### MongoDB Duplicate Key Error (REQUIRED)

When creating or updating products, you MUST catch the duplicate key error:

```javascript
try {
  // MongoDB insert or update operation
} catch (error) {
  if (error.code === 11000) {
    return res.status(409).json({ 
      error: "Product with this name already exists" 
    });
  }
  // Handle other errors
  res.status(500).json({ error: error.message });
}
```

This error occurs when:
- Creating a product with a name that already exists
- Updating a product's name to one that already exists

### Other Error Handling

- Validate ObjectId format for MongoDB queries (return 400 if invalid)
- Validate integer IDs for MySQL queries (return 400 if invalid)
- Return 404 when resources are not found
- Return 500 for server errors
- Return appropriate HTTP status codes for all scenarios

## API Endpoints Summary

### Required Endpoints

| Method | Endpoint | Description | Database |
|--------|----------|-------------|----------|
| POST | `/api/products` | Create a new product | MongoDB |
| GET | `/api/products` | Get all products (optional category filter) | MongoDB |
| GET | `/api/products/:id` | Get product by ID | MongoDB |
| POST | `/api/orders` | Create a new order | MySQL + MongoDB |
| GET | `/api/orders` | Get all orders (optional productId filter) | MySQL |
| GET | `/api/orders/:id` | Get order by ID | MySQL |

### Bonus Endpoints

| Method | Endpoint | Description | Database |
|--------|----------|-------------|----------|
| PUT | `/api/products/:id` | Update product | MongoDB |
| DELETE | `/api/products/:id` | Delete product | MongoDB |
| PUT | `/api/orders/:id` | Update order | MySQL + MongoDB |
| DELETE | `/api/orders/:id` | Delete order | MySQL + MongoDB |

## Example Requests

### Create Product
```bash
POST http://localhost:8000/api/products
Content-Type: application/json

{
  "name": "Laptop",
  "description": "Gaming laptop",
  "price": 999.99,
  "category": "Electronics",
  "stock": 10
}
```

### Get All Products
```bash
GET http://localhost:8000/api/products
GET http://localhost:8000/api/products?category=Electronics
```

### Create Order
```bash
POST http://localhost:8000/api/orders
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2,
  "customerName": "John Doe"
}
```

### Get All Orders
```bash
GET http://localhost:8000/api/orders
GET http://localhost:8000/api/orders?productId=507f1f77bcf86cd799439011
```

## Testing Checklist

Test your implementation with:

- [ ] Creating products with duplicate names (unique constraint) - Must return 409 error
- [ ] Creating orders with invalid productId - Must return 404 error
- [ ] Updating products with duplicate names - Must return 409 error
- [ ] Updating non-existent products - Must return 404 error
- [ ] Creating orders for non-existent products - Must return 404 error
- [ ] Querying products by category filter
- [ ] Querying orders by productId filter
- [ ] Validating ObjectId format
- [ ] Validating integer ID format

## Project Structure

Create the following structure:

```
ecommerce-practice/
├── controllers/
│   ├── products.js      # Product CRUD operations (MongoDB)
│   └── orders.js        # Order operations (MySQL)
├── routes/
│   ├── products.js      # Product routes
│   └── orders.js        # Order routes
├── utils/
│   ├── mongodb.js       # MongoDB connection
│   └── mysql.js         # MySQL connection
├── sql/
│   └── init.sql         # MySQL schema (optional, can be in code)
├── server.js            # Express app setup
├── package.json
└── README.md            # This file
```

## Key Learning Points

1. **Database Selection Rationale:**
   - MongoDB for Products: Flexible schema, document-based, good for catalog data
   - MySQL for Orders: Structured transactions, relational integrity, ACID compliance

2. **Cross-Database Relationships:**
   - Store MongoDB ObjectId as string in MySQL
   - Validate existence before creating relationships
   - Handle referential integrity manually (no foreign keys across DBs)

3. **Counter Pattern:**
   - Increment MongoDB counter when MySQL order is created
   - Demonstrates eventual consistency considerations

4. **Error Handling:**
   - Always catch MongoDB duplicate key errors (code 11000)
   - Validate IDs before querying
   - Return appropriate HTTP status codes

## Bonus Challenges (Advanced)

- [ ] PUT /api/orders/:id - Update order (Step 10)
- [ ] DELETE /api/orders/:id - Delete order (Step 11)
- [ ] GET /api/products/:id/stats - Product statistics with order count (cross-DB aggregation)
- [ ] Stock management: Decrement stock when order is created
- [ ] GET /api/orders?includeProduct=true - Orders with embedded product details
- [ ] Prevent deleting products that have orders

## Submission

Submit your completed project with:
- All required endpoints implemented
- Proper error handling (especially duplicate key errors)
- Clean, readable code
- Working database connections
- Proper HTTP status codes

Good luck! 🚀

