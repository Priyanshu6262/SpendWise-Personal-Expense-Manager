const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const userExists = await User.findOne({ where: { email: normalizedEmail } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    if (user) {
      logger.info('User registered successfully', { action: 'user_register', userId: user.id, email: user.email });
      res.status(201).json({
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    logger.error('Register Error', { error: error.message });
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for user email
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (user && (await user.matchPassword(password))) {
      logger.info('User logged in successfully', { action: 'user_login', userId: user.id, email: user.email });
      res.json({
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    logger.error('Login Error', { error: error.message });
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findByPk(userId);

    if (user) {
      if (req.body.name) {
        user.name = req.body.name.trim();
      }

      if (req.body.email) {
        const newEmail = req.body.email.trim().toLowerCase();
        if (newEmail !== user.email) {
          const existingUser = await User.findOne({ where: { email: newEmail } });
          if (existingUser && existingUser.id !== user.id) {
            return res.status(400).json({ message: 'Email already in use' });
          }
          user.email = newEmail;
        }
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      await user.save();
      logger.info('User profile updated', { action: 'user_update_profile', userId: user.id });

      res.json({
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    logger.error('Update Profile Error', { error: error.message });
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
};
