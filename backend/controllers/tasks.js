const Task = require('../models/Task');
const mongoose = require('mongoose');

// Create a new task
const createTask = async (req, res) => {
    try {
        const { title, description, status, assignedTo } = req.body;

        // Validate required fields
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }
        if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
        if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }


        const newTask = new Task({
            title,
            description,
            status,
            assignedTo: assignedTo ? mongoose.Types.ObjectId(assignedTo) : null,
        });

        const savedTask = await newTask.save();
        res.status(201).json({ success: true, message: 'Task created successfully', task: savedTask });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success: false, message: 'Server error while creating task' });
    }
};


const updateTask = async (req, res) => {
    // Implementation for updating a task
    try{
        const { id } = req.params;
        const { title, description, status, assignedTo } = req.body;

        // Validate task ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid task ID format' });
        }

        // Validate status if provided
        if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        // Validate assignedTo if provided
        if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            {
                title,
                description,
                status,
                assignedTo: assignedTo ? mongoose.Types.ObjectId(assignedTo) : null,
            },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, message: 'Task updated successfully', task: updatedTask });
    } catch(error){
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, message: 'Server error while updating task' });
    }

}


const deleteTask = async (req, res) => {
    // Implementation for deleting a task
    try{
        const { id } = req.params;

        // Validate task ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid task ID format' });
        }

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch(error){
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting task' });
    }
}


const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', '-password'); // Exclude password field
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching tasks' });
    }
};


const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate task ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid task ID format' });
        }

        const task = await Task.findById(id).populate('assignedTo', '-password'); // Exclude password field

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching task' });
    }
};



module.exports = {
    createTask, updateTask, deleteTask, getAllTasks, getTaskById
};