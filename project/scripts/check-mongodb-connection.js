// MongoDB Connection Check Script
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the .env file (one directory up from the scripts folder)
const envPath = path.resolve(__dirname, '..', '.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: .env file not found!');
  console.log('Make sure you have a .env file in the project root with MONGODB_URI defined.');
  process.exit(1);
}

// Load environment variables from .env file
dotenv.config({ path: envPath });

// Get MongoDB URI from environment variables
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: MONGODB_URI is not defined in the .env file!');
  process.exit(1);
}

// Function to check if the connection string has placeholder values
const hasPlaceholders = (uri) => {
  return uri.includes('<db_username>') || uri.includes('<db_password>');
};

// Check for placeholder values in the connection string
if (hasPlaceholders(mongoUri)) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: MongoDB connection string contains placeholder values!');
  console.log('Please replace <db_username> and <db_password> with your actual MongoDB credentials in the .env file.');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', 'Attempting to connect to MongoDB...');
console.log(`Connection URI: ${mongoUri.replace(/\/\/(.*)@/, '//***:***@')}`); // Masking credentials in logs

// Create a new MongoClient
const client = new MongoClient(mongoUri);

// Function to connect to the MongoDB server
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('\x1b[32m%s\x1b[0m', '✓ Successfully connected to MongoDB!');

    // Get the list of databases
    const adminDb = client.db('admin');
    const databases = await adminDb.admin().listDatabases();
    
    console.log('\x1b[36m%s\x1b[0m', 'Available databases:');
    databases.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1048576).toFixed(2)} MB)`);
    });

  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Error connecting to MongoDB:');
    console.error(err);
    process.exit(1);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log('\x1b[36m%s\x1b[0m', 'Connection closed');
  }
}

run().catch(console.dir);
