import { format, isToday, parseISO, isAfter, isBefore, addDays, 
  isWithinInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { FinancialHabit } from '../types';

// Mock database for habits (would be replaced with actual API calls in production)
let mockHabits: FinancialHabit[] = [];

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `habit-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Get all habits for a user
 */
export async function getUserHabits(userId: string): Promise<FinancialHabit[]> {
  // In a real app, this would fetch from API
  return mockHabits.filter(habit => habit.userId === userId && habit.isActive);
}

/**
 * Create a new financial habit
 */
export async function createHabit(
  userId: string,
  habit: Omit<FinancialHabit, 'id' | 'userId' | 'streak' | 'longestStreak' | 'completedDates' | 'createdAt' | 'updatedAt' | 'isActive'>
): Promise<FinancialHabit> {
  const now = new Date();
  const newHabit: FinancialHabit = {
    id: generateId(),
    userId,
    ...habit,
    streak: 0,
    longestStreak: 0,
    completedDates: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    isActive: true,
  };
  
  mockHabits.push(newHabit);
  return newHabit;
}

/**
 * Update a habit
 */
export async function updateHabit(
  habitId: string,
  updates: Partial<Omit<FinancialHabit, 'id' | 'userId' | 'createdAt'>>
): Promise<FinancialHabit | null> {
  const index = mockHabits.findIndex(h => h.id === habitId);
  
  if (index === -1) {
    return null;
  }
  
  mockHabits[index] = {
    ...mockHabits[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return mockHabits[index];
}

/**
 * Mark a habit as complete for today
 */
export async function completeHabit(habitId: string): Promise<FinancialHabit | null> {
  const habit = mockHabits.find(h => h.id === habitId);
  
  if (!habit) {
    return null;
  }
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Check if already completed today
  if (habit.completedDates.includes(today)) {
    return habit;
  }
  
  const updatedHabit = {...habit};
  updatedHabit.completedDates.push(today);
  
  // Update streak
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
  
  // Check if habit is "due" today based on frequency
  const isDueToday = isHabitDueToday(habit);
  
  if (isDueToday) {
    // If yesterday was completed or this is the first completion, increment streak
    if (habit.completedDates.includes(yesterday) || habit.streak === 0) {
      updatedHabit.streak++;
    } else {
      // Reset streak if a day was missed
      updatedHabit.streak = 1;
    }
  }
  
  // Update longest streak
  if (updatedHabit.streak > updatedHabit.longestStreak) {
    updatedHabit.longestStreak = updatedHabit.streak;
  }
  
  updatedHabit.updatedAt = new Date().toISOString();
  
  // Update in database
  const index = mockHabits.findIndex(h => h.id === habitId);
  mockHabits[index] = updatedHabit;
  
  return updatedHabit;
}

/**
 * Delete a habit (soft delete)
 */
export async function deleteHabit(habitId: string): Promise<boolean> {
  const index = mockHabits.findIndex(h => h.id === habitId);
  
  if (index === -1) {
    return false;
  }
  
  mockHabits[index].isActive = false;
  mockHabits[index].updatedAt = new Date().toISOString();
  
  return true;
}

/**
 * Check if a habit is due today based on its frequency
 */
function isHabitDueToday(habit: FinancialHabit): boolean {
  const today = new Date();
  
  switch (habit.frequency) {
    case 'daily':
      return true;
      
    case 'weekly':
      // targetDays contains days of week (0 = Sunday, 6 = Saturday)
      return habit.targetDays.includes(today.getDay());
      
    case 'monthly':
      // targetDays contains days of month (1-31)
      return habit.targetDays.includes(today.getDate());
      
    default:
      return false;
  }
}

/**
 * Get habit statistics for a user
 */
export async function getHabitStats(userId: string): Promise<{
  activeHabitsCount: number;
  totalCompletions: number;
  currentStreaks: { habitId: string, name: string, streak: number }[];
  completionRate: number; // Percentage of due habits completed in the last 30 days
}> {
  const habits = await getUserHabits(userId);
  
  // Calculate stats
  const activeHabitsCount = habits.length;
  
  // Total all completions
  let totalCompletions = 0;
  habits.forEach(habit => {
    totalCompletions += habit.completedDates.length;
  });
  
  // Get current streaks
  const currentStreaks = habits.map(habit => ({
    habitId: habit.id,
    name: habit.name,
    streak: habit.streak
  })).sort((a, b) => b.streak - a.streak);
  
  // Calculate completion rate for the last 30 days
  const today = new Date();
  const thirtyDaysAgo = addDays(today, -30);
  
  let dueCount = 0;
  let completedCount = 0;
  
  habits.forEach(habit => {
    // For each day in the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = addDays(thirtyDaysAgo, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Check if habit was due on this date
      if (isHabitDue(habit, date)) {
        dueCount++;
        
        // Check if it was completed
        if (habit.completedDates.includes(dateStr)) {
          completedCount++;
        }
      }
    }
  });
  
  const completionRate = dueCount > 0 
    ? (completedCount / dueCount) * 100 
    : 0;
  
  return {
    activeHabitsCount,
    totalCompletions,
    currentStreaks,
    completionRate
  };
}

/**
 * Check if a habit was due on a specific date
 */
function isHabitDue(habit: FinancialHabit, date: Date): boolean {
  // Don't count dates before habit was created
  const habitCreated = parseISO(habit.createdAt);
  if (isBefore(date, habitCreated)) {
    return false;
  }
  
  switch (habit.frequency) {
    case 'daily':
      return true;
      
    case 'weekly':
      // targetDays contains days of week (0 = Sunday, 6 = Saturday)
      return habit.targetDays.includes(date.getDay());
      
    case 'monthly':
      // targetDays contains days of month (1-31)
      return habit.targetDays.includes(date.getDate());
      
    default:
      return false;
  }
}

// Sample habit data for development
export function initializeDevHabits(userId: string): void {
  const now = new Date();
  
  // Create sample habits
  mockHabits = [
    {
      id: 'habit-1',
      userId,
      name: 'No unnecessary spending Mondays',
      description: 'Avoid all discretionary spending on Mondays',
      category: 'spending',
      frequency: 'weekly',
      targetDays: [1], // Monday
      streak: 3,
      longestStreak: 5,
      completedDates: [
        format(addDays(now, -21), 'yyyy-MM-dd'),
        format(addDays(now, -14), 'yyyy-MM-dd'),
        format(addDays(now, -7), 'yyyy-MM-dd'),
      ],
      createdAt: addDays(now, -60).toISOString(),
      updatedAt: now.toISOString(),
      reminderEnabled: true,
      isActive: true
    },
    {
      id: 'habit-2',
      userId,
      name: 'Review investments weekly',
      category: 'investing',
      frequency: 'weekly',
      targetDays: [5], // Friday
      streak: 4,
      longestStreak: 4,
      completedDates: [
        format(addDays(now, -28), 'yyyy-MM-dd'),
        format(addDays(now, -21), 'yyyy-MM-dd'),
        format(addDays(now, -14), 'yyyy-MM-dd'),
        format(addDays(now, -7), 'yyyy-MM-dd'),
      ],
      createdAt: addDays(now, -40).toISOString(),
      updatedAt: now.toISOString(),
      isActive: true
    },
    {
      id: 'habit-3',
      userId,
      name: 'Transfer to savings on payday',
      category: 'saving',
      frequency: 'monthly',
      targetDays: [1], // 1st of month
      streak: 2,
      longestStreak: 2,
      completedDates: [
        format(new Date(now.getFullYear(), now.getMonth() - 2, 1), 'yyyy-MM-dd'),
        format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'yyyy-MM-dd'),
      ],
      createdAt: addDays(now, -90).toISOString(),
      updatedAt: now.toISOString(),
      isActive: true
    },
  ];
}