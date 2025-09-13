// Database initialization script
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import { URL } from 'url';

// Models (import from relative path)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelsPath = path.join(__dirname, '..', 'src', 'models');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Define sample data
const sampleUsers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    password: 'Password123',
    age: 35,
    location: 'Mumbai',
    salary: 85000,
    additionalIncome: 15000,
    fixedExpenses: 30000,
    variableExpenses: 20000,
    riskTolerance: 'medium',
    emergencyFund: 250000,
    savingsGoal: 1000000,
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'Password123',
    age: 28,
    location: 'Bangalore',
    salary: 65000,
    additionalIncome: 8000,
    fixedExpenses: 25000,
    variableExpenses: 15000,
    riskTolerance: 'high',
    emergencyFund: 150000,
    savingsGoal: 800000,
  },
  {
    name: 'Anand Verma',
    email: 'anand@example.com',
    password: 'Password123',
    age: 42,
    location: 'Delhi',
    salary: 120000,
    additionalIncome: 25000,
    fixedExpenses: 45000,
    variableExpenses: 30000,
    riskTolerance: 'low',
    emergencyFund: 500000,
    savingsGoal: 2000000,
  }
];

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MongoDB connection string is missing');
    }
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Now that we're connected, we can import the models
    // Use file:// protocol for Windows paths
    const userModulePath = new URL(`file://${path.resolve(modelsPath, 'User.js')}`).href;
    const portfolioModulePath = new URL(`file://${path.resolve(modelsPath, 'Portfolio.js')}`).href;
    const transactionModulePath = new URL(`file://${path.resolve(modelsPath, 'Transaction.js')}`).href;
    const stockPrefModulePath = new URL(`file://${path.resolve(modelsPath, 'StockPreference.js')}`).href;
    
    const User = (await import(userModulePath)).default;
    const Portfolio = (await import(portfolioModulePath)).default;
    const Transaction = (await import(transactionModulePath)).default;
    const StockPreference = (await import(stockPrefModulePath)).default;
    
    return { User, Portfolio, Transaction, StockPreference };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Seed database with sample data
async function seedDatabase() {
  try {
    // Connect and get models
    const { User, Portfolio, Transaction, StockPreference } = await connectToDatabase();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Portfolio.deleteMany({});
    await Transaction.deleteMany({});
    await StockPreference.deleteMany({});
    
    // Create users with hashed passwords
    console.log('Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.name} (${user.email})`);
    }
    
    // Create portfolios for each user
    console.log('\nCreating sample portfolios...');
    
    for (const user of createdUsers) {
      let investments = [];
      
      if (user.riskTolerance === 'low') {
        investments = [
          {
            name: 'Fixed Deposits',
            symbol: 'FD',
            category: 'Fixed Deposits',
            allocation: 0.40,
            amount: user.investableAmount * 0.40,
            expectedReturns: '5-6% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Government Bonds',
            symbol: 'GOVTBOND',
            category: 'Bonds',
            allocation: 0.30,
            amount: user.investableAmount * 0.30,
            expectedReturns: '6-7% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Blue Chip Stocks',
            symbol: 'NIFTY50',
            category: 'Stocks',
            allocation: 0.15,
            amount: user.investableAmount * 0.15,
            expectedReturns: '8-10% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Debt Mutual Funds',
            symbol: 'DEBT',
            category: 'Mutual Funds',
            allocation: 0.15,
            amount: user.investableAmount * 0.15,
            expectedReturns: '7-8% p.a.',
            purchaseDate: new Date(),
          },
        ];
      } else if (user.riskTolerance === 'medium') {
        investments = [
          {
            name: 'Index Funds',
            symbol: 'NIFTYBEES',
            category: 'Mutual Funds',
            allocation: 0.30,
            amount: user.investableAmount * 0.30,
            expectedReturns: '10-12% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Blue Chip Stocks',
            symbol: 'HDFCBANK',
            category: 'Stocks',
            allocation: 0.25,
            amount: user.investableAmount * 0.25,
            expectedReturns: '8-10% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Corporate Bonds',
            symbol: 'CORPBOND',
            category: 'Bonds',
            allocation: 0.20,
            amount: user.investableAmount * 0.20,
            expectedReturns: '7-8% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Fixed Deposits',
            symbol: 'FD',
            category: 'Fixed Deposits',
            allocation: 0.15,
            amount: user.investableAmount * 0.15,
            expectedReturns: '5-6% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Gold ETF',
            symbol: 'GOLDBEES',
            category: 'ETFs',
            allocation: 0.10,
            amount: user.investableAmount * 0.10,
            expectedReturns: '8-10% p.a.',
            purchaseDate: new Date(),
          },
        ];
      } else {
        // High risk
        investments = [
          {
            name: 'Growth Stocks',
            symbol: 'INFY',
            category: 'Stocks',
            allocation: 0.40,
            amount: user.investableAmount * 0.40,
            expectedReturns: '12-15% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Small Cap Funds',
            symbol: 'SMALLCAP',
            category: 'Mutual Funds',
            allocation: 0.20,
            amount: user.investableAmount * 0.20,
            expectedReturns: '12-14% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Sectoral ETFs',
            symbol: 'BANKETF',
            category: 'ETFs',
            allocation: 0.20,
            amount: user.investableAmount * 0.20,
            expectedReturns: '10-12% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Corporate Bonds',
            symbol: 'CORPBOND',
            category: 'Bonds',
            allocation: 0.10,
            amount: user.investableAmount * 0.10,
            expectedReturns: '7-8% p.a.',
            purchaseDate: new Date(),
          },
          {
            name: 'Cryptocurrency',
            symbol: 'BTC',
            category: 'Cryptocurrency',
            allocation: 0.10,
            amount: user.investableAmount * 0.10,
            expectedReturns: '15-25% p.a.',
            purchaseDate: new Date(),
          },
        ];
      }
      
      const portfolio = new Portfolio({
        user: user._id,
        investments,
        riskProfile: user.riskTolerance,
        expectedReturns: user.riskTolerance === 'low' ? '6-7% p.a.' : 
                        user.riskTolerance === 'medium' ? '8-10% p.a.' : '10-15% p.a.',
      });
      
      await portfolio.save();
      console.log(`Created portfolio for ${user.name} with ${investments.length} investments`);
      
      // Create some sample transactions
      const transactionTypes = ['buy', 'sell', 'dividend', 'deposit', 'withdrawal'];
      const categories = ['Stocks', 'Mutual Funds', 'ETFs', 'Bonds', 'Fixed Deposits'];
      
      console.log(`Creating sample transactions for ${user.name}...`);
      
      for (let i = 0; i < 10; i++) {
        const randomType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomAmount = Math.floor(Math.random() * 10000) + 1000;
        
        const transaction = new Transaction({
          user: user._id,
          type: randomType,
          investment: `Sample ${randomCategory}`,
          symbol: `SMPL${i}`,
          amount: randomAmount,
          quantity: randomType === 'buy' || randomType === 'sell' ? Math.floor(Math.random() * 20) + 1 : undefined,
          price: randomType === 'buy' || randomType === 'sell' ? Math.floor(Math.random() * 1000) + 100 : undefined,
          date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          status: 'completed',
          category: randomCategory,
          notes: `Sample ${randomType} transaction`,
        });
        
        await transaction.save();
      }
      
      // Create some stock preferences
      const stocks = [
        { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy' },
        { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking' },
        { symbol: 'INFY', name: 'Infosys', sector: 'Technology' },
        { symbol: 'ITC', name: 'ITC Limited', sector: 'Consumer Goods' },
      ];
      
      console.log(`Creating stock preferences for ${user.name}...`);
      
      for (const stock of stocks) {
        const stockPref = new StockPreference({
          user: user._id,
          symbol: stock.symbol,
          name: stock.name,
          watchlist: Math.random() > 0.3, // 70% chance of being in watchlist
          sector: stock.sector,
          industry: stock.sector,
          lastPrice: Math.floor(Math.random() * 2000) + 500,
          lastPriceUpdate: new Date(),
        });
        
        // Add a random price alert
        if (Math.random() > 0.5) {
          stockPref.priceAlerts.push({
            type: Math.random() > 0.5 ? 'above' : 'below',
            value: stockPref.lastPrice * (Math.random() > 0.5 ? 1.1 : 0.9),
            triggered: false,
          });
        }
        
        await stockPref.save();
      }
    }
    
    console.log('\nDatabase seeded successfully!');
    console.log('\nSample user credentials:');
    sampleUsers.forEach(user => {
      console.log(`Email: ${user.email}, Password: ${user.password}`);
    });
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
