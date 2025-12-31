// Import ObjectId from MongoDB for product ID validation
import { ObjectId } from 'mongodb';

/**
 * Create a new order (Cross-database operation)
 * POST /api/orders
 * 
 * Steps:
 * 1. Validate product exists in MongoDB
 * 2. Calculate total price
 * 3. Insert order into MySQL
 * 4. Increment product order count in MongoDB
 * 
 * Request body: { productId, quantity, customerName }
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function createOrder(req, res) {
  try {
    // Extract order data from request body
    const { productId, quantity, customerName } = req.body;
    
    // Validate that productId is a valid MongoDB ObjectId format
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    // Get MongoDB database connection from request object
    const db = req.mongoDbConn;
    
    // Get reference to the products collection
    const productsCollection = db.collection('products');
    
    // CROSS-DATABASE VALIDATION: Check if product exists in MongoDB
    // We need the product to calculate totalPrice
    const product = await productsCollection.findOne({ 
      _id: new ObjectId(productId) 
    });
    
    // If product not found, return 404 error
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Calculate total price: quantity * product price
    const totalPrice = quantity * product.price;
    
    // Get MySQL connection from request object
    const mysqlConn = req.mysqlConn;
    
    // Insert order into MySQL orders table
    // Use parameterized query to prevent SQL injection
    const insertQuery = `
      INSERT INTO orders (productId, quantity, customerName, totalPrice)
      VALUES (?, ?, ?, ?)
    `;
    
    // Execute the insert query with parameters
    // Parameters are safely escaped by mysql2
    const [result] = await mysqlConn.query(insertQuery, [
      productId,      // MongoDB ObjectId as string
      quantity,       // Number of items ordered
      customerName,   // Customer's name
      totalPrice      // Calculated total price
    ]);
    
    // CROSS-DATABASE UPDATE: Increment totalOrdersCount in MongoDB
    // This tracks how many orders have been placed for this product
    await productsCollection.updateOne(
      { _id: new ObjectId(productId) },           // Find the product
      { $inc: { totalOrdersCount: 1 } }           // Increment counter by 1
    );
    
    // Fetch the created order from MySQL to return complete data
    const [orders] = await mysqlConn.query(
      'SELECT * FROM orders WHERE id = ?',
      [result.insertId]  // Use the auto-generated ID from insert
    );
    
    // Return success response with created order
    res.status(201).json(orders[0]);
    
  } catch (error) {
    // Handle any errors with 500 status
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all orders or filter by productId
 * GET /api/orders
 * GET /api/orders?productId=mongoObjectId
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getOrders(req, res) {
  try {
    // Get MySQL connection from request object
    const mysqlConn = req.mysqlConn;
    
    // Extract optional productId filter from query parameters
    const { productId } = req.query;
    
    // Build SQL query based on whether productId filter is provided
    let query = 'SELECT * FROM orders';
    let params = [];
    
    // If productId is provided, add WHERE clause to filter results
    if (productId) {
      // Validate productId format before using it in query
      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }
      
      query += ' WHERE productId = ?';
      params.push(productId);
    }
    
    // Execute the query with parameters (empty array if no filter)
    const [orders] = await mysqlConn.query(query, params);
    
    // Return orders array with 200 OK status
    res.status(200).json(orders);
    
  } catch (error) {
    // Handle any errors with 500 status
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get a single order by ID
 * GET /api/orders/:id
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getOrder(req, res) {
  try {
    // Extract order ID from URL parameters
    const { id } = req.params;
    
    // Validate that ID is a valid integer
    // MySQL uses integer auto-increment IDs
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    // Get MySQL connection from request object
    const mysqlConn = req.mysqlConn;
    
    // Query for the specific order by ID
    // Use parameterized query to prevent SQL injection
    const [orders] = await mysqlConn.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    // If no order found, return 404 error
    // The query returns an empty array if no match
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Return the order (first element of array) with 200 OK status
    res.status(200).json(orders[0]);
    
  } catch (error) {
    // Handle any errors with 500 status
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update an order by ID (BONUS - Cross-database operation)
 * PUT /api/orders/:id
 * 
 * Steps:
 * 1. Get existing order from MySQL
 * 2. If productId changed, validate new product in MongoDB
 * 3. Recalculate totalPrice if quantity or productId changed
 * 4. Update order in MySQL
 * 5. Adjust totalOrdersCount in MongoDB if productId changed
 * 
 * Request body: { quantity?, customerName?, productId? }
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function updateOrder(req, res) {
  try {
    // Extract order ID from URL parameters
    const { id } = req.params;
    
    // Validate that ID is a valid integer
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    // Extract update fields from request body
    const { quantity, customerName, productId } = req.body;
    
    // Get MySQL connection from request object
    const mysqlConn = req.mysqlConn;
    
    // Fetch existing order to get current values
    const [existingOrders] = await mysqlConn.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    // If order not found, return 404 error
    if (existingOrders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const existingOrder = existingOrders[0];
    
    // Determine which productId to use (new or existing)
    const finalProductId = productId || existingOrder.productId;
    
    // Validate product ID format if it's being changed
    if (productId && !ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    // Get MongoDB database connection
    const db = req.mongoDbConn;
    const productsCollection = db.collection('products');
    
    // Fetch product from MongoDB to recalculate price if needed
    const product = await productsCollection.findOne({ 
      _id: new ObjectId(finalProductId) 
    });
    
    // If product not found, return 404 error
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Calculate new total price
    // Use new quantity if provided, otherwise use existing quantity
    const finalQuantity = quantity !== undefined ? quantity : existingOrder.quantity;
    const totalPrice = finalQuantity * product.price;
    
    // Prepare update query with all fields
    const updateQuery = `
      UPDATE orders 
      SET productId = ?, quantity = ?, customerName = ?, totalPrice = ?
      WHERE id = ?
    `;
    
    // Execute the update query
    await mysqlConn.query(updateQuery, [
      finalProductId,
      finalQuantity,
      customerName || existingOrder.customerName,
      totalPrice,
      orderId
    ]);
    
    // CROSS-DATABASE UPDATE: Adjust totalOrdersCount if productId changed
    if (productId && productId !== existingOrder.productId) {
      // Decrement count for old product
      await productsCollection.updateOne(
        { _id: new ObjectId(existingOrder.productId) },
        { $inc: { totalOrdersCount: -1 } }
      );
      
      // Increment count for new product
      await productsCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $inc: { totalOrdersCount: 1 } }
      );
    }
    
    // Fetch and return the updated order
    const [updatedOrders] = await mysqlConn.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    // Return updated order with 200 OK status
    res.status(200).json(updatedOrders[0]);
    
  } catch (error) {
    // Handle any errors with 500 status
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete an order by ID (BONUS - Cross-database operation)
 * DELETE /api/orders/:id
 * 
 * Steps:
 * 1. Get order from MySQL
 * 2. Delete order from MySQL
 * 3. Decrement totalOrdersCount in MongoDB
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function deleteOrder(req, res) {
  try {
    // Extract order ID from URL parameters
    const { id } = req.params;
    
    // Validate that ID is a valid integer
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    // Get MySQL connection from request object
    const mysqlConn = req.mysqlConn;
    
    // First, fetch the order to get the productId
    // We need this to decrement the counter in MongoDB
    const [orders] = await mysqlConn.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    // If order not found, return 404 error
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Delete the order from MySQL
    await mysqlConn.query(
      'DELETE FROM orders WHERE id = ?',
      [orderId]
    );
    
    // CROSS-DATABASE UPDATE: Decrement totalOrdersCount in MongoDB
    // This keeps the product's order counter accurate
    const db = req.mongoDbConn;
    const productsCollection = db.collection('products');
    
    await productsCollection.updateOne(
      { _id: new ObjectId(order.productId) },     // Find the product
      { $inc: { totalOrdersCount: -1 } }          // Decrement counter by 1
    );
    
    // Return success message with 200 OK status
    res.status(200).json({ 
      message: 'Order deleted successfully' 
    });
    
  } catch (error) {
    // Handle any errors with 500 status
    console.error('Error deleting order:', error);
    res.status(500).json({ error: error.message });
  }
}