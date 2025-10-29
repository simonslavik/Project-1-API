import { useState, useEffect } from 'react'
import './TaskFormPage.css'

function TaskFormPage({ task, onSave, onCancel, users = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    assignedTo: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = Boolean(task)



  // Initialize form data when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        assignedTo: task.assignedTo?._id || task.assignedTo || ''
      })
    }
  }, [task])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = isEditing 
        ? `http://localhost:3000/api/tasks/${task._id}`
        : 'http://localhost:3000/api/tasks/'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      // Prepare payload - don't send empty assignedTo
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        ...(formData.assignedTo && { assignedTo: formData.assignedTo })
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        onSave(data.task)
      } else {
        setError(data.message || `Failed to ${isEditing ? 'update' : 'create'} task`)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <div className="task-form-container">
      <div className="task-form-card">
        <div className="task-form-header">
          <h1>{isEditing ? 'Update Task' : 'Create New Task'}</h1>
          <button onClick={handleCancel} className="close-btn">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter task title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description (optional)"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assign To</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleInputChange}
            >
              <option value="">-- No assignment --</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !formData.title.trim()}
              className="submit-btn"
            >
              {loading 
                ? 'Please wait...' 
                : (isEditing ? 'Update Task' : 'Create Task')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskFormPage