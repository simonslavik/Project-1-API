import { useState } from 'react'
import './App.css'
import TasksPage from '../TasksPage/TasksPage'

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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
    setMessage('')
    setError('')

    try {
      const url = isLogin 
        ? 'http://localhost:3000/api/auth/login'
        : 'http://localhost:3000/api/auth/register'
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setError('')
        
        if (isLogin) {
          // Login successful - redirect to tasks page
          setUser(data.user)
          setIsLoggedIn(true)
        } else {
          // Registration successful - clear form
          setFormData({
            username: '',
            email: '',
            password: '',
            role: 'user'
          })
        }
      } else {
        setError(data.message || 'Something went wrong')
        setMessage('')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setMessage('')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setMessage('')
    setError('')
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user'
    })
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()
      
      if (data.success) {
        setIsLoggedIn(false)
        setUser(null)
        setMessage('Logged out successfully')
      }
    } catch (err) {
      console.error('Logout error:', err)
      // Even if logout request fails, clear local state
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  // If user is logged in, show tasks page
  if (isLoggedIn && user) {
    return <TasksPage user={user} onLogout={handleLogout} />
  }

  // Otherwise, show login/register form
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isLogin ? 'Login' : 'Register'}</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Enter your username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="toggle-mode">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={toggleMode}
              className="toggle-btn"
            >
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
