import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Calendar, Star, Award, 
  TrendingUp, AlertTriangle, RotateCcw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getUserHabits, completeHabit, createHabit, 
  getHabitStats, initializeDevHabits 
} from '../../services/habitTrackerService';
import { FinancialHabit } from '../../types';
import { format } from 'date-fns';

// Category icons
const categoryIcons = {
  saving: <Star className="h-4 w-4 text-emerald-600" />,
  spending: <AlertTriangle className="h-4 w-4 text-amber-600" />,
  investing: <TrendingUp className="h-4 w-4 text-blue-600" />,
  learning: <Clock className="h-4 w-4 text-indigo-600" />,
  budgeting: <Calendar className="h-4 w-4 text-purple-600" />,
};

// Category colors
const categoryColors = {
  saving: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  spending: 'bg-amber-100 text-amber-800 border-amber-300',
  investing: 'bg-blue-100 text-blue-800 border-blue-300',
  learning: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  budgeting: 'bg-purple-100 text-purple-800 border-purple-300',
};

const emptyHabit: Omit<FinancialHabit, 
  'id' | 'userId' | 'streak' | 'longestStreak' | 'completedDates' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: '',
  description: '',
  category: 'saving',
  frequency: 'daily',
  targetDays: [],
  reminderEnabled: false,
};

const FinancialHabitTracker: React.FC = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<FinancialHabit[]>([]);
  const [stats, setStats] = useState<{
    activeHabitsCount: number;
    totalCompletions: number;
    currentStreaks: { habitId: string; name: string; streak: number }[];
    completionRate: number;
  }>({
    activeHabitsCount: 0,
    totalCompletions: 0,
    currentStreaks: [],
    completionRate: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newHabit, setNewHabit] = useState(emptyHabit);
  
  // For weekly frequency day selection
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Load habits data
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Initialize dev data for demo purposes
          initializeDevHabits(user.id || 'user123');
          
          const userHabits = await getUserHabits(user.id || 'user123');
          setHabits(userHabits);
          
          const habitStats = await getHabitStats(user.id || 'user123');
          setStats(habitStats);
        } catch (error) {
          console.error('Error loading habits:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [user]);
  
  // Mark a habit as complete
  const handleCompleteHabit = async (habitId: string) => {
    try {
      const updated = await completeHabit(habitId);
      if (updated) {
        // Update the habits list
        setHabits(habits.map(h => h.id === habitId ? updated : h));
        
        // Update stats
        const habitStats = await getHabitStats(user?.id || 'user123');
        setStats(habitStats);
      }
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewHabit({
      ...newHabit,
      [name]: value,
    });
  };
  
  // Handle checkbox changes for days of week
  const handleDayToggle = (dayIndex: number) => {
    const currentDays = [...newHabit.targetDays];
    const index = currentDays.indexOf(dayIndex);
    
    if (index > -1) {
      currentDays.splice(index, 1);
    } else {
      currentDays.push(dayIndex);
    }
    
    setNewHabit({
      ...newHabit,
      targetDays: currentDays,
    });
  };
  
  // Create a new habit
  const handleCreateHabit = async () => {
    if (!newHabit.name || !newHabit.targetDays.length) {
      alert('Please fill in all required fields.');
      return;
    }
    
    try {
      const created = await createHabit(user?.id || 'user123', newHabit);
      
      setHabits([...habits, created]);
      setIsCreating(false);
      setNewHabit(emptyHabit);
      
      // Update stats
      const habitStats = await getHabitStats(user?.id || 'user123');
      setStats(habitStats);
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };
  
  // Determine if a habit is due today
  const isHabitDueToday = (habit: FinancialHabit): boolean => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const dayOfMonth = today.getDate(); // 1-31
    
    switch (habit.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return habit.targetDays.includes(dayOfWeek);
      case 'monthly':
        return habit.targetDays.includes(dayOfMonth);
      default:
        return false;
    }
  };
  
  // Check if a habit is already completed today
  const isCompletedToday = (habit: FinancialHabit): boolean => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return habit.completedDates.includes(today);
  };
  
  // Format habit frequency for display
  const formatFrequency = (habit: FinancialHabit): string => {
    switch (habit.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return `Weekly (${habit.targetDays
          .sort((a, b) => a - b)
          .map(day => daysOfWeek[day])
          .join(', ')})`;
      case 'monthly':
        return `Monthly (Day${habit.targetDays.length > 1 ? 's' : ''} ${habit.targetDays
          .sort((a, b) => a - b)
          .join(', ')})`;
      default:
        return '';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Financial Habit Tracker</h2>
        <p className="text-gray-600 mb-6">
          Track your financial habits and build consistency for better financial health.
        </p>
        
        {/* Stats summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700 mb-1">Active Habits</p>
            <p className="text-3xl font-semibold">{stats.activeHabitsCount}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-sm text-green-700 mb-1">Completion Rate</p>
            <p className="text-3xl font-semibold">{stats.completionRate.toFixed(0)}%</p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-700 mb-1">Total Completions</p>
            <p className="text-3xl font-semibold">{stats.totalCompletions}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-700 mb-1">Best Streak</p>
            <p className="text-3xl font-semibold">
              {stats.currentStreaks.length > 0 ? stats.currentStreaks[0].streak : 0}
            </p>
          </div>
        </div>
      </div>
      
      {/* Create new habit button */}
      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Clock className="mr-2 h-4 w-4" /> Create New Habit
        </button>
      ) : (
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Create New Financial Habit</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Habit Name*
              </label>
              <input
                type="text"
                name="name"
                value={newHabit.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., No unnecessary spending Mondays"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={newHabit.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="Describe your habit goal"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={newHabit.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="saving">Saving</option>
                  <option value="spending">Spending</option>
                  <option value="investing">Investing</option>
                  <option value="learning">Learning</option>
                  <option value="budgeting">Budgeting</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  name="frequency"
                  value={newHabit.frequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            {newHabit.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days of Week*
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(index)}
                      className={`px-3 py-1 rounded-md ${
                        newHabit.targetDays.includes(index)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {newHabit.frequency === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days of Month*
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1 rounded-md ${
                        newHabit.targetDays.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reminderEnabled"
                name="reminderEnabled"
                checked={newHabit.reminderEnabled}
                onChange={(e) =>
                  setNewHabit({
                    ...newHabit,
                    reminderEnabled: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label htmlFor="reminderEnabled" className="text-sm text-gray-700">
                Enable reminders
              </label>
            </div>
            
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={handleCreateHabit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Habit
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewHabit(emptyHabit);
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Habits list */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-2">Your Financial Habits</h3>
        
        {habits.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">You haven't created any financial habits yet.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-grow mb-3 md:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1 rounded-md ${categoryColors[habit.category]}`}>
                      {categoryIcons[habit.category]}
                    </div>
                    <h4 className="font-semibold text-lg">{habit.name}</h4>
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                      <Award className="h-3 w-3" />
                      {habit.streak > 0 ? `${habit.streak} streak` : 'No streak'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>{formatFrequency(habit)}</span>
                    {habit.description && <span>• {habit.description}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isHabitDueToday(habit) ? (
                    isCompletedToday(habit) ? (
                      <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Completed
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCompleteHabit(habit.id)}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Mark Complete
                      </button>
                    )
                  ) : (
                    <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                      <Clock className="mr-1 h-4 w-4" />
                      Not Due Today
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Best streaks */}
      {stats.currentStreaks.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Your Best Streaks</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.currentStreaks.slice(0, 3).map((streak, index) => (
              <div
                key={streak.habitId}
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  index === 0
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                {index === 0 ? (
                  <div className="flex-shrink-0 h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-amber-700" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-700" />
                  </div>
                )}
                <div className="flex-grow">
                  <h4 className="font-medium">{streak.name}</h4>
                  <p className="text-sm">
                    <span className="font-semibold">{streak.streak}</span> day streak
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Quick tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-blue-800">Tips for Building Financial Habits</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-700"></div>
            <span>Start with small, achievable habits that are easy to maintain.</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-700"></div>
            <span>Track your progress daily to build momentum and consistency.</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-700"></div>
            <span>Don't break the chain - maintaining a streak increases motivation.</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-700"></div>
            <span>If you miss a day, get back on track immediately - consistency matters more than perfection.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FinancialHabitTracker;