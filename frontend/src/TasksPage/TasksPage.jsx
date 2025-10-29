import { useState, useEffect } from 'react'
import './TasksPage.css'
import TaskFormPage from './TaskFormPage/TaskFormPage'

function TasksPage({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/tasks/', {
        method: 'GET',
        credentials: 'include', // Include cookies
      })

      const data = await response.json()

      if (data.success) {
        setTasks(data.tasks)
        setError('')
      } else {
        setError(data.message || 'Failed to fetch tasks')
        setTasks([])
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all users for assignment dropdown
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        console.error('HTTP error! status:', response.status)
        return
      }

      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
      } else {
        console.error('Failed to fetch users:', data.message)
        setError(`Failed to load users: ${data.message}`)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users for assignment')
    }
  }

  // Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Task deleted successfully')
        fetchTasks() // Refresh tasks
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(data.message || 'Failed to delete task')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error:', err)
    }
  }

  // Handle create new task
  const handleCreateTask = () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }

  // Handle edit task
  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  // Handle task form save
  const handleTaskSave = (savedTask) => {
    setMessage(`Task ${editingTask ? 'updated' : 'created'} successfully`)
    setShowTaskForm(false)
    setEditingTask(null)
    fetchTasks() // Refresh tasks
    setTimeout(() => setMessage(''), 3000)
  }

  // Handle task form cancel
  const handleTaskCancel = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed'
      case 'in-progress': return 'status-in-progress'
      case 'pending': return 'status-pending'
      default: return 'status-pending'
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [])

  return (
    <div className="tasks-container">
      <header className="tasks-header">
        <div className="header-content">
          <h1>Task Management Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.email} ({user?.role})</span>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="tasks-main">
        <div className="tasks-content">
          <div className="tasks-header-section">
            <h2>All Tasks</h2>
            <div className="header-actions">
              {user?.role === "admin" && (
                <button onClick={handleCreateTask} className="create-btn">
                  Create Task
                </button>
              )}
              <button onClick={fetchTasks} className="refresh-btn">
                Refresh
              </button>
            </div>
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : (
            <div className="tasks-grid">
              {tasks.length === 0 ? (
                <div className="no-tasks">
                  <p>No tasks found.</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task._id} className="task-card">
                    <div className="task-header">
                      <h3 className="task-title">{task.title}</h3>
                      <span className={`status-badge ${getStatusClass(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    
                    <div className="task-details">
                      {task.assignedTo && (
                        <div className="task-assigned">
                          <strong className={user?.username === task.assignedTo.username ? 'current-user' : ''}>Assigned to:</strong> {task.assignedTo.username || task.assignedTo.email }
                        </div>
                      )}
                      <div className="task-dates">
                        <div><strong>Created:</strong> {formatDate(task.createdAt)}</div>
                        <div><strong>Updated:</strong> {formatDate(task.updatedAt)}</div>
                      </div>
                    </div>
                    {
                    user?.role === "admin" && (<div className="task-actions">
                      <button 
                        onClick={() => handleEditTask(task)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteTask(task._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>)
                    }
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskFormPage
          task={editingTask}
          users={users}
          onSave={handleTaskSave}
          onCancel={handleTaskCancel}
        />
      )}
    </div>
  )
}

export default TasksPage