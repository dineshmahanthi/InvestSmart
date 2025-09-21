import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, LineChart, Line
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { getExpenseSummary, initializeDevExpenses } from '../../services/expenseService';
import { ExpenseSummary, ExpenseCategory } from '../../types';

interface ExpenseDashboardProps {
  userId: string;
}

const ExpenseDashboard: React.FC<ExpenseDashboardProps> = ({ userId }) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);
  const [previousPeriodSummary, setPreviousPeriodSummary] = useState<ExpenseSummary | null>(null);

  // COLORS for charts
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
    '#82CA9D', '#FFC658', '#FF6B6B', '#6A6AFF', '#66CDAA',
    '#FFB347', '#C71585', '#20B2AA', '#FF69B4', '#DDA0DD'
  ];

  // Load expense summary data
  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      try {
        // Initialize dev data for demo purposes
        initializeDevExpenses(userId);
        
        const data = await getExpenseSummary(userId, period);
        setSummary(data);
        
        // If compare mode is enabled, fetch previous period data
        if (compareWithPrevious) {
          await loadPreviousPeriodData();
        } else {
          setPreviousPeriodSummary(null);
        }
      } catch (error) {
        console.error('Error loading expense summary:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSummary();
  }, [userId, period, compareWithPrevious]);

  // Load previous period data for comparison
  const loadPreviousPeriodData = async () => {
    try {
      const now = new Date();
      let startDate, endDate;
      
      switch (period) {
        case 'week':
          startDate = format(subMonths(now, 1), 'yyyy-MM-dd');
          endDate = format(now, 'yyyy-MM-dd');
          break;
        case 'month':
          startDate = format(subMonths(now, 1), 'yyyy-MM-dd');
          endDate = format(now, 'yyyy-MM-dd');
          break;
        case 'year':
          startDate = format(subMonths(now, 12), 'yyyy-MM-dd');
          endDate = format(now, 'yyyy-MM-dd');
          break;
      }
      
      const previousData = await getExpenseSummary(userId, 'custom', startDate, endDate);
      setPreviousPeriodSummary(previousData);
    } catch (error) {
      console.error('Error loading previous period data:', error);
    }
  };

  // Convert category summary to chart data
  const getCategoryChartData = () => {
    if (!summary) return [];
    
    return Object.entries(summary.categorySummary)
      .map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: amount
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">
            Amount: ₹{payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {((payload[0].value / summary!.totalSpent) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Format date for time series chart
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, period === 'year' ? 'MMM' : 'MMM d');
    } catch {
      return dateStr;
    }
  };

  // Get comparison percentage between current and previous period
  const getComparisonPercentage = () => {
    if (!summary || !previousPeriodSummary || previousPeriodSummary.totalSpent === 0) {
      return null;
    }
    
    const percentChange = ((summary.totalSpent - previousPeriodSummary.totalSpent) / previousPeriodSummary.totalSpent) * 100;
    return {
      value: Math.abs(percentChange).toFixed(1),
      isIncrease: percentChange > 0
    };
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
      {/* Period selection and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-semibold">Expense Dashboard</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="compareWithPrevious"
              checked={compareWithPrevious}
              onChange={e => setCompareWithPrevious(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="compareWithPrevious" className="text-sm">
              Compare with previous period
            </label>
          </div>
          
          <div className="bg-gray-100 rounded-md p-1 flex">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                period === 'week' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                period === 'month' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-3 py-1 text-sm rounded-md ${
                period === 'year' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {summary ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
              <h3 className="text-blue-800 text-sm font-medium mb-2">Total Spent</h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">₹{summary.totalSpent.toLocaleString()}</span>
                
                {compareWithPrevious && getComparisonPercentage() && (
                  <span className={`ml-2 text-sm ${
                    getComparisonPercentage()!.isIncrease ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {getComparisonPercentage()!.isIncrease ? '↑' : '↓'} 
                    {getComparisonPercentage()!.value}%
                  </span>
                )}
              </div>
              <p className="text-blue-700 text-xs mt-2">
                {period === 'week' ? 'This week' : period === 'month' ? 'This month' : 'This year'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
              <h3 className="text-green-800 text-sm font-medium mb-2">Top Category</h3>
              {Object.entries(summary.categorySummary).length > 0 ? (
                <>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">
                      {formatCategoryName(
                        Object.entries(summary.categorySummary)
                          .sort((a, b) => b[1] - a[1])[0][0] as ExpenseCategory
                      )}
                    </span>
                  </div>
                  <p className="text-green-700 text-xs mt-2">
                    ₹{Object.entries(summary.categorySummary)
                      .sort((a, b) => b[1] - a[1])[0][1].toLocaleString()} spent
                  </p>
                </>
              ) : (
                <p className="text-green-700">No data available</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
              <h3 className="text-purple-800 text-sm font-medium mb-2">Budget Status</h3>
              {summary.budgetStatus.length > 0 ? (
                <>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">
                      {summary.budgetStatus.filter(b => b.percentUsed > 100).length}
                    </span>
                  </div>
                  <p className="text-purple-700 text-xs mt-2">
                    Budget{summary.budgetStatus.filter(b => b.percentUsed > 100).length !== 1 ? 's' : ''} exceeded
                  </p>
                </>
              ) : (
                <p className="text-purple-700">No budgets set</p>
              )}
            </div>
          </div>

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-medium mb-4">Spending by Category</h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoryChartData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getCategoryChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Spending trend */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-medium mb-4">Spending Trend</h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={summary.timeSeries}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                    />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`₹${value}`, 'Amount']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Expenses"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    {compareWithPrevious && previousPeriodSummary && (
                      <Line
                        type="monotone"
                        dataKey="amount"
                        name="Previous Period"
                        stroke="#82ca9d"
                        data={previousPeriodSummary.timeSeries}
                        strokeDasharray="5 5"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget status */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 lg:col-span-2">
              <h3 className="text-lg font-medium mb-4">Budget Status</h3>
              
              {summary.budgetStatus.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No budgets set. Set budgets to track your spending limits!</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={summary.budgetStatus}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category" 
                        tickFormatter={formatCategoryName} 
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          `₹${value}`, 
                          name === 'budgeted' ? 'Budget' : name === 'spent' ? 'Spent' : 'Remaining'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="budgeted" fill="#8884d8" name="Budget" />
                      <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">No expense data available. Start tracking your expenses!</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseDashboard;