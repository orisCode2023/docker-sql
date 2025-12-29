import express from 'express';
import userRoutes from './routes/userRoutes.js';

import './config/db.js';

const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.json());


app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Modular MySQL CRUD API',
    version: '1.0.0',
    database: 'MySQL',
    architecture: 'MVC (Model-View-Controller)',
    documentation: {
      'GET /': 'Get all tasks',
      'GET /:id': 'Get task by ID',
      'POST /' : 'Create new task (body: title, description, status, priority)',
      'PUT /:id': 'Update task',
      'DELETE /:id': 'Delete task'
    }
  });
});


app.use('/api/users', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Modular MySQL CRUD Server is running');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/get`);
  console.log(`💾 Database: MySQL`);
  console.log(`🏗️  Architecture: MVC (Modular)`);
  console.log('='.repeat(50));
});