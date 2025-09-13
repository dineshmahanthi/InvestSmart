// MongoDB Database Connection Utility
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MongoDB connection string is not defined in environment variables');
  process.exit(1);
}

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
};

// Connection cache
let cachedConnection = null;

/**
 * Connect to MongoDB database
 * This uses a cached connection if one exists, otherwise creates a new one
 * @returns {Promise<mongoose.Connection>} MongoDB connection
 */
export async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    // Create a new connection
    const conn = await mongoose.connect(MONGODB_URI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    // Cache the connection
    cachedConnection = mongoose.connection;
    return cachedConnection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB database
 * Useful for graceful shutdown or testing
 */
export async function disconnectFromDatabase() {
  if (!cachedConnection) {
    return;
  }

  await mongoose.disconnect();
  cachedConnection = null;
  console.log('Disconnected from MongoDB');
}

/**
 * Check database connection status
 * @returns {boolean} True if connected, false otherwise
 */
export function isConnected() {
  return mongoose.connection.readyState === 1;
}

export default {
  connectToDatabase,
  disconnectFromDatabase,
  isConnected,
};
