import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../src/utils/database.js';
import User from '../src/models/User.js';
import Portfolio from '../src/models/Portfolio.js';
import Transaction from '../src/models/Transaction.js';
import StockPreference from '../src/models/StockPreference.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'investsmart-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add a pre-flight route handler for all OPTIONS requests
app.options('*', cors());

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Basic API test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API server is running correctly',
    timestamp: new Date().toISOString()
  });
});

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// API routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      age,
      location,
      salary,
      fixedExpenses,
      variableExpenses,
      riskTolerance,
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !age || !salary || !fixedExpenses || !variableExpenses) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      age,
      location,
      salary,
      fixedExpenses,
      variableExpenses,
      riskTolerance: riskTolerance || 'medium',
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user by email
    console.log('Looking up user by email:', email);
    let user;
    
    try {
      user = await User.findOne({ email }).select('+password');
      console.log('User query result:', user ? 'User found' : 'User not found');
    } catch (err) {
      console.error('Error finding user:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log('User found:', user.name);
    
    // Check password
    console.log('Validating password...');
    let isMatch = false;
    
    try {
      if (user.password) {
        console.log('User has password hash:', user.password.substring(0, 10) + '...');
        isMatch = await user.comparePassword(password);
        console.log('Password comparison result:', isMatch);
      } else {
        console.log('User has no password hash!');
      }
    } catch (err) {
      console.error('Error comparing password:', err);
      return res.status(500).json({ message: 'Authentication error', error: err.message });
    }
    
    if (!isMatch) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log('Password validated successfully');
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User routes
app.get('/api/user/profile', auth, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/user/profile', auth, async (req, res) => {
  try {
    const allowedUpdates = [
      'name',
      'age',
      'location',
      'salary',
      'additionalIncome',
      'fixedExpenses',
      'variableExpenses',
      'riskTolerance',
      'emergencyFund',
      'savingsGoal',
    ];
    
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Portfolio routes
app.get('/api/portfolio', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    
    if (!portfolio) {
      // Return empty portfolio if none exists
      portfolio = {
        user: req.user._id,
        investments: [],
        totalAmount: 0,
        expectedReturns: '0%',
        riskProfile: req.user.riskTolerance,
      };
    }
    
    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/portfolio', auth, async (req, res) => {
  try {
    const { investments, riskProfile } = req.body;
    
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    
    if (!portfolio) {
      // Create new portfolio
      portfolio = new Portfolio({
        user: req.user._id,
        investments: investments || [],
        riskProfile: riskProfile || req.user.riskTolerance,
      });
    } else {
      // Update existing portfolio
      if (investments) {
        portfolio.investments = investments;
      }
      
      if (riskProfile) {
        portfolio.riskProfile = riskProfile;
      }
      
      portfolio.lastRebalanced = Date.now();
    }
    
    await portfolio.save();
    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Transaction routes
app.get('/api/transactions', auth, async (req, res) => {
  try {
    const { type, category, startDate, endDate, investment, status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (investment) query.investment = investment;
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }
    
    // Set up pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Transaction.countDocuments(query);
    
    res.status(200).json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/transactions', auth, async (req, res) => {
  try {
    const transaction = new Transaction({
      user: req.user._id,
      ...req.body,
    });
    
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Stock preferences routes
app.get('/api/stock-preferences', auth, async (req, res) => {
  try {
    const { watchlist } = req.query;
    const query = { user: req.user._id };
    
    if (watchlist === 'true') {
      query.watchlist = true;
    }
    
    const stockPreferences = await StockPreference.find(query);
    res.status(200).json(stockPreferences);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/stock-preferences', auth, async (req, res) => {
  try {
    const { symbol, name, watchlist, priceAlert, sector, industry, notes } = req.body;
    
    if (!symbol || !name) {
      return res.status(400).json({ message: 'Symbol and name are required' });
    }
    
    // Check if stock already exists in user preferences
    let stockPreference = await StockPreference.findOne({
      user: req.user._id,
      symbol,
    });
    
    if (stockPreference) {
      // Update existing stock preference
      stockPreference.name = name;
      stockPreference.watchlist = watchlist !== undefined ? watchlist : stockPreference.watchlist;
      stockPreference.notes = notes !== undefined ? notes : stockPreference.notes;
      stockPreference.sector = sector !== undefined ? sector : stockPreference.sector;
      stockPreference.industry = industry !== undefined ? industry : stockPreference.industry;
      
      if (priceAlert) {
        stockPreference.priceAlerts.push(priceAlert);
      }
    } else {
      // Create new stock preference
      stockPreference = new StockPreference({
        user: req.user._id,
        symbol,
        name,
        watchlist: watchlist !== undefined ? watchlist : true,
        priceAlerts: priceAlert ? [priceAlert] : [],
        sector,
        industry,
        notes,
      });
    }
    
    await stockPreference.save();
    res.status(200).json(stockPreference);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Market data routes
app.get('/api/market-data', async (req, res) => {
  try {
    // In a real implementation, this would fetch data from a financial API
    // For now, we'll use mock data with slight randomization
    const mockMarketData = [
      {
        symbol: '^BSESN',
        name: 'SENSEX',
        price: 73402.35 + (Math.random() * 200 - 100),
        change: 543.15 + (Math.random() * 40 - 20),
        changePercent: 0.74 + (Math.random() * 0.2 - 0.1),
      },
      {
        symbol: '^NSEI',
        name: 'NIFTY 50',
        price: 22304.85 + (Math.random() * 100 - 50),
        change: 161.75 + (Math.random() * 20 - 10),
        changePercent: 0.73 + (Math.random() * 0.2 - 0.1),
      },
      {
        symbol: 'USDINR=X',
        name: 'USD/INR',
        price: 83.45 + (Math.random() * 0.4 - 0.2),
        change: -0.12 + (Math.random() * 0.1 - 0.05),
        changePercent: -0.14 + (Math.random() * 0.1 - 0.05),
      },
      {
        symbol: 'EURINR=X',
        name: 'EUR/INR',
        price: 90.67 + (Math.random() * 0.4 - 0.2),
        change: 0.23 + (Math.random() * 0.1 - 0.05),
        changePercent: 0.25 + (Math.random() * 0.1 - 0.05),
      },
    ];
    
    // Format the numbers to look cleaner
    const formattedData = mockMarketData.map(item => ({
      ...item,
      price: parseFloat(item.price.toFixed(2)),
      change: parseFloat(item.change.toFixed(2)),
      changePercent: parseFloat(item.changePercent.toFixed(2)),
    }));
    
    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Stock prediction routes (placeholder for Phase 4)
app.get('/api/stock-predictions', auth, async (req, res) => {
  try {
    // This would be replaced with actual prediction logic in Phase 4
    const mockPredictions = [
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries',
        currentPrice: 2456.75,
        predictedPrice: 2580.50,
        growthPotential: 5.04,
        confidence: 'high',
        timeFrame: '3 months',
      },
      {
        symbol: 'INFY',
        name: 'Infosys Ltd',
        currentPrice: 1456.30,
        predictedPrice: 1590.80,
        growthPotential: 9.24,
        confidence: 'medium',
        timeFrame: '3 months',
      },
      {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank',
        currentPrice: 1678.45,
        predictedPrice: 1780.20,
        growthPotential: 6.06,
        confidence: 'high',
        timeFrame: '3 months',
      },
    ];
    
    res.status(200).json(mockPredictions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Simple test endpoint to check if user exists
app.get('/api/auth/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (user) {
      return res.status(200).json({ 
        exists: true, 
        name: user.name,
        // Return partial email for security
        email: user.email.substring(0, 3) + '...' + user.email.substring(user.email.indexOf('@'))
      });
    }
    
    res.status(404).json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
