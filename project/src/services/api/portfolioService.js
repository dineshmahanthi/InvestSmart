import Portfolio from '../models/Portfolio.js';
import { connectToDatabase } from '../utils/database.js';

/**
 * Create or update a user's portfolio
 * @param {string} userId - User ID
 * @param {Object} portfolioData - Portfolio data
 * @returns {Object} - Updated portfolio
 */
export const updateUserPortfolio = async (userId, portfolioData) => {
  try {
    await connectToDatabase();
    
    // Find existing portfolio or create new one
    let portfolio = await Portfolio.findOne({ user: userId });
    
    if (!portfolio) {
      // Create a new portfolio
      portfolio = new Portfolio({
        user: userId,
        investments: portfolioData.investments || [],
        riskProfile: portfolioData.riskProfile || 'medium',
      });
    } else {
      // Update existing portfolio
      if (portfolioData.investments) {
        portfolio.investments = portfolioData.investments;
      }
      
      if (portfolioData.riskProfile) {
        portfolio.riskProfile = portfolioData.riskProfile;
      }
      
      portfolio.lastRebalanced = Date.now();
    }
    
    await portfolio.save();
    return portfolio;
  } catch (error) {
    console.error('Error in updateUserPortfolio:', error);
    throw error;
  }
};

/**
 * Get user portfolio
 * @param {string} userId - User ID
 * @returns {Object} - User portfolio
 */
export const getUserPortfolio = async (userId) => {
  try {
    await connectToDatabase();
    
    const portfolio = await Portfolio.findOne({ user: userId });
    
    if (!portfolio) {
      // Return an empty portfolio structure if none exists
      return {
        user: userId,
        investments: [],
        totalAmount: 0,
        expectedReturns: '0%',
        riskProfile: 'medium',
      };
    }
    
    return portfolio;
  } catch (error) {
    console.error('Error in getUserPortfolio:', error);
    throw error;
  }
};

/**
 * Add an investment to user portfolio
 * @param {string} userId - User ID
 * @param {Object} investmentData - Investment data
 * @returns {Object} - Updated portfolio
 */
export const addInvestment = async (userId, investmentData) => {
  try {
    await connectToDatabase();
    
    let portfolio = await Portfolio.findOne({ user: userId });
    
    if (!portfolio) {
      portfolio = new Portfolio({
        user: userId,
        investments: [investmentData],
        riskProfile: 'medium',
      });
    } else {
      // Add new investment
      portfolio.investments.push(investmentData);
      
      // Recalculate allocation percentages if needed
      if (investmentData.adjustAllocation) {
        const totalExcludingNew = portfolio.totalAmount;
        const newTotal = totalExcludingNew + investmentData.amount;
        
        // Adjust allocations for all investments
        portfolio.investments = portfolio.investments.map(investment => {
          if (investment === portfolio.investments[portfolio.investments.length - 1]) {
            // This is the newly added investment
            investment.allocation = (investment.amount / newTotal) * 100;
          } else {
            // Adjust existing investments
            investment.allocation = (investment.amount / newTotal) * 100;
          }
          return investment;
        });
      }
      
      portfolio.lastRebalanced = Date.now();
    }
    
    await portfolio.save();
    return portfolio;
  } catch (error) {
    console.error('Error in addInvestment:', error);
    throw error;
  }
};

/**
 * Update an investment in user portfolio
 * @param {string} userId - User ID
 * @param {string} investmentId - Investment ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated portfolio
 */
export const updateInvestment = async (userId, investmentId, updateData) => {
  try {
    await connectToDatabase();
    
    const portfolio = await Portfolio.findOne({ user: userId });
    
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }
    
    // Find the investment
    const investmentIndex = portfolio.investments.findIndex(
      inv => inv._id.toString() === investmentId
    );
    
    if (investmentIndex === -1) {
      throw new Error('Investment not found');
    }
    
    // Update investment fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'user') {
        portfolio.investments[investmentIndex][key] = updateData[key];
      }
    });
    
    // Recalculate portfolio totals
    portfolio.lastRebalanced = Date.now();
    
    await portfolio.save();
    return portfolio;
  } catch (error) {
    console.error('Error in updateInvestment:', error);
    throw error;
  }
};

/**
 * Remove an investment from user portfolio
 * @param {string} userId - User ID
 * @param {string} investmentId - Investment ID
 * @returns {Object} - Updated portfolio
 */
export const removeInvestment = async (userId, investmentId) => {
  try {
    await connectToDatabase();
    
    const portfolio = await Portfolio.findOne({ user: userId });
    
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }
    
    // Remove the investment
    portfolio.investments = portfolio.investments.filter(
      inv => inv._id.toString() !== investmentId
    );
    
    // Recalculate portfolio totals
    portfolio.lastRebalanced = Date.now();
    
    await portfolio.save();
    return portfolio;
  } catch (error) {
    console.error('Error in removeInvestment:', error);
    throw error;
  }
};

/**
 * Generate portfolio recommendations based on user profile
 * @param {Object} user - User profile
 * @returns {Object} - Portfolio recommendations
 */
export const generateRecommendations = async (user) => {
  try {
    await connectToDatabase();
    
    // Default recommendations based on risk tolerance
    let recommendations = {
      investments: [],
      totalAmount: user.investableAmount,
      expectedReturns: '0%',
      riskProfile: user.riskTolerance,
    };
    
    // Calculate investments based on risk profile
    if (user.riskTolerance === 'low') {
      recommendations.investments = [
        {
          name: 'Fixed Deposits',
          category: 'Fixed Deposits',
          allocation: 0.40,
          amount: user.investableAmount * 0.40,
          expectedReturns: '5-6% p.a.',
        },
        {
          name: 'Government Bonds',
          category: 'Bonds',
          allocation: 0.30,
          amount: user.investableAmount * 0.30,
          expectedReturns: '6-7% p.a.',
        },
        {
          name: 'Blue Chip Stocks',
          category: 'Stocks',
          allocation: 0.15,
          amount: user.investableAmount * 0.15,
          expectedReturns: '8-10% p.a.',
        },
        {
          name: 'Debt Mutual Funds',
          category: 'Mutual Funds',
          allocation: 0.15,
          amount: user.investableAmount * 0.15,
          expectedReturns: '7-8% p.a.',
        },
      ];
      recommendations.expectedReturns = '6-7% p.a.';
    } else if (user.riskTolerance === 'medium') {
      recommendations.investments = [
        {
          name: 'Index Funds',
          category: 'Mutual Funds',
          allocation: 0.30,
          amount: user.investableAmount * 0.30,
          expectedReturns: '10-12% p.a.',
        },
        {
          name: 'Blue Chip Stocks',
          category: 'Stocks',
          allocation: 0.25,
          amount: user.investableAmount * 0.25,
          expectedReturns: '8-10% p.a.',
        },
        {
          name: 'Corporate Bonds',
          category: 'Bonds',
          allocation: 0.20,
          amount: user.investableAmount * 0.20,
          expectedReturns: '7-8% p.a.',
        },
        {
          name: 'Fixed Deposits',
          category: 'Fixed Deposits',
          allocation: 0.15,
          amount: user.investableAmount * 0.15,
          expectedReturns: '5-6% p.a.',
        },
        {
          name: 'Gold ETF',
          category: 'ETFs',
          allocation: 0.10,
          amount: user.investableAmount * 0.10,
          expectedReturns: '8-10% p.a.',
        },
      ];
      recommendations.expectedReturns = '8-10% p.a.';
    } else {
      // High risk
      recommendations.investments = [
        {
          name: 'Growth Stocks',
          category: 'Stocks',
          allocation: 0.40,
          amount: user.investableAmount * 0.40,
          expectedReturns: '12-15% p.a.',
        },
        {
          name: 'Small Cap Funds',
          category: 'Mutual Funds',
          allocation: 0.20,
          amount: user.investableAmount * 0.20,
          expectedReturns: '12-14% p.a.',
        },
        {
          name: 'Sectoral ETFs',
          category: 'ETFs',
          allocation: 0.20,
          amount: user.investableAmount * 0.20,
          expectedReturns: '10-12% p.a.',
        },
        {
          name: 'Corporate Bonds',
          category: 'Bonds',
          allocation: 0.10,
          amount: user.investableAmount * 0.10,
          expectedReturns: '7-8% p.a.',
        },
        {
          name: 'Cryptocurrency',
          category: 'Cryptocurrency',
          allocation: 0.10,
          amount: user.investableAmount * 0.10,
          expectedReturns: '15-25% p.a.',
        },
      ];
      recommendations.expectedReturns = '10-15% p.a.';
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error in generateRecommendations:', error);
    throw error;
  }
};

export default {
  updateUserPortfolio,
  getUserPortfolio,
  addInvestment,
  updateInvestment,
  removeInvestment,
  generateRecommendations,
};
