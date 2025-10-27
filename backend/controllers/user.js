
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");



const registerUser = async (req, res) => {
  console.log('=== USER REGISTRATION ATTEMPT ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('IP:', req.ip || req.connection.remoteAddress);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Request Body Keys:', Object.keys(req.body));
  console.log('=================================');

  try {
    const { username, email, password, role } = req.body;

    // Detailed validation with specific missing fields
    const missingFields = [];
    if (!username) missingFields.push('username');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!role) missingFields.push('role');

    if (missingFields.length > 0) {
      console.warn('Validation failed - missing fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: {
          type: 'ValidationError',
          missingFields: missingFields,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Additional validation
    if (typeof username !== 'string' || username.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Username must be a string with at least 2 characters",
        error: { type: 'ValidationError', field: 'username', timestamp: new Date().toISOString() }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
        error: { type: 'ValidationError', field: 'email', timestamp: new Date().toISOString() }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
        error: { type: 'ValidationError', field: 'password', timestamp: new Date().toISOString() }
      });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'user' or 'admin'",
        error: { type: 'ValidationError', field: 'role', allowedValues: ['user', 'admin'], timestamp: new Date().toISOString() }
      });
    }

    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      email,
      password: hashPassword,
      role,
    });

    await newUser.save();
    
    console.log('=== REGISTRATION SUCCESS ===');
    console.log('User ID:', newUser._id);
    console.log('Username:', newUser.username);
    console.log('Email:', newUser.email);
    console.log('Role:', newUser.role);
    console.log('Timestamp:', new Date().toISOString());
    console.log('============================');
    
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error Type:', e.constructor.name);
    console.error('Error Message:', e.message);
    console.error('Error Code:', e.code || 'No code');
    console.error('Stack Trace:', e.stack);
    console.error('Request Body:', req.body);
    console.error('Timestamp:', new Date().toISOString());
    console.error('========================');

    let errorMessage = "Registration failed";
    let statusCode = 500;

    // Handle specific error types
    if (e.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = "Validation error: " + Object.values(e.errors).map(err => err.message).join(', ');
    } else if (e.code === 11000) {
      statusCode = 409;
      const field = Object.keys(e.keyPattern)[0];
      errorMessage = `User with this ${field} already exists`;
    } else if (e.name === 'CastError') {
      statusCode = 400;
      errorMessage = "Invalid data format provided";
    } else if (e.message.includes('buffering timed out')) {
      statusCode = 503;
      errorMessage = "Database connection timeout - please try again";
    } else if (e.message.includes('ENOTFOUND') || e.message.includes('ECONNREFUSED')) {
      statusCode = 503;
      errorMessage = "Database connection failed - server temporarily unavailable";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: {
        type: e.constructor.name,
        code: e.code || null,
        timestamp: new Date().toISOString()
      },
      ...(process.env.NODE_ENV === 'development' && { 
        debug: {
          originalMessage: e.message,
          stack: e.stack
        }
      })
    });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};




const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude password field
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching users' });
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        const user = await User.findById(id, '-password'); // Exclude password field

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching user' });
    }
};

module.exports = {
    registerUser, loginUser, logoutUser, authMiddleware, getAllUsers, getUser
};