// Debug script to check user authentication issues
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import { URL } from 'url';

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const connectToDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MongoDB connection string is missing');
    }
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Now that we're connected, we can import the models
    // Use file:// protocol for Windows paths
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const modelsPath = path.join(__dirname, '..', 'src', 'models');
    const userModulePath = new URL(`file://${path.resolve(modelsPath, 'User.js')}`).href;
    
    const User = (await import(userModulePath)).default;
    return { User };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

const debugUserAuthentication = async () => {
  try {
    // Connect and get models
    const { User } = await connectToDatabase();
    
    // Find all users in the database
    const allUsers = await User.find({}).select('+password');
    
    console.log('\n==== USERS IN DATABASE ====');
    console.log(`Total users found: ${allUsers.length}`);
    
    // Display user information for debugging
    allUsers.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password (hashed): ${user.password?.substring(0, 20)}...`);
      console.log(`Age: ${user.age}`);
      console.log(`Risk Tolerance: ${user.riskTolerance}`);
    });
    
    // Test authentication for each user
    console.log('\n==== TESTING AUTHENTICATION ====');
    const testEmail = 'rajesh@example.com';
    const testPassword = 'Password123';
    
    console.log(`Looking for user with email: ${testEmail}`);
    const testUser = await User.findOne({ email: testEmail }).select('+password');
    
    if (testUser) {
      console.log('User found!');
      console.log(`Name: ${testUser.name}`);
      console.log(`Email: ${testUser.email}`);
      console.log(`Password hash: ${testUser.password?.substring(0, 20)}...`);
      
      // Test password comparison
      console.log('\nTesting password comparison...');
      const isValidPassword = await testUser.comparePassword(testPassword);
      console.log(`Is password valid: ${isValidPassword}`);
      
      if (!isValidPassword) {
        console.log('\nPassword comparison failed. Let\'s verify the bcrypt implementation:');
        // Manual bcrypt check
        console.log('Performing manual bcrypt compare...');
        const manualCompare = await bcrypt.compare(testPassword, testUser.password);
        console.log(`Manual bcrypt compare result: ${manualCompare}`);
        
        if (manualCompare !== isValidPassword) {
          console.log('Warning: Inconsistency between comparePassword method and direct bcrypt compare!');
          console.log('This suggests an issue with the comparePassword implementation.');
        }
      }
    } else {
      console.log(`No user found with email: ${testEmail}`);
      console.log('Available emails in the database:');
      allUsers.forEach(user => {
        console.log(` - ${user.email}`);
      });
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error during debugging:', error);
    process.exit(1);
  }
};

// Run the debugging function
debugUserAuthentication();
