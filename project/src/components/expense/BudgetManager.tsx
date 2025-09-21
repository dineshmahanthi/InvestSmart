import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  PlusCircle, AlertCircle, Edit2, Trash2, AlertTriangle
} from 'lucide-react';
import {
  getUserBudgets, createBudget, updateBudget, deleteBudget, initializeDevExpenses, updateBudgetSpending
} from '../../services/expenseService';
import { Budget, ExpenseCategory } from '../../types';

interface BudgetManagerProps {
  userId: string;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ userId }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState<string | null>(null);

  // Form state for adding/editing budget
  const [budgetForm, setBudgetForm] = useState<{
    category: ExpenseCategory;
    amount: number;
    period: 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
    alertThreshold: number;
  }>({
    category: 'other',
    amount: 0,
    period: 'monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    alertThreshold: 80,
  });

  // Load budgets on mount
  useEffect(() => {
    const loadBudgets = async () => {
      setLoading(true);
      try {
        // Initialize dev data for demo purposes
        initializeDevExpenses(userId);
        
        // Add a short delay to ensure data is initialized
        setTimeout(async () => {
          // Update budget spending calculations explicitly
          await updateBudgetSpending(userId);
          
          // Now get the updated budgets with correct spending amounts
          const userBudgets = await getUserBudgets(userId);
          setBudgets(userBudgets);
          setLoading(false);
        }, 300);
      } catch (error) {
        console.error('Error loading budgets:', error);
        setLoading(false);
      }
    };

    loadBudgets();
  }, [userId]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setBudgetForm(prev => ({ 
        ...prev, 
        [name]: parseFloat(value) || 0
      }));
    } else {
      setBudgetForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setBudgetForm({
      category: 'other',
      amount: 0,
      period: 'monthly',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      alertThreshold: 80,
    });
    setIsAddingBudget(false);
    setIsEditingBudget(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditingBudget) {
        const updatedBudget = await updateBudget(isEditingBudget, budgetForm);
        if (updatedBudget) {
          setBudgets(budgets.map(b => b.id === isEditingBudget ? updatedBudget : b));
        }
      } else {
        const newBudget = await createBudget(userId, budgetForm);
        setBudgets([...budgets, newBudget]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setIsEditingBudget(budget.id);
    setBudgetForm({
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      startDate: budget.startDate.split('T')[0], // Get just the date part
      endDate: budget.endDate ? budget.endDate.split('T')[0] : '',
      alertThreshold: budget.alertThreshold,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const success = await deleteBudget(id);
        if (success) {
          setBudgets(budgets.filter(b => b.id !== id));
        }
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  // We'll keep this logic in case we need to use it later in the UI
  // const getPercentageColor = (percentUsed: number) => {
  //   if (percentUsed >= 100) {
  //     return 'text-red-600';
  //   } else if (percentUsed >= 80) {
  //     return 'text-yellow-600';
  //   } else if (percentUsed >= 60) {
  //     return 'text-blue-600';
  //   } else {
  //     return 'text-green-600';
  //   }
  // };

  // Format period string for display
  const formatPeriod = (period: 'weekly' | 'monthly' | 'yearly', startDate: string) => {
    try {
      const date = new Date(startDate);
      
      switch (period) {
        case 'weekly':
          return `Week of ${format(date, 'MMM d, yyyy')}`;
        case 'monthly':
          return format(date, 'MMMM yyyy');
        case 'yearly':
          return format(date, 'yyyy');
        default:
          return startDate;
      }
    } catch {
      return startDate;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-semibold">Budget Management</h2>
        <button
          onClick={() => setIsAddingBudget(true)}
          className="mt-2 sm:mt-0 flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Budget
        </button>
      </div>

      {/* Add/Edit budget form */}
      {(isAddingBudget || isEditingBudget) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {isEditingBudget ? 'Edit Budget' : 'Create New Budget'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  name="category"
                  value={budgetForm.category}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="housing">Housing</option>
                  <option value="utilities">Utilities</option>
                  <option value="groceries">Groceries</option>
                  <option value="dining">Dining</option>
                  <option value="transportation">Transportation</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="education">Education</option>
                  <option value="travel">Travel</option>
                  <option value="investments">Investments</option>
                  <option value="debt">Debt</option>
                  <option value="insurance">Insurance</option>
                  <option value="gifts">Gifts</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)*
                </label>
                <input
                  type="number"
                  name="amount"
                  value={budgetForm.amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period*
                </label>
                <select
                  name="period"
                  value={budgetForm.period}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date*
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={budgetForm.startDate}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={budgetForm.endDate}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Threshold (%)
                </label>
                <input
                  type="range"
                  name="alertThreshold"
                  min="1"
                  max="100"
                  step="1"
                  value={budgetForm.alertThreshold}
                  onChange={handleFormChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Alert at {budgetForm.alertThreshold}% of budget</span>
                  <span>
                    {budgetForm.alertThreshold < 50 ? 'Early warning' : 
                     budgetForm.alertThreshold < 80 ? 'Moderate' : 'Late warning'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEditingBudget ? 'Update' : 'Create'} Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budgets list */}
      <div>
        {budgets.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <AlertCircle className="h-12 w-12 mx-auto text-blue-400 mb-3" />
            <p className="text-gray-600 mb-2">No budgets found</p>
            <p className="text-gray-500 text-sm">
              Create budgets to help manage your spending in different categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map(budget => {
              const percentUsed = (budget.currentSpending / budget.amount) * 100;
              // We'll use this color in the UI if needed later
              
              return (
                <div key={budget.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium capitalize">
                      {budget.category}
                    </h3>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    {formatPeriod(budget.period, budget.startDate)}
                  </p>
                  
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="font-medium">₹{budget.amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-gray-600">Spent:</span>
                    <span className={`font-medium ${percentUsed > 100 ? 'text-red-600' : ''}`}>
                      ₹{budget.currentSpending.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-sm text-gray-600">Remaining:</span>
                    <span className="font-medium">
                      {budget.currentSpending > budget.amount ? 
                        <span className="text-red-600">Exceeded by ₹{(budget.currentSpending - budget.amount).toLocaleString()}</span> : 
                        `₹${(budget.amount - budget.currentSpending).toLocaleString()}`
                      }
                    </span>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className={`text-xs font-semibold inline-block py-1 px-2 rounded ${
                          percentUsed >= 100 ? 'bg-red-200 text-red-800' : 
                          percentUsed >= budget.alertThreshold ? 'bg-yellow-200 text-yellow-800' : 
                          'bg-green-200 text-green-800'
                        }`}>
                          {percentUsed.toFixed(0)}%
                        </span>
                      </div>
                      {percentUsed >= budget.alertThreshold && (
                        <div className="text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          percentUsed >= 100 ? 'bg-red-500' : 
                          percentUsed >= budget.alertThreshold ? 'bg-yellow-500' : 
                          'bg-blue-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;