// Import mysql2/promise for MySQL database operations with async/await support
import mysql from 'mysql2/promise';

// MySQL connection configuration object
const config = {
  host: 'localhost',      // Database server address
  port: 3306,             // MySQL default port
  user: 'root',           // Database username
  password: 'root'        // Database password
};

// Name of the database we'll create and use
const DB_NAME = 'ecommerce';

// Global variable to store the MySQL connection instance
// This will be reused across the application (singleton pattern)
let connection = null;

/**
 * Initialize MySQL database and create tables
 * This function should be called once when the server starts
 * 
 * Steps:
 * 1. Connect to MySQL server (without specifying a database)
 * 2. Create the database if it doesn't exist
 * 3. Use the database
 * 4. Create the orders table with proper schema
 * 
 * @returns {Promise<void>}
 */
export async function initSqlDb() {
  try {
    // Create initial connection to MySQL server without selecting a database
    // This allows us to create the database if it doesn't exist
    connection = await mysql.createConnection(config);
    console.log('Connected to MySQL successfully');
    
    // Create the ecommerce database if it doesn't already exist
    // IF NOT EXISTS prevents errors if database already exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    console.log(`Database "${DB_NAME}" created or already exists`);
    
    // Switch to use the ecommerce database for subsequent queries
    await connection.query(`USE ${DB_NAME}`);
    console.log(`Using database "${DB_NAME}"`);
    
    // Create the orders table with the following schema:
    // - id: Auto-incrementing primary key
    // - productId: References MongoDB product _id (stored as string)
    // - quantity: Number of items ordered
    // - customerName: Name of the customer
    // - totalPrice: Calculated price (quantity * product price)
    // - orderDate: Timestamp of when order was created
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        productId VARCHAR(24) NOT NULL,
        quantity INT NOT NULL,
        customerName VARCHAR(255) NOT NULL,
        totalPrice DECIMAL(10,2) NOT NULL,
        orderDate DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Execute the CREATE TABLE query
    await connection.query(createTableQuery);
    console.log('Orders table created or already exists');
    
  } catch (error) {
    // If any step fails, log the error and rethrow
    console.error('MySQL initialization error:', error);
    throw error;
  }
}

/**
 * Get the active MySQL connection
 * This function returns the connection instance for use in controllers
 * 
 * @returns {Connection} MySQL connection instance
 * @throws {Error} If connection is not initialized
 */
export function getMysqlConnection() {
  // Check if connection exists
  if (!connection) {
    // If not initialized, throw an error
    throw new Error('MySQL not initialized. Call initSqlDb first.');
  }
  
  // Return the connection instance
  return connection;
}

/**
 * Close MySQL connection
 * This should be called when shutting down the application
 * 
 * @returns {Promise<void>}
 */
export async function closeMysqlConnection() {
  // Check if connection exists before trying to close
  if (connection) {
    // Close the MySQL connection
    await connection.end();
    console.log('MySQL connection closed');
  }
}