// User profile types
export type RiskTolerance = 'low' | 'medium' | 'high';

export interface UserProfile {
  name: string;
  email: string;
  password?: string; // Optional in profile, but required for auth
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