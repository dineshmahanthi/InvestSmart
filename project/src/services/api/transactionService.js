import Transaction from '../models/Transaction.js';
import { connectToDatabase } from '../utils/database.js';

/**
 * Add a new transaction
 * @param {string} userId - User ID
 * @param {Object} transactionData - Transaction data
 * @returns {Object} - Created transaction
 */
export const addTransaction = async (userId, transactionData) => {
  try {
    await connectToDatabase();
    
    const transaction = await Transaction.create({
      user: userId,
      ...transactionData,
    });
    
    return transaction;
  } catch (error) {
    console.error('Error in addTransaction:', error);
    throw error;
  }
};

/**
 * Get all user transactions with optional filtering
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Array} - Array of transactions
 */
export const getUserTransactions = async (userId, filters = {}) => {
  try {
    await connectToDatabase();
    
    // Build query
    const query = { user: userId };
    
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    } else if (filters.startDate) {
      query.date = { $gte: new Date(filters.startDate) };
    } else if (filters.endDate) {
      query.date = { $lte: new Date(filters.endDate) };
    }
    
    if (filters.investment) {
      query.investment = filters.investment;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Set up pagination
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Execute query
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination info
    const total = await Transaction.countDocuments(query);
    
    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error in getUserTransactions:', error);
    throw error;
  }
};

/**
 * Get transaction by ID
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @returns {Object} - Transaction object
 */
export const getTransactionById = async (userId, transactionId) => {
  try {
    await connectToDatabase();
    
    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: userId,
    });
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    return transaction;
  } catch (error) {
    console.error('Error in getTransactionById:', error);
    throw error;
  }
};

/**
 * Update transaction
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated transaction
 */
export const updateTransaction = async (userId, transactionId, updateData) => {
  try {
    await connectToDatabase();
    
    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: transactionId,
        user: userId,
      },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    return transaction;
  } catch (error) {
    console.error('Error in updateTransaction:', error);
    throw error;
  }
};

/**
 * Delete transaction
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @returns {Object} - Deleted transaction
 */
export const deleteTransaction = async (userId, transactionId) => {
  try {
    await connectToDatabase();
    
    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      user: userId,
    });
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    return transaction;
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    throw error;
  }
};

/**
 * Get transaction statistics
 * @param {string} userId - User ID
 * @returns {Object} - Transaction statistics
 */
export const getTransactionStats = async (userId) => {
  try {
    await connectToDatabase();
    
    // Get stats by transaction type
    const statsByType = await Transaction.getTransactionStats(userId);
    
    // Get monthly transactions for the current year
    const currentYear = new Date().getFullYear();
    const monthlyTransactions = await Transaction.getMonthlyTransactions(userId, currentYear);
    
    return {
      statsByType,
      monthlyTransactions,
    };
  } catch (error) {
    console.error('Error in getTransactionStats:', error);
    throw error;
  }
};

export default {
  addTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
};
