import mongoose from 'mongoose';

// Define schema for transactions
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['buy', 'sell', 'dividend', 'deposit', 'withdrawal', 'fee', 'other'],
    },
    investment: {
      type: String,
      required: [true, 'Investment name is required'],
      trim: true,
    },
    symbol: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed',
    },
    notes: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Stocks', 'Mutual Funds', 'ETFs', 'Bonds', 'Fixed Deposits', 'Gold', 'Real Estate', 'Cryptocurrency', 'Others'],
      required: [true, 'Transaction category is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create compound index for faster queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });

// Method to calculate total value of transaction
transactionSchema.methods.getTotalValue = function() {
  if (this.quantity && this.price) {
    return this.quantity * this.price;
  }
  return this.amount;
};

// Static method to calculate total transactions by type for a user
transactionSchema.statics.getTransactionStats = async function(userId) {
  return await this.aggregate([
    { 
      $match: { user: new mongoose.Types.ObjectId(userId) } 
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
  ]);
};

// Static method to get monthly transaction totals
transactionSchema.statics.getMonthlyTransactions = async function(userId, year) {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year + 1}-01-01`);
  
  return await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$date' }, type: '$type' },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.month': 1 },
    },
  ]);
};

// Create the model from the schema
const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
