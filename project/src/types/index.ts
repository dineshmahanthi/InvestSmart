// User profile types
export type RiskTolerance = 'low' | 'medium' | 'high';

export interface UserProfile {
  id?: string; // Added for referencing the user in tools like habit tracker and advice sharing
  name: string;
  email: string;
  password?: string; // Optional in profile, but required for auth
  photoUrl?: string; // User profile photo URL
  age: number;
  location?: string;
  salary: number;
  additionalIncome?: number; // Optional additional income source
  fixedExpenses: number;
  variableExpenses: number;
  riskTolerance: RiskTolerance;
  monthlySurplus: number;
  emergencyFund: number;
  investableAmount: number;
}

// Registration form types
export interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  location: string;
  photoUrl?: string;
  salary: number;
  additionalIncome?: number;
  fixedExpenses: number;
  variableExpenses: number;
  riskTolerance: RiskTolerance;
}

// Server registration data (includes confirmPassword and calculated fields)
export interface ServerRegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string; // Added for server validation
  age: number;
  location: string;
  photoUrl?: string;
  salary: number;
  additionalIncome?: number;
  fixedExpenses: number;
  variableExpenses: number;
  riskTolerance: RiskTolerance;
  monthlySurplus: number;
  emergencyFund: number;
  investableAmount: number;
}

// Market data types
export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Investment types
export interface Investment {
  name: string;
  allocation: number;
  amount: number;
  category: string;
  returns: string;
}

export interface Portfolio {
  investments: Investment[];
  totalAmount: number;
  expectedReturns: string;
}

// News types
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  imageUrl?: string;
  source: string;
  url?: string;
}

// Financial Habit Tracker types
export interface FinancialHabit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: 'saving' | 'spending' | 'investing' | 'learning' | 'budgeting';
  frequency: 'daily' | 'weekly' | 'monthly';
  targetDays: number[]; // For weekly: 0-6 (Sunday-Saturday), For monthly: 1-31
  streak: number;
  longestStreak: number;
  completedDates: string[]; // ISO date strings
  createdAt: string;
  updatedAt: string;
  reminderEnabled?: boolean;
  isActive: boolean;
}

// User Advice types
export interface AdviceQuestion {
  id: string;
  userId: string;
  question: string;
  context?: string;
  category: 'saving' | 'spending' | 'investing' | 'budgeting' | 'debt' | 'planning' | 'other';
  options?: string[]; // For poll-style questions
  createdAt: string;
  isResolved: boolean;
  isAnonymous: boolean;
}

export interface AdviceResponse {
  id: string;
  questionId: string;
  userId: string;
  response: string;
  isAnonymous: boolean;
  likes: number;
  createdAt: string;
  optionSelected?: number; // For poll responses, index of the selected option
}

// Expense Tracking types
export type ExpenseCategory = 
  | 'housing' 
  | 'utilities' 
  | 'groceries' 
  | 'dining' 
  | 'transportation' 
  | 'healthcare' 
  | 'entertainment' 
  | 'shopping' 
  | 'education' 
  | 'travel' 
  | 'investments' 
  | 'debt' 
  | 'insurance' 
  | 'gifts' 
  | 'other';

export type PaymentMethod = 
  | 'cash' 
  | 'credit_card' 
  | 'debit_card' 
  | 'upi' 
  | 'net_banking' 
  | 'wallet' 
  | 'other';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string; // ISO date string
  paymentMethod: PaymentMethod;
  location?: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  alertThreshold: number; // Percentage (0-100) at which to alert the user
  currentSpending: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  totalSpent: number;
  categorySummary: { [key in ExpenseCategory]?: number };
  timeSeries: { date: string, amount: number }[];
  budgetStatus: { 
    category: ExpenseCategory, 
    budgeted: number, 
    spent: number, 
    remaining: number,
    percentUsed: number 
  }[];
}