// Import the Express framework for building the web server
import express from 'express';

// Import database initialization functions
// These will set up our MongoDB and MySQL databases before the server starts
import { initMongoDb } from './utils/mongodb.js';
import { initSqlDb } from './utils/mysql.js';

// Import database connection getter functions
// These provide access to active database connections
import { getMongoDbConnection } from './utils/mongodb.js';
import { getMysqlConnection } from './utils/mysql.js';

// Import route modules for organizing endpoints
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';

// Create an Express application instance
const app = express();

// Define the port number the server will listen on
const PORT = 8000;

// Middleware: Parse incoming JSON request bodies
// This allows us to access req.body as a JavaScript object
app.use(express.json());

// Middleware: Attach database connections to every request
// This makes MongoDB and MySQL connections available in all route handlers
app.use((req, res, next) => {
  // Attach MongoDB database connection to the request object
  req.mongoDbConn = getMongoDbConnection();
  
  // Attach MySQL connection to the request object
  req.mysqlConn = getMysqlConnection();
  
  // Continue to the next middleware or route handler
  next();
});

// Mount the product routes under the /api/products path
// All product-related endpoints will be handled by productRoutes
app.use('/api/products', productRoutes);

// Mount the order routes under the /api/orders path
// All order-related endpoints will be handled by orderRoutes
app.use('/api/orders', orderRoutes);

// Root endpoint for testing if the server is running
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running!' });
});

// Async function to start the server
// We need async because database initialization returns promises
async function startServer() {
  try {
    // Initialize MySQL database and create tables
    // This must complete before the server starts accepting requests
    console.log('Initializing MySQL database...');
    await initSqlDb();
    console.log('MySQL database initialized successfully');
    
    // Initialize MongoDB database and create indexes
    // This ensures the unique index on product names is created
    console.log('Initializing MongoDB database...');
    await initMongoDb();
    console.log('MongoDB database initialized successfully');
    
    // Start the Express server and listen for incoming requests
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // If database initialization fails, log the error and exit
    console.error('Failed to start server:', error);
    process.exit(1); // Exit with error code
  }
}

// Execute the startServer function to launch the application
startServer();