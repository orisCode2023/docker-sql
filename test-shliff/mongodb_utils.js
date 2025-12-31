// Import MongoClient from the mongodb package
// MongoClient is the main class for connecting to MongoDB
import { MongoClient } from 'mongodb';

// MongoDB connection URL with authentication credentials
// Format: mongodb://username:password@host:port/database?authSource=admin
const MONGO_URL = 'mongodb://admin:password123@localhost:27018/ecommerce?authSource=admin';

// Name of the database we'll be using
const DB_NAME = 'ecommerce';

// Name of the collection that will store product documents
const COLLECTION_NAME = 'products';

// Global variable to store the MongoDB client instance
// This will be reused across the application (singleton pattern)
let client = null;

// Global variable to store the database instance
// This provides access to collections and database operations
let db = null;

/**
 * Initialize MongoDB database connection and create indexes
 * This function should be called once when the server starts
 * 
 * @returns {Promise<void>}
 */
export async function initMongoDb() {
  try {
    // Create a new MongoClient instance with the connection URL
    client = new MongoClient(MONGO_URL);
    
    // Connect to MongoDB server
    // This establishes the connection and authenticates
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    // Get reference to the specific database
    db = client.db(DB_NAME);
    
    // Get reference to the products collection
    const productsCollection = db.collection(COLLECTION_NAME);
    
    // Create a unique index on the 'name' field
    // This ensures no two products can have the same name
    // { name: 1 } means ascending order index on the name field
    // { unique: true } enforces uniqueness constraint
    await productsCollection.createIndex(
      { name: 1 },
      { unique: true }
    );
    console.log('MongoDB unique index created on product name');
    
  } catch (error) {
    // If connection or index creation fails, log error and rethrow
    console.error('MongoDB initialization error:', error);
    throw error;
  }
}

/**
 * Get the active MongoDB database connection
 * This function returns the database instance for use in controllers
 * 
 * @returns {Db} MongoDB database instance
 * @throws {Error} If database is not initialized
 */
export function getMongoDbConnection() {
  // Check if database connection exists
  if (!db) {
    // If not initialized, throw an error
    throw new Error('MongoDB not initialized. Call initMongoDb first.');
  }
  
  // Return the database instance
  return db;
}

/**
 * Close MongoDB connection
 * This should be called when shutting down the application
 * 
 * @returns {Promise<void>}
 */
export async function closeMongoConnection() {
  // Check if client exists before trying to close
  if (client) {
    // Close the MongoDB connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}