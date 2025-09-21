import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  PlusCircle, Search, Calendar, CreditCard, Tag, Edit2, Trash2, Filter, ArrowDownUp
} from 'lucide-react';
import { 
  getUserExpenses, createExpense, updateExpense, deleteExpense, initializeDevExpenses 
} from '../../services/expenseService';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';

interface ExpenseTrackerProps {
  userId: string;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ userId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | ''>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Form state for adding/editing expense
  const [expenseForm, setExpenseForm] = useState<{
    amount: number;
    description: string;
    category: ExpenseCategory;
    date: string;
    paymentMethod: PaymentMethod;
    location: string;
    isRecurring: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    tags: string;
  }>({
    amount: 0,
    description: '',
    category: 'other',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'cash',
    location: '',
    isRecurring: false,
    recurringFrequency: undefined,
    tags: '',
  });

  // Load expenses on mount
  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true);
      try {
        // Initialize dev data for demo purposes
        initializeDevExpenses(userId);
        
        const userExpenses = await getUserExpenses(userId);
        setExpenses(userExpenses);
        setFilteredExpenses(userExpenses);
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [userId]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        expense => 
          expense.description.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query) ||
          expense.location?.toLowerCase().includes(query) ||
          expense.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }

    // Apply sorting
    switch (sortOrder) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchQuery, filterCategory, sortOrder]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setExpenseForm(prev => ({ 
        ...prev, 
        [name]: checked,
        // Clear recurringFrequency if isRecurring is false
        ...(name === 'isRecurring' && !checked ? { recurringFrequency: undefined } : {})
      }));
    } else if (name === 'amount') {
      setExpenseForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setExpenseForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setExpenseForm({
      amount: 0,
      description: '',
      category: 'other',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'cash',
      location: '',
      isRecurring: false,
      recurringFrequency: undefined,
      tags: '',
    });
    setIsAddingExpense(false);
    setIsEditingExpense(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert tags string to array
      const tagsArray = expenseForm.tags
        ? expenseForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : undefined;
      
      const expenseData = {
        ...expenseForm,
        tags: tagsArray,
      };

      let updatedExpense;
      
      if (isEditingExpense) {
        updatedExpense = await updateExpense(isEditingExpense, expenseData);
        if (updatedExpense) {
          setExpenses(expenses.map(e => e.id === isEditingExpense ? updatedExpense! : e));
        }
      } else {
        updatedExpense = await createExpense(userId, expenseData);
        setExpenses([updatedExpense, ...expenses]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setIsEditingExpense(expense.id);
    setExpenseForm({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date.split('T')[0], // Get just the date part
      paymentMethod: expense.paymentMethod,
      location: expense.location || '',
      isRecurring: expense.isRecurring,
      recurringFrequency: expense.recurringFrequency,
      tags: expense.tags?.join(', ') || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const success = await deleteExpense(id);
        if (success) {
          setExpenses(expenses.filter(e => e.id !== id));
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  // Helper function to get color for category
  const getCategoryColor = (category: ExpenseCategory) => {
    const categoryColors: { [key in ExpenseCategory]: string } = {
      housing: 'bg-blue-100 text-blue-800',
      utilities: 'bg-cyan-100 text-cyan-800',
      groceries: 'bg-green-100 text-green-800',
      dining: 'bg-yellow-100 text-yellow-800',
      transportation: 'bg-orange-100 text-orange-800',
      healthcare: 'bg-red-100 text-red-800',
      entertainment: 'bg-purple-100 text-purple-800',
      shopping: 'bg-pink-100 text-pink-800',
      education: 'bg-indigo-100 text-indigo-800',
      travel: 'bg-teal-100 text-teal-800',
      investments: 'bg-emerald-100 text-emerald-800',
      debt: 'bg-rose-100 text-rose-800',
      insurance: 'bg-sky-100 text-sky-800',
      gifts: 'bg-violet-100 text-violet-800',
      other: 'bg-gray-100 text-gray-800',
    };
    
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
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
        <h2 className="text-2xl font-semibold">Your Expenses</h2>
        <button
          onClick={() => setIsAddingExpense(true)}
          className="mt-2 sm:mt-0 flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Expense
        </button>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as ExpenseCategory | '')}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">All Categories</option>
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
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="relative">
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
            <ArrowDownUp className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Add/Edit expense form */}
      {(isAddingExpense || isEditingExpense) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {isEditingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)*
                </label>
                <input
                  type="number"
                  name="amount"
                  value={expenseForm.amount}
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
                  Date*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={expenseForm.date}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <input
                  type="text"
                  name="description"
                  value={expenseForm.description}
                  onChange={handleFormChange}
                  placeholder="What was this expense for?"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  name="category"
                  value={expenseForm.category}
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
                  Payment Method*
                </label>
                <div className="relative">
                  <select
                    name="paymentMethod"
                    value={expenseForm.paymentMethod}
                    onChange={handleFormChange}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="net_banking">Net Banking</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="other">Other</option>
                  </select>
                  <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  value={expenseForm.location}
                  onChange={handleFormChange}
                  placeholder="Where was this expense incurred?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (Comma separated)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="tags"
                    value={expenseForm.tags}
                    onChange={handleFormChange}
                    placeholder="e.g., work, personal, trip"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md"
                  />
                  <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={expenseForm.isRecurring}
                  onChange={handleFormChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="isRecurring" className="text-sm text-gray-700">
                  This is a recurring expense
                </label>
              </div>
              
              {expenseForm.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    name="recurringFrequency"
                    value={expenseForm.recurringFrequency}
                    onChange={handleFormChange}
                    required={expenseForm.isRecurring}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
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
                {isEditingExpense ? 'Update' : 'Add'} Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses list */}
      <div className="overflow-x-auto">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <p className="text-gray-500">
              No expenses found. Start by adding your first expense!
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Description</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm">{formatDate(expense.date)}</td>
                  <td className="py-4 px-4">
                    <div className="font-medium">{expense.description}</div>
                    {expense.location && (
                      <div className="text-xs text-gray-500">{expense.location}</div>
                    )}
                    {expense.isRecurring && (
                      <span className="inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded mt-1">
                        Recurring ({expense.recurringFrequency})
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${getCategoryColor(expense.category)}`}>
                      {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;