// Import Express to create router
import express from 'express';

// Import all order controller functions
import { 
  createOrder,     // POST - Create new order
  getOrders,       // GET - Get all orders or filter by productId
  getOrder,        // GET - Get single order by ID
  updateOrder,     // PUT - Update order (BONUS)
  deleteOrder      // DELETE - Delete order (BONUS)
} from '../controllers/orders.js';

// Create a new Express router instance
// Router allows us to define routes in separate modules
const router = express.Router();

// Route: Create a new order
// POST /api/orders
// Request body: { productId, quantity, customerName }
// Response: 201 Created with order data
// Note: This is a cross-database operation (validates in MongoDB, inserts in MySQL)
router.post('/', createOrder);

// Route: Get all orders or filter by productId
// GET /api/orders
// GET /api/orders?productId=mongoObjectId
// Response: 200 OK with array of orders
router.get('/', getOrders);

// Route: Get a single order by ID
// GET /api/orders/:id
// URL parameter: id (MySQL integer ID)
// Response: 200 OK with order data, or 404 if not found
router.get('/:id', getOrder);

// Route: Update an order by ID (BONUS)
// PUT /api/orders/:id
// URL parameter: id (MySQL integer ID)
// Request body: { productId?, quantity?, customerName? }
// Response: 200 OK with updated order, or 404 if not found
// Note: This is a cross-database operation (updates MySQL, adjusts counts in MongoDB)
router.put('/:id', updateOrder);

// Route: Delete an order by ID (BONUS)
// DELETE /api/orders/:id
// URL parameter: id (MySQL integer ID)
// Response: 200 OK with success message, or 404 if not found
// Note: This is a cross-database operation (deletes from MySQL, decrements count in MongoDB)
router.delete('/:id', deleteOrder);

// Export the router so it can be used in server.js
export default router;