// Import Express to create router
import express from 'express';

// Import all product controller functions
import { 
  createProduct,    // POST - Create new product
  getProducts,      // GET - Get all products or filter by category
  getProduct,       // GET - Get single product by ID
  updateProduct,    // PUT - Update product (BONUS)
  deleteProduct     // DELETE - Delete product (BONUS)
} from '../controllers/products.js';

// Create a new Express router instance
// Router allows us to define routes in separate modules
const router = express.Router();

// Route: Create a new product
// POST /api/products
// Request body: { name, description, price, category, stock }
// Response: 201 Created with product data
router.post('/', createProduct);

// Route: Get all products or filter by category
// GET /api/products
// GET /api/products?category=Electronics
// Response: 200 OK with array of products
router.get('/', getProducts);

// Route: Get a single product by ID
// GET /api/products/:id
// URL parameter: id (MongoDB ObjectId as string)
// Response: 200 OK with product data, or 404 if not found
router.get('/:id', getProduct);

// Route: Update a product by ID (BONUS)
// PUT /api/products/:id
// URL parameter: id (MongoDB ObjectId as string)
// Request body: { name?, description?, price?, category?, stock? }
// Response: 200 OK with updated product, or 404 if not found
router.put('/:id', updateProduct);

// Route: Delete a product by ID (BONUS)
// DELETE /api/products/:id
// URL parameter: id (MongoDB ObjectId as string)
// Response: 200 OK with success message, or 404 if not found
router.delete('/:id', deleteProduct);

// Export the router so it can be used in server.js
export default router;