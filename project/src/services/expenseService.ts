import { format, subDays, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { Expense, ExpenseCategory, Budget, ExpenseSummary } from '../types';

// Mock database for expenses and budgets (would be replaced with actual API calls in production)
let mockExpenses: Expense[] = [];
let mockBudgets: Budget[] = [];

/**
 * Generate a unique ID
 */
function generateId(type: 'expense' | 'budget'): string {
  return `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Get all expenses for a user with optional filters
 */
export async function getUserExpenses(
  userId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    categories?: ExpenseCategory[];
    minAmount?: number;
    maxAmount?: number;
    isRecurring?: boolean;
  }
): Promise<Expense[]> {
  // In a real app, this would fetch from API
  let filteredExpenses = mockExpenses.filter(expense => expense.userId === userId);

  // Apply filters if provided
  if (filters) {
    if (filters.startDate) {
      const startDate = parseISO(filters.startDate);
      filteredExpenses = filteredExpenses.filter(
        expense => parseISO(expense.date) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = parseISO(filters.endDate);
      filteredExpenses = filteredExpenses.filter(
        expense => parseISO(expense.date) <= endDate
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      filteredExpenses = filteredExpenses.filter(
        expense => filters.categories!.includes(expense.category)
      );
    }

    if (filters.minAmount !== undefined) {
      filteredExpenses = filteredExpenses.filter(
        expense => expense.amount >= filters.minAmount!
      );
    }

    if (filters.maxAmount !== undefined) {
      filteredExpenses = filteredExpenses.filter(
        expense => expense.amount <= filters.maxAmount!
      );
    }

    if (filters.isRecurring !== undefined) {
      filteredExpenses = filteredExpenses.filter(
        expense => expense.isRecurring === filters.isRecurring
      );
    }
  }

  // Sort by date (newest first)
  filteredExpenses.sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );

  return filteredExpenses;
}

/**
 * Create a new expense
 */
export async function createExpense(
  userId: string,
  expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Expense> {
  const now = new Date();
  const newExpense: Expense = {
    id: generateId('expense'),
    userId,
    ...expenseData,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  
  mockExpenses.push(newExpense);

  // Check if this expense affects any budget alerts
  await checkBudgetAlerts(userId, newExpense.category);
  
  return newExpense;
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  expenseId: string,
  updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>
): Promise<Expense | null> {
  const index = mockExpenses.findIndex(e => e.id === expenseId);
  
  if (index === -1) {
    return null;
  }

  const oldCategory = mockExpenses[index].category;
  
  mockExpenses[index] = {
    ...mockExpenses[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Check if we need to update budget alerts for both old and new category
  if (updates.category && updates.category !== oldCategory) {
    await checkBudgetAlerts(mockExpenses[index].userId, oldCategory);
    await checkBudgetAlerts(mockExpenses[index].userId, updates.category);
  } else {
    await checkBudgetAlerts(mockExpenses[index].userId, mockExpenses[index].category);
  }
  
  return mockExpenses[index];
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId: string): Promise<boolean> {
  const index = mockExpenses.findIndex(e => e.id === expenseId);
  
  if (index === -1) {
    return false;
  }

  const deletedExpense = mockExpenses[index];
  mockExpenses.splice(index, 1);

  // Update budget alerts for this category
  await checkBudgetAlerts(deletedExpense.userId, deletedExpense.category);
  
  return true;
}

/**
 * Get all budgets for a user
 */
export async function getUserBudgets(userId: string): Promise<Budget[]> {
  return mockBudgets
    .filter(budget => budget.userId === userId && budget.isActive)
    .sort((a, b) => b.amount - a.amount); // Sort by budget amount (highest first)
}

/**
 * Create a new budget
 */
export async function createBudget(
  userId: string,
  budgetData: Omit<Budget, 'id' | 'userId' | 'currentSpending' | 'createdAt' | 'updatedAt' | 'isActive'>
): Promise<Budget> {
  const now = new Date();
  
  // Calculate initial spending for this budget period
  const currentSpending = await calculateCurrentSpending(
    userId, 
    budgetData.category, 
    budgetData.period, 
    budgetData.startDate
  );

  const newBudget: Budget = {
    id: generateId('budget'),
    userId,
    ...budgetData,
    currentSpending,
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  
  mockBudgets.push(newBudget);
  return newBudget;
}

/**
 * Update a budget
 */
export async function updateBudget(
  budgetId: string,
  updates: Partial<Omit<Budget, 'id' | 'userId' | 'createdAt'>>
): Promise<Budget | null> {
  const index = mockBudgets.findIndex(b => b.id === budgetId);
  
  if (index === -1) {
    return null;
  }
  
  mockBudgets[index] = {
    ...mockBudgets[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return mockBudgets[index];
}

/**
 * Delete a budget (soft delete by setting isActive to false)
 */
export async function deleteBudget(budgetId: string): Promise<boolean> {
  const index = mockBudgets.findIndex(b => b.id === budgetId);
  
  if (index === -1) {
    return false;
  }
  
  mockBudgets[index].isActive = false;
  mockBudgets[index].updatedAt = new Date().toISOString();
  
  return true;
}

/**
 * Calculate the current spending for a budget period
 */
async function calculateCurrentSpending(
  userId: string,
  category: ExpenseCategory,
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: string
): Promise<number> {
  const start = parseISO(startDate);
  let end: Date;
  
  // Calculate end date based on period
  switch (period) {
    case 'weekly':
      end = endOfWeek(start);
      break;
    case 'monthly':
      end = endOfMonth(start);
      break;
    case 'yearly':
      end = endOfYear(start);
      break;
    default:
      end = new Date();
  }
  
  // If end date is in the future, use current date instead
  const now = new Date();
  if (end > now) {
    end = now;
  }
  
  console.log(`Calculating spending for ${category} from ${startDate} to ${format(end, 'yyyy-MM-dd')}`);
  
  // Get expenses in the date range for this category
  const expenses = await getUserExpenses(userId, {
    startDate: startDate,
    endDate: format(end, 'yyyy-MM-dd'),
    categories: [category]
  });
  
  // Sum up the expenses
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  console.log(`Found ${expenses.length} expenses for ${category}, total: ${total}`);
  
  return total;
}

/**
 * Update spending amounts for all budgets
 */
export async function updateBudgetSpending(userId: string): Promise<void> {
  const activeBudgets = await getUserBudgets(userId);
  
  for (const budget of activeBudgets) {
    // Calculate and update current spending
    const spending = await calculateCurrentSpending(
      userId,
      budget.category,
      budget.period,
      budget.startDate
    );
    
    // Update the budget in-place
    budget.currentSpending = spending;
    
    // Also persist this change
    await updateBudget(budget.id, { currentSpending: spending });
  }
}

/**
 * Check if any budget alerts should be triggered
 */
export async function checkBudgetAlerts(
  userId: string,
  category: ExpenseCategory
): Promise<{ budget: Budget, percentUsed: number, isOverBudget: boolean }[]> {
  const activeBudgets = await getUserBudgets(userId);
  const alerts = [];
  
  // Filter budgets for this category
  const categoryBudgets = activeBudgets.filter(budget => budget.category === category);
  
  for (const budget of categoryBudgets) {
    // Update current spending
    budget.currentSpending = await calculateCurrentSpending(
      userId,
      budget.category,
      budget.period,
      budget.startDate
    );
    
    // Calculate percentage used
    const percentUsed = (budget.currentSpending / budget.amount) * 100;
    
    // Check if alert threshold is reached
    if (percentUsed >= budget.alertThreshold) {
      alerts.push({
        budget,
        percentUsed,
        isOverBudget: percentUsed >= 100
      });
    }
    
    // Update the budget
    await updateBudget(budget.id, { currentSpending: budget.currentSpending });
  }
  
  return alerts;
}

/**
 * Get expense summary for a user
 */
export async function getExpenseSummary(
  userId: string,
  period: 'week' | 'month' | 'year' | 'custom' = 'month',
  startDate?: string,
  endDate?: string
): Promise<ExpenseSummary> {
  let start: Date;
  let end: Date = new Date();
  
  // Calculate date range based on period
  if (period === 'custom' && startDate && endDate) {
    start = parseISO(startDate);
    end = parseISO(endDate);
  } else {
    switch (period) {
      case 'week':
        start = startOfWeek(new Date());
        end = endOfWeek(new Date());
        break;
      case 'month':
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      case 'year':
        start = startOfYear(new Date());
        end = endOfYear(new Date());
        break;
      default:
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
    }
  }
  
  // Get expenses for the date range
  const expenses = await getUserExpenses(userId, {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd')
  });
  
  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate category summary
  const categorySummary: { [key in ExpenseCategory]?: number } = {};
  for (const expense of expenses) {
    if (!categorySummary[expense.category]) {
      categorySummary[expense.category] = 0;
    }
    categorySummary[expense.category]! += expense.amount;
  }
  
  // Create time series data
  const dailyExpenses: { [date: string]: number } = {};
  for (const expense of expenses) {
    const dateStr = expense.date.split('T')[0]; // Get just the date part
    if (!dailyExpenses[dateStr]) {
      dailyExpenses[dateStr] = 0;
    }
    dailyExpenses[dateStr] += expense.amount;
  }
  
  const timeSeries = Object.entries(dailyExpenses).map(([date, amount]) => ({
    date,
    amount
  })).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  
  // Get active budgets
  const budgets = await getUserBudgets(userId);
  
  // Calculate budget status
  const budgetStatus = budgets.map(budget => {
    const spent = categorySummary[budget.category] || 0;
    return {
      category: budget.category,
      budgeted: budget.amount,
      spent,
      remaining: Math.max(0, budget.amount - spent),
      percentUsed: (spent / budget.amount) * 100
    };
  });
  
  return {
    totalSpent,
    categorySummary,
    timeSeries,
    budgetStatus
  };
}

// Initialize sample expense data for development
export function initializeDevExpenses(userId: string): void {
  const now = new Date();
  
  // Create sample expenses
  mockExpenses = [
    {
      id: 'expense-1',
      userId,
      amount: 2000,
      description: 'Monthly rent payment',
      category: 'housing',
      date: format(subDays(now, 2), 'yyyy-MM-dd'),
      paymentMethod: 'net_banking',
      location: 'Home',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: subDays(now, 2).toISOString(),
      updatedAt: subDays(now, 2).toISOString()
    },
    {
      id: 'expense-2',
      userId,
      amount: 500,
      description: 'Groceries for the week',
      category: 'groceries',
      date: format(subDays(now, 5), 'yyyy-MM-dd'),
      paymentMethod: 'credit_card',
      location: 'Supermarket',
      isRecurring: false,
      tags: ['food', 'essentials'],
      createdAt: subDays(now, 5).toISOString(),
      updatedAt: subDays(now, 5).toISOString()
    },
    {
      id: 'expense-3',
      userId,
      amount: 350,
      description: 'Dinner with friends',
      category: 'dining',
      date: format(subDays(now, 3), 'yyyy-MM-dd'),
      paymentMethod: 'upi',
      location: 'Restaurant',
      isRecurring: false,
      tags: ['social', 'food'],
      createdAt: subDays(now, 3).toISOString(),
      updatedAt: subDays(now, 3).toISOString()
    },
    {
      id: 'expense-4',
      userId,
      amount: 800,
      description: 'Electricity bill',
      category: 'utilities',
      date: format(subDays(now, 7), 'yyyy-MM-dd'),
      paymentMethod: 'net_banking',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: subDays(now, 7).toISOString(),
      updatedAt: subDays(now, 7).toISOString()
    },
    {
      id: 'expense-5',
      userId,
      amount: 1200,
      description: 'New shoes',
      category: 'shopping',
      date: format(subDays(now, 10), 'yyyy-MM-dd'),
      paymentMethod: 'debit_card',
      location: 'Mall',
      isRecurring: false,
      tags: ['clothing', 'personal'],
      createdAt: subDays(now, 10).toISOString(),
      updatedAt: subDays(now, 10).toISOString()
    },
    // Additional expenses for entertainment category to demonstrate budget usage
    {
      id: 'expense-6',
      userId,
      amount: 750,
      description: 'Movie tickets and dinner',
      category: 'entertainment',
      date: format(subDays(now, 4), 'yyyy-MM-dd'),
      paymentMethod: 'credit_card',
      location: 'Cinema',
      isRecurring: false,
      tags: ['movie', 'weekend'],
      createdAt: subDays(now, 4).toISOString(),
      updatedAt: subDays(now, 4).toISOString()
    },
    {
      id: 'expense-7',
      userId,
      amount: 600,
      description: 'Concert tickets',
      category: 'entertainment',
      date: format(subDays(now, 8), 'yyyy-MM-dd'),
      paymentMethod: 'debit_card',
      location: 'Stadium',
      isRecurring: false,
      tags: ['music', 'entertainment'],
      createdAt: subDays(now, 8).toISOString(),
      updatedAt: subDays(now, 8).toISOString()
    },
    // More grocery expenses
    {
      id: 'expense-8',
      userId,
      amount: 850,
      description: 'Monthly grocery shopping',
      category: 'groceries',
      date: format(subDays(now, 12), 'yyyy-MM-dd'),
      paymentMethod: 'credit_card',
      location: 'Supermarket',
      isRecurring: true,
      recurringFrequency: 'monthly',
      tags: ['food', 'essentials'],
      createdAt: subDays(now, 12).toISOString(),
      updatedAt: subDays(now, 12).toISOString()
    },
    // More dining expenses
    {
      id: 'expense-9',
      userId,
      amount: 450,
      description: 'Dinner with family',
      category: 'dining',
      date: format(subDays(now, 1), 'yyyy-MM-dd'),
      paymentMethod: 'upi',
      location: 'Family Restaurant',
      isRecurring: false,
      tags: ['family', 'food'],
      createdAt: subDays(now, 1).toISOString(),
      updatedAt: subDays(now, 1).toISOString()
    },
    {
      id: 'expense-10',
      userId,
      amount: 250,
      description: 'Lunch with colleagues',
      category: 'dining',
      date: format(subDays(now, 6), 'yyyy-MM-dd'),
      paymentMethod: 'cash',
      location: 'Office Cafeteria',
      isRecurring: false,
      tags: ['work', 'lunch'],
      createdAt: subDays(now, 6).toISOString(),
      updatedAt: subDays(now, 6).toISOString()
    }
  ] as Expense[];
  
  // Create sample budgets - we'll calculate the actual spending when displayed
  mockBudgets = [
    {
      id: 'budget-1',
      userId,
      category: 'groceries',
      amount: 2000,
      period: 'monthly',
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      alertThreshold: 80,
      currentSpending: 0, // Will be calculated dynamically
      isActive: true,
      createdAt: subDays(now, 20).toISOString(),
      updatedAt: subDays(now, 5).toISOString()
    },
    {
      id: 'budget-2',
      userId,
      category: 'dining',
      amount: 1500,
      period: 'monthly',
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      alertThreshold: 70,
      currentSpending: 0, // Will be calculated dynamically
      isActive: true,
      createdAt: subDays(now, 20).toISOString(),
      updatedAt: subDays(now, 3).toISOString()
    },
    {
      id: 'budget-3',
      userId,
      category: 'entertainment',
      amount: 1000,
      period: 'monthly',
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      alertThreshold: 90,
      currentSpending: 0, // Will be calculated dynamically
      isActive: true,
      createdAt: subDays(now, 20).toISOString(),
      updatedAt: subDays(now, 20).toISOString()
    },
    {
      id: 'budget-4',
      userId,
      category: 'shopping',
      amount: 3000,
      period: 'monthly',
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      alertThreshold: 75,
      currentSpending: 0, // Will be calculated dynamically
      isActive: true,
      createdAt: subDays(now, 20).toISOString(),
      updatedAt: subDays(now, 10).toISOString()
    }
  ] as Budget[];
  
  // Immediately calculate and update the spending amounts for each budget
  updateBudgetSpending(userId);
}