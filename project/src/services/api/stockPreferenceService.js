import StockPreference from '../models/StockPreference.js';
import { connectToDatabase } from '../utils/database.js';

/**
 * Add or update stock to user's preferences
 * @param {string} userId - User ID
 * @param {Object} stockData - Stock data
 * @returns {Object} - Stock preference
 */
export const addStockPreference = async (userId, stockData) => {
  try {
    await connectToDatabase();
    
    // Check if stock already exists in user preferences
    const existingStock = await StockPreference.findOne({
      user: userId,
      symbol: stockData.symbol,
    });
    
    if (existingStock) {
      // Update existing stock preference
      Object.keys(stockData).forEach(key => {
        if (key !== 'user' && key !== 'symbol' && stockData[key] !== undefined) {
          existingStock[key] = stockData[key];
        }
      });
      
      // Add price alerts if provided
      if (stockData.priceAlert) {
        existingStock.priceAlerts.push(stockData.priceAlert);
      }
      
      await existingStock.save();
      return existingStock;
    } else {
      // Create new stock preference
      const stockPreference = await StockPreference.create({
        user: userId,
        ...stockData,
        priceAlerts: stockData.priceAlert ? [stockData.priceAlert] : [],
      });
      
      return stockPreference;
    }
  } catch (error) {
    console.error('Error in addStockPreference:', error);
    throw error;
  }
};

/**
 * Get all stock preferences for a user
 * @param {string} userId - User ID
 * @param {boolean} watchlistOnly - Filter by watchlist only
 * @returns {Array} - Stock preferences
 */
export const getUserStockPreferences = async (userId, watchlistOnly = false) => {
  try {
    await connectToDatabase();
    
    const query = { user: userId };
    
    if (watchlistOnly) {
      query.watchlist = true;
    }
    
    const stockPreferences = await StockPreference.find(query);
    
    return stockPreferences;
  } catch (error) {
    console.error('Error in getUserStockPreferences:', error);
    throw error;
  }
};

/**
 * Remove stock from user's preferences
 * @param {string} userId - User ID
 * @param {string} symbol - Stock symbol
 * @returns {Object} - Result of operation
 */
export const removeStockPreference = async (userId, symbol) => {
  try {
    await connectToDatabase();
    
    const result = await StockPreference.findOneAndDelete({
      user: userId,
      symbol,
    });
    
    if (!result) {
      throw new Error('Stock preference not found');
    }
    
    return { success: true, message: 'Stock removed from preferences' };
  } catch (error) {
    console.error('Error in removeStockPreference:', error);
    throw error;
  }
};

/**
 * Toggle stock in watchlist
 * @param {string} userId - User ID
 * @param {string} symbol - Stock symbol
 * @returns {Object} - Updated stock preference
 */
export const toggleWatchlist = async (userId, symbol) => {
  try {
    await connectToDatabase();
    
    const stockPreference = await StockPreference.findOne({
      user: userId,
      symbol,
    });
    
    if (!stockPreference) {
      throw new Error('Stock preference not found');
    }
    
    // Toggle watchlist status
    stockPreference.watchlist = !stockPreference.watchlist;
    await stockPreference.save();
    
    return stockPreference;
  } catch (error) {
    console.error('Error in toggleWatchlist:', error);
    throw error;
  }
};

/**
 * Add price alert for stock
 * @param {string} userId - User ID
 * @param {string} symbol - Stock symbol
 * @param {Object} alertData - Alert data
 * @returns {Object} - Updated stock preference
 */
export const addPriceAlert = async (userId, symbol, alertData) => {
  try {
    await connectToDatabase();
    
    const stockPreference = await StockPreference.findOne({
      user: userId,
      symbol,
    });
    
    if (!stockPreference) {
      throw new Error('Stock preference not found');
    }
    
    // Add price alert
    stockPreference.priceAlerts.push({
      type: alertData.type,
      value: alertData.value,
    });
    
    await stockPreference.save();
    
    return stockPreference;
  } catch (error) {
    console.error('Error in addPriceAlert:', error);
    throw error;
  }
};

/**
 * Remove price alert for stock
 * @param {string} userId - User ID
 * @param {string} symbol - Stock symbol
 * @param {string} alertId - Alert ID
 * @returns {Object} - Updated stock preference
 */
export const removePriceAlert = async (userId, symbol, alertId) => {
  try {
    await connectToDatabase();
    
    const stockPreference = await StockPreference.findOne({
      user: userId,
      symbol,
    });
    
    if (!stockPreference) {
      throw new Error('Stock preference not found');
    }
    
    // Remove price alert
    stockPreference.priceAlerts = stockPreference.priceAlerts.filter(
      alert => alert._id.toString() !== alertId
    );
    
    await stockPreference.save();
    
    return stockPreference;
  } catch (error) {
    console.error('Error in removePriceAlert:', error);
    throw error;
  }
};

/**
 * Update stock prices and check for alerts
 * @param {Array} stocksData - Array of stock data with symbols and prices
 * @returns {Array} - Triggered alerts
 */
export const updateStockPrices = async (stocksData) => {
  try {
    await connectToDatabase();
    
    const triggeredAlerts = [];
    
    for (const stockData of stocksData) {
      const { symbol, price } = stockData;
      
      // Find all user preferences for this stock
      const stockPreferences = await StockPreference.find({ symbol });
      
      for (const pref of stockPreferences) {
        // Check for triggered alerts
        const alerts = pref.checkAlerts(price);
        
        if (alerts.length > 0) {
          triggeredAlerts.push(...alerts);
        }
        
        // Save the updated stock preference with new price
        pref.lastPrice = price;
        pref.lastPriceUpdate = new Date();
        await pref.save();
      }
    }
    
    return triggeredAlerts;
  } catch (error) {
    console.error('Error in updateStockPrices:', error);
    throw error;
  }
};

export default {
  addStockPreference,
  getUserStockPreferences,
  removeStockPreference,
  toggleWatchlist,
  addPriceAlert,
  removePriceAlert,
  updateStockPrices,
};
