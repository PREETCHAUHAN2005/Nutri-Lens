/**
 * Authentication Controller
 * 
 * Handles user registration, login, and profile management.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      // Create new user
      const user = await User.create({
        email,
        password, // Will be hashed by pre-save hook
        name
      });
      
      // Generate JWT token
      const token = this._generateToken(user._id);
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: user.getPublicProfile(),
          token
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      // Find user with password field (normally excluded)
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Check password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Generate token
      const token = this._generateToken(user._id);
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.getPublicProfile(),
          token
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: user.getPublicProfile()
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update user preferences
   * PUT /api/v1/auth/preferences
   */
  async updatePreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const { preferences } = req.body;
      
      const user = await User.findByIdAndUpdate(
        userId,
        { preferences },
        { new: true, runValidators: true }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: user.getPublicProfile()
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Generate JWT token
   * @private
   */
  _generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }
}

module.exports = new AuthController();