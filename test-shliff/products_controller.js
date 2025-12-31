// Import ObjectId from MongoDB for ID validation and conversion
import { ObjectId } from 'mongodb';

/**
 * Create a new product in MongoDB
 * POST /api/products
 * 
 * Request body: { name, description, price, category, stock }
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function createProduct(req, res) {
  try {
    // Extract product data from request body
    const { name, description, price, category, stock } = req.body;
    
    // Get MongoDB database connection from request object
    // (attached by middleware in server.js)
    const db = req.mongoDbConn;
    
    // Get reference to the products collection
    const productsCollection = db.collection('products');
    
    // Create product document with all fields
    const product = {
      name,                              // Product name (must be unique)
      description,                       // Product description
      price,                             // Product price (number)
      category,                          // Product category (e.g., "Electronics")
      stock: stock || 0,                 // Available stock (default to 0 if not provided)
      totalOrdersCount: 0,               // Counter for number of orders (starts at 0)
      createdAt: new Date(),             // Timestamp when product was created
      updatedAt: new Date()              // Timestamp when product was last updated
    };
    
    // Insert the product document into MongoDB
    const result = await productsCollection.insertOne(product);
    
    // Return success response with created product
    // Convert MongoDB _id to string 'id' for consistency with REST conventions
    res.status(201).json({
      id: result.insertedId.toString(),  // MongoDB ObjectId as string
      ...product                         // Spread all product fields
    });
    
  } catch (error) {
    // Handle MongoDB duplicate key error (error code 11000)
    // This occurs when trying to insert a product with an existing name
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Product with this name already exists' 
      });
    }
    
    // Handle all other errors with 500 status
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all products or filter by category
 * GET /api/products
 * GET /api/products?category=Electronics
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getProducts(req, res) {
  try {
    // Get MongoDB database connection from request object
    const db = req.mongoDbConn;
    
    // Get reference to the products collection
    const productsCollection = db.collection('products');
    
    // Extract optional category filter from query parameters
    const { category } = req.query;
    
    // Build filter object for MongoDB query
    // If category is provided, filter by it; otherwise, empty object returns all
    const filter = category ? { category } : {};
    
    // Query MongoDB with the filter and convert cursor to array
    const products = await productsCollection.find(filter).toArray();
    
    // Transform products array to use 'id' instead of '_id'
    // This provides a cleaner API response format
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),   // Convert ObjectId to string
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      totalOrdersCount: product.totalOrdersCount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));
    
    // Return products array with 200 OK status
    res.status(200).json(transformedProducts);
    
  } catch (error) {
    // Handle any errors with 500 status
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get a single product by ID
 * GET /api/products/:id
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getProduct(req, res) {
  try {
    // Extract product ID from URL parameters
    const { id } = req.params;
    
    // Validate that the ID is a valid MongoDB ObjectId format
    // ObjectId must be a 24-character hexadecimal string
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    // Get MongoDB database connection from request object
    const db = req.mongoDbConn;
    
    // Get reference to the products collection
    const productsCollection = db.collection('products');
    
    // Find the product by its ObjectId
    // new ObjectId(id) converts the string ID to MongoDB ObjectId
    const product = await productsCollection.findOne({ 
      _id: new ObjectId(id) 
    });
    
    // If product not found, return 404 error
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Transform product to use 'id' instead of '_id'
    const transformedProduct = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      totalOrdersCount: product.totalOrdersCount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
    
    // Return product with 200 OK status
    res.status(200).json(transformedProduct);
    
  } catch (error) {
    // Handle any errors with 500 status
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update a product by ID (BONUS)
 * PUT /api/products/:id
 * 
 * Request body: { price?, description?, stock?, category?, name? }
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function updateProduct(req, res) {
  try {
    // Extract product ID from URL parameters
    const { id } = req.params;
    
    // Validate that the ID is a valid MongoDB ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    // Extract update fields from request body
    const updates = req.body;
    
    // Add updatedAt timestamp to track when product was modified
    updates.updatedAt = new Date();
    
    // Get MongoDB database connection from request object
    const db = req.mongoDbConn;
    
    // Get reference to the products collection
    const productsCollection = db.collection('products');
    
    // Update the product using findOneAndUpdate
    // $set operator updates only the specified fields
    // returnDocument: 'after' returns the updated document
    const result = await productsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },          // Filter: find product by ID
      { $set: updates },                  // Update: set new values
      { returnDocument: 'after' }         // Return updated document
    );
    
    // If product not found, return 404 error
    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Transform updated product to use 'id' instead of '_id'
    const transformedProduct = {
      id: result._id.toString(),
      name: result.name,
      description: result.description,
      price: result.price,
      category: result.category,
      stock: result.stock,
      totalOrdersCount: result.totalOrdersCount,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
    
    // Return updated product with 200 OK status
    res.status(200).json(transformedProduct);
    
  } catch (error) {
    // Handle MongoDB duplicate key error if updating name to existing name
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Product with this name already exists' 
      });
    }
    
    // Handle all other errors with 500 status
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a product by ID (BONUS)
 * DELETE /api/products/:id
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function deleteProduct(req, res) {
  try {
    // Extract product ID from URL parameters
    const { id } = req.params;
    
    // Validate that the ID is a valid MongoDB ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    // Get MongoDB database connection from request object
    const db = req.mongoDbConn;
    
    // Get reference to the products collection
    const productsCollection = db.collection('products');
    
    // Delete the product by its ObjectId
    const result = await productsCollection.deleteOne({ 
      _id: new ObjectId(id) 
    });
    
    // If no document was deleted, product wasn't found
    // deletedCount will be 0 if product doesn't exist
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Return success message with 200 OK status
    res.status(200).json({ 
      message: 'Product deleted successfully' 
    });
    
  } catch (error) {
    // Handle any errors with 500 status
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
}