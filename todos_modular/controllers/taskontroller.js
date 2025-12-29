import Task from '..models/taskModel.js'


export const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.getAll()
        res.josn({
            success: true,
            count: tasks.length, 
            data: tasks
        });
    } catch (error) {
        console.error('error getting tasks:', error)
        res.status(500).josn({
            success: false,
            message: 'Error getting tasks',
            error: error.message
        });
    }
};

export const getTaskById = async (req, res) => {
    try {
        const taskId = req.params
        const task = await Task.getById(taskId)

        if (!task){
            return res.status(404).josn({
                success: false,
                message: `Task with ID ${id} not found`
            })
        }
        res.josn({
            success: true,
            count: task.length, 
            data: task
        });
    } catch (error) {
        console.error('error getting tasks:', error)
        res.status(500).josn({
            success: false,
            message: `could not find task with id ${taskId}`,
            error: error.message
        });
    }
}

export const createTask = async (req, res) => {
    try {
        const {title, description, status, priority} = req.body
        if (!title || title.trim() === ''){
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            })
        }

        const newTask = await Task.create({title, description, status, priority})
        res.status(201).josn({
            success: true,
            message:'Task created',
            data: newTask
        });
    } catch (error) {
        console.error('error creating tasks:', error)
        res.status(500).josn({
            success: false,
            message: `could not creat task`,
            error: error.message
        });
    }
}

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const updated = await Task.update(id, { title, description, status, priority });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`
      });
    }

    const updatedTask = await Task.getById(id);

    res.json({
      success: true,
      message: 'Task updated successfully!',
      data: updatedTask
    });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: err.message
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.remove(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully!',
      data: deleted
    });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: err.message
    });
  }
};