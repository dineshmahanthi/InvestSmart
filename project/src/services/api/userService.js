import User from '../models/User.js';
import { connectToDatabase } from '../utils/database.js';
import jwt from 'jsonwebtoken';

// Secret key for JWT (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'investsmart-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} - User object and token
 */
export const registerUser = async (userData) => {
  try {
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const user = await User.create(userData);
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return { user: userResponse, token };
  } catch (error) {
    console.error('Error in registerUser:', error);
    throw error;
  }
};

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - User object and token
 */
export const loginUser = async (email, password) => {
  try {
    await connectToDatabase();
    
    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return { user: userResponse, token };
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error;
  }
};

/**
 * Get current user profile
 * @param {string} userId - User ID
 * @returns {Object} - User profile
 */
export const getUserProfile = async (userId) => {
  try {
    await connectToDatabase();
    
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  try {
    await connectToDatabase();
    
    // Don't allow updates to email or password through this function
    const allowedUpdates = {
      name: updateData.name,
      age: updateData.age,
      location: updateData.location,
      salary: updateData.salary,
      additionalIncome: updateData.additionalIncome,
      fixedExpenses: updateData.fixedExpenses,
      variableExpenses: updateData.variableExpenses,
      riskTolerance: updateData.riskTolerance,
      emergencyFund: updateData.emergencyFund,
      savingsGoal: updateData.savingsGoal,
    };
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    );
    
    const user = await User.findByIdAndUpdate(
      userId, 
      filteredUpdates, 
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
