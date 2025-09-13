import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the schema for user
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'User must be at least 18 years old'],
      max: [100, 'Age cannot exceed 100 years'],
    },
    location: {
      type: String,
      trim: true,
    },
    // Financial information
    salary: {
      type: Number,
      required: [true, 'Salary information is required'],
      min: [0, 'Salary cannot be negative'],
    },
    additionalIncome: {
      type: Number,
      default: 0,
      min: [0, 'Additional income cannot be negative'],
    },
    fixedExpenses: {
      type: Number,
      required: [true, 'Fixed expenses information is required'],
      min: [0, 'Fixed expenses cannot be negative'],
    },
    variableExpenses: {
      type: Number,
      required: [true, 'Variable expenses information is required'],
      min: [0, 'Variable expenses cannot be negative'],
    },
    riskTolerance: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    emergencyFund: {
      type: Number,
      default: 0,
      min: [0, 'Emergency fund cannot be negative'],
    },
    savingsGoal: {
      type: Number,
      default: 0,
      min: [0, 'Savings goal cannot be negative'],
    },
    // Calculated fields
    monthlySurplus: {
      type: Number,
      default: 0,
    },
    investableAmount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    // Add virtual properties when converting to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create virtual property for total income
userSchema.virtual('totalIncome').get(function() {
  return this.salary + (this.additionalIncome || 0);
});

// Create virtual property for total expenses
userSchema.virtual('totalExpenses').get(function() {
  return this.fixedExpenses + this.variableExpenses;
});

// Middleware: Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware: Calculate financial metrics before saving
userSchema.pre('save', function(next) {
  // Calculate monthly surplus
  this.monthlySurplus = this.totalIncome - this.totalExpenses;
  
  // Calculate investable amount (75% of surplus as per requirements)
  this.investableAmount = this.monthlySurplus * 0.75;
  
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model from the schema
const User = mongoose.model('User', userSchema);

export default User;
