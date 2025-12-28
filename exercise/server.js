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


setupDatabase()
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});