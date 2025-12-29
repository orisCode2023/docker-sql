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


