import connection from '../config/db.js'

async function getAll() {
    const [data] = await connection.query(`SELECT * FROM tasks
         ORDER BY created_at DESC`)
    await connection.end()
    return data
}

async function getById(id) {
    const [data] = await connection.query(`SELECT * FROM tasks WHERE ID = ? `[id])
    await connection.end()
    return data
}

async function create(taskData) {
    const { title, description, status, priority } = taskData
    const [data] = await connection.query(`INSERT INTO tasks (title, description, status, priority)
    VALUES (?, ?, ?, ?)`, [title, description || null, status || 'pending', priority || 'medium'])
    const [newTask] = await connection.query(`SELECT * FROM tasks WHERE id = ?`, [data.insertId])
    await connection.end()
    return newTask
}
console.log(await create({title: "go to tommoroland", description: "to have fun in a party", status: 'pending', priority: "high"}))

async function update(id, taskData) {
    
    const { title, description, status, priority } = taskData
    cosnt[existing] = await connection.query(
        `SELECT * FROM tasks WHERE id = ?`, [id]
    )
    const update = await connection.query(
        `UPDATE tasks SET title = ?, description = ?, status = ?, priority = ? WHERE id = ?`,
        [
            title || existing[0].title,
            description !== undefined ? description : existing[0].description,
            status || existing[0].status,
            priority || existing[0].priority,
            id
        ]
    )
    await connection.end()
    return update
}
async function remove(id) {
    const taskId = {id}
    await connection.query(
        `DELETE * FROM tasks WHERE id = ? `, [taskId] 
    )
    await connection.end()
    
 }


export default { getAll, getById, create, update, remove }