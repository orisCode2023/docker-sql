import mysql from 'mysql2/promise'
import dotenv from 'dotenv'


dotenv.config()
const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});
console.log("connection to db success")

async function setupDatebase(){
    try {
        const createTable = 
        `CREATE TABLE IF NOT EXIST tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAT(200) NOT NULL,
        description TEXT, 
        status ENUM ('pending', 'in_progress', 'completed') DEFAULT 'pending',
        priority ENUM ('low', 'medium', 'high') DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    await connection.query(createTable)
    console.log('tasks table is ready')
    } catch (error) {
        console.log(error.message)
        
    }
}
setupDatebase();

export default connection;