require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./mongodb/connection');
const authRoutes = require('./routes/auth/routes');
const taskRoutes = require('./routes/tasks/routes');
const cors = require('cors');

const app = express();

// CORS configuration - adjust origin based on your frontend
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:8080"], // Common frontend ports
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Global error handler for other errors
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Something went wrong on the server' 
    });
});

app.listen(process.env.PORT || 3000, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});