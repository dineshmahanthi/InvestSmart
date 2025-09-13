import mongoose from 'mongoose';

// Define schema for individual investments
const investmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Investment name is required'],
    trim: true,
  },
  symbol: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Investment category is required'],
    enum: ['Stocks', 'Mutual Funds', 'ETFs', 'Bonds', 'Fixed Deposits', 'Gold', 'Real Estate', 'Cryptocurrency', 'Others'],
  },
  allocation: {
    type: Number,
    required: [true, 'Allocation percentage is required'],
    min: [0, 'Allocation cannot be negative'],
    max: [100, 'Allocation cannot exceed 100%'],
  },
  amount: {
    type: Number,
    required: [true, 'Investment amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  expectedReturns: {
    type: String,
    required: [true, 'Expected returns are required'],
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
});

// Define schema for portfolio
const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Portfolio must belong to a user'],
    },
    investments: [investmentSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    expectedReturns: {
      type: String,
      default: '0%',
    },
    riskProfile: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    lastRebalanced: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware: Calculate portfolio stats before saving
portfolioSchema.pre('save', function(next) {
  // Calculate total amount
  this.totalAmount = this.investments.reduce((total, investment) => {
    return total + investment.amount;
  }, 0);
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  next();
});

// Static method to get average portfolio size
portfolioSchema.statics.getAveragePortfolioSize = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        averageSize: { $avg: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  return stats.length > 0 ? stats[0] : { averageSize: 0, count: 0 };
};

// Create the model from the schema
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
