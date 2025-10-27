const router = require('express').Router();
const {
    createTask,
    updateTask,
    deleteTask,
    getAllTasks,
    getTaskById
} = require('../../controllers/tasks');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const { adminOnly } = require('../../middlewares/isAdminMiddleware');



// All task routes require authentication AND admin role
router.post('/', authMiddleware, adminOnly, createTask);
router.put('/:id', authMiddleware, adminOnly, updateTask);
router.delete('/:id', authMiddleware, adminOnly, deleteTask);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);

module.exports = router;
