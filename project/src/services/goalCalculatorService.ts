import { UserProfile } from '../types';

export interface SavingsGoal {
  id?: string;
  name: string;
  targetAmount: number;
  currentSavings: number;
  monthlySavings: number;
  expectedInterestRate: number;
  completed: boolean;
  targetDate?: Date;
}

/**
 * Calculate the time required to reach a savings goal
 * @param targetAmount Total amount needed
 * @param currentSavings Current savings towards this goal
 * @param monthlySavings Monthly amount being saved
 * @param interestRate Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @returns Months required to reach the goal
 */
export function calculateTimeToGoal(
  targetAmount: number,
  currentSavings: number,
  monthlySavings: number,
  interestRate: number = 0
): number {
  // If already have enough savings or no monthly savings, handle edge cases
  if (currentSavings >= targetAmount) return 0;
  if (monthlySavings <= 0 && currentSavings < targetAmount) return Infinity;

  // Convert annual interest rate to monthly
  const monthlyInterest = interestRate / 12;

  // If no interest, simple calculation
  if (monthlyInterest === 0) {
    return Math.ceil((targetAmount - currentSavings) / monthlySavings);
  }

  // With interest, use compound interest formula
  // FV = P(1+r)^n + PMT*((1+r)^n - 1)/r
  // Solve for n (number of months)
  
  let months = 0;
  let savings = currentSavings;
  
  while (savings < targetAmount && months < 1200) { // Max 100 years (1200 months)
    // Add monthly contribution
    savings += monthlySavings;
    
    // Add interest for this month
    savings *= (1 + monthlyInterest);
    
    months++;
  }
  
  return months;
}

/**
 * Calculate monthly savings needed to reach a goal by a specific date
 * @param targetAmount Total amount needed
 * @param currentSavings Current savings towards this goal
 * @param months Number of months to reach the goal
 * @param interestRate Annual interest rate (as decimal)
 * @returns Monthly amount needed to save
 */
export function calculateMonthlySavingsNeeded(
  targetAmount: number,
  currentSavings: number,
  months: number,
  interestRate: number = 0
): number {
  // Edge cases
  if (months <= 0) return Infinity;
  if (currentSavings >= targetAmount) return 0;
  
  // Convert annual interest rate to monthly
  const monthlyInterest = interestRate / 12;
  
  // If no interest, simple calculation
  if (monthlyInterest === 0) {
    return (targetAmount - currentSavings) / months;
  }

  // With interest, find PMT using formula
  // FV = P(1+r)^n + PMT*((1+r)^n - 1)/r
  // Solve for PMT
  
  // Using financial formula
  // PMT = (FV - P(1+r)^n) / ((1+r)^n - 1) * r
  const futureValueOfCurrent = currentSavings * Math.pow(1 + monthlyInterest, months);
  const amountNeeded = targetAmount - futureValueOfCurrent;
  const annuityFactor = (Math.pow(1 + monthlyInterest, months) - 1) / monthlyInterest;
  
  return amountNeeded / annuityFactor;
}

/**
 * Suggest a savings plan based on user profile
 * @param user User profile with financial information
 * @returns Recommended monthly savings and time to goal
 */
export function suggestSavingsGoalPlan(user: UserProfile, goal: SavingsGoal): {
  recommendedMonthlySavings: number,
  timeToGoal: number,
  isAchievable: boolean,
  maxMonthlySavings: number
} {
  // Calculate user's discretionary income
  const monthlyIncome = user.salary + (user.additionalIncome || 0);
  const monthlyExpenses = user.fixedExpenses + user.variableExpenses;
  const discretionaryIncome = monthlyIncome - monthlyExpenses;
  
  // Assume user can allocate 30-50% of discretionary income to this goal
  const maxMonthlySavings = discretionaryIncome * 0.5;
  
  // Calculate time to goal with current savings rate
  const timeToGoal = calculateTimeToGoal(
    goal.targetAmount,
    goal.currentSavings,
    goal.monthlySavings,
    goal.expectedInterestRate
  );
  
  // Is the goal achievable within a reasonable timeframe (10 years)?
  const isAchievable = timeToGoal <= 120 && timeToGoal !== Infinity;
  
  // If current savings rate is too low, suggest a better rate
  let recommendedMonthlySavings = goal.monthlySavings;
  
  if (!isAchievable && maxMonthlySavings > goal.monthlySavings) {
    // Try to find a savings rate that achieves the goal within 5 years, capped at max savings
    recommendedMonthlySavings = Math.min(
      maxMonthlySavings,
      calculateMonthlySavingsNeeded(goal.targetAmount, goal.currentSavings, 60, goal.expectedInterestRate)
    );
  }
  
  return {
    recommendedMonthlySavings,
    timeToGoal,
    isAchievable,
    maxMonthlySavings
  };
}

/**
 * Format a time period in months into a human-readable format
 * @param months Number of months
 * @returns Formatted string (e.g., "2 years, 3 months")
 */
export function formatTimePeriod(months: number): string {
  if (months === 0) return "Already achieved";
  if (months === Infinity) return "Not achievable";
  
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);
  
  if (years === 0) {
    return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  }
}

/**
 * Mock savings goals for testing purposes
 */
export function getMockSavingsGoals(): SavingsGoal[] {
  return [
    {
      id: "1",
      name: "New Car",
      targetAmount: 800000,
      currentSavings: 250000,
      monthlySavings: 15000,
      expectedInterestRate: 0.04,
      completed: false
    },
    {
      id: "2",
      name: "House Down Payment",
      targetAmount: 2500000,
      currentSavings: 600000,
      monthlySavings: 25000,
      expectedInterestRate: 0.05,
      completed: false
    },
    {
      id: "3",
      name: "Emergency Fund",
      targetAmount: 500000,
      currentSavings: 450000,
      monthlySavings: 10000,
      expectedInterestRate: 0.03,
      completed: false
    }
  ];
}
