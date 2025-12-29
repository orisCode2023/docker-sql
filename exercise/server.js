import express from 'express'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'


const app = express()
dotenv.config()
const PORT = process.env.PORT || 3000

app.use(express.json())

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})

console.log("connection to db success")

async function setupDatabase() {
  try {
    const createTable =
      `CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status ENUM("pending", "in_progress", "completed") DEFAULT 'pending',
      priority ENUM ( "low", "medium", "high") DEFAULT 'medium',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) `
    await connection.query(createTable)
    console.log('tasks table is ready')
  } catch (err) {
    console.log('error creating table ', err.message)
  }
}

app.get('/', (req, res) => {
  res.json({
    message: 'welcome to your run tasks API',
    endpoints: {
      'GET /api/tasks': 'GET ALL MISSION',
      'GET /api/tasks/:id': 'GET MISSION BY ID',
      'POST /api/tasks': 'CREATE NEW MISSION',
      'PUT /api/tasks/:id': 'UPDATE MISSION',
      'DELETE /api/tasks/:id': 'DELETE MISSION'
    }
  })
})

app.get('/api/tasks', async (req, res) => {
  try {    
    const [tasks] = await connection.query(`SELECT * FROM tasks ORDER BY
       created_at DESC`);
    console.log(tasks)
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    console.error("faild to get all tasks", err)
    res.status(500).json({
      success: false,
      message: "faild to get all tasks",
      error: err.message
    });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const [result] = await connection.query(
      'INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)',
      [title, description || null, status || 'pending', priority || 'medium']
    );

    const [newTask] = await connection.query(
      'SELECT * FROM tasks WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "task created successfully",
      data: newTask[0]
    });
  } catch (err) {
    console.error('error creating the task', err);
    res.status(500).json({
      success: false,
      message:'error creating the task',
      error: err.message
    });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tasks] = await connection.query(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`
      });
    }

    res.json({
      success: true,
      data: tasks[0]
    });
  } catch (err) {
    console.error("error gets this task", err);
    res.status(500).json({
      success: false,
      message:"error gets this task",
      error: err.message
    });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const [existing] = await connection.query(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`
      });
    }

    await connection.query(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ? WHERE id = ?',
      [
        title || existing[0].title,
        description !== undefined ? description : existing[0].description,
        status || existing[0].status,
        priority || existing[0].priority,
        id
      ]
    );

    const [updated] = await connection.query(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'task updata successfully',
      data: updated[0]
    });
  } catch (err) {
    console.error('error updataing the taks', err);
    res.status(500).json({
      success: false,
      message: 'error updataing the taks',
      error: err.message
    });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await connection.query(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`
      });
    }

    await connection.query('DELETE FROM tasks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'task deleted successfully!',
      data: existing[0]
    });
  } catch (err) {
    console.error('error deleting the task', err);
    res.status(500).json({
      success: false,
      message: 'error deleting the task',
      error: err.message
    });
  }
});


setupDatabase()
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});