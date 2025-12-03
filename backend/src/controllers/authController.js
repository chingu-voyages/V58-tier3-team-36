const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.googleAuth = async (req, res) => {
  try {
    const { email, name, image, googleId } = req.body;

    // Validate required fields
    if (!email || !name || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, name, and googleId are required',
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        email,
        name,
        image,
        googleId,
      });
      await user.save();
      console.log('✅ New user created:', email);
    } else {
      // Update existing user - verify googleId matches
      if (user.googleId && user.googleId !== googleId) {
        return res.status(400).json({
          success: false,
          message: 'Google ID mismatch for existing user',
        });
      }
      
      user.name = name;
      user.image = image;
      if (!user.googleId) {
        user.googleId = googleId;
      }
      await user.save();
      console.log('User updated:', email);
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.register = async (req, res) => {
  // Registration logic here
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, name, and password are required',
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      });
    }

    let user = await User.findOne({
      email,
    });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      email,
      name,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  }
  catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.login = async (req, res) => {
  // Login logic here
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email and password are required',
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    // Check if user has a password set (i.e., not an OAuth-only account)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was registered via Google. Please log in with Google.',
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'THE_SECRET_KEY',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};