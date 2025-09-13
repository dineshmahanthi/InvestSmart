import { useState, useEffect } from 'react';
import { calculateTimeToGoal, formatTimePeriod } from '../../services/goalCalculatorService';
import { useAuth } from '../../contexts/AuthContext';
import { addMonths, format } from 'date-fns';

const PRESET_GOALS = [
  {
    type: 'car',
    name: 'Economy Car',
    amount: 600000,
  },
  {
    type: 'car',
    name: 'Mid-Range Car',
    amount: 1200000,
  },
  {
    type: 'car',
    name: 'Luxury Car',
    amount: 3000000,
  },
  {
    type: 'house',
    name: 'Apartment Down Payment',
    amount: 1500000,
  },
  {
    type: 'house',
    name: 'House Down Payment',
    amount: 3000000,
  },
  {
    type: 'house',
    name: 'Full House Payment',
    amount: 10000000,
  }
];

const SavingsGoalCalculator = () => {
  const { user } = useAuth();
  
  // State for form inputs
  const [goalType, setGoalType] = useState<string>('car');
  const [goalName, setGoalName] = useState<string>('New Car');
  const [targetAmount, setTargetAmount] = useState<number>(600000);
  const [currentSavings, setCurrentSavings] = useState<number>(0);
  const [monthlySavings, setMonthlySavings] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(4);
  
  // State for results
  const [timeToGoal, setTimeToGoal] = useState<number>(0);
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      // Estimate monthly savings from user profile (30% of surplus)
      const estimatedSavings = Math.round(user.monthlySurplus * 0.3);
      setMonthlySavings(estimatedSavings);
    }
  }, [user]);

  // When a preset goal is selected
  const handlePresetGoalChange = (amount: number, name: string) => {
    setTargetAmount(amount);
    setGoalName(name);
    setShowResults(false);
  };

  // Calculate time to goal
  const calculateGoal = () => {
    if (targetAmount <= 0 || monthlySavings <= 0) {
      alert('Please enter valid amounts for your goal and monthly savings.');
      return;
    }
    
    const months = calculateTimeToGoal(
      targetAmount,
      currentSavings,
      monthlySavings,
      interestRate / 100
    );
    
    setTimeToGoal(months);
    setFormattedTime(formatTimePeriod(months));
    
    // Calculate target date
    const targetDateObj = addMonths(new Date(), months);
    setTargetDate(format(targetDateObj, 'MMMM yyyy'));
    
    setShowResults(true);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        Savings Goal Calculator
      </h2>
      
      {/* Goal Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          I want to save for a:
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setGoalType('car')}
            className={`flex-1 py-3 px-4 rounded-md ${
              goalType === 'car' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Car
          </button>
          <button
            type="button"
            onClick={() => setGoalType('house')}
            className={`flex-1 py-3 px-4 rounded-md ${
              goalType === 'house' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            House
          </button>
        </div>
      </div>
      
      {/* Preset Goals */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Common {goalType} options:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_GOALS
            .filter(goal => goal.type === goalType)
            .map((goal, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePresetGoalChange(goal.amount, goal.name)}
                className={`py-2 px-3 rounded-md border ${
                  targetAmount === goal.amount
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{goal.name}</div>
                <div className="text-sm">{formatCurrency(goal.amount)}</div>
              </button>
            ))
          }
        </div>
      </div>
      
      {/* Custom Goal Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Goal Name
          </label>
          <input
            type="text"
            value={goalName}
            onChange={(e) => {
              setGoalName(e.target.value);
              setShowResults(false);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Amount (₹)
          </label>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => {
              setTargetAmount(Number(e.target.value));
              setShowResults(false);
            }}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Savings (₹)
          </label>
          <input
            type="number"
            value={currentSavings}
            onChange={(e) => {
              setCurrentSavings(Number(e.target.value));
              setShowResults(false);
            }}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Savings (₹)
          </label>
          <input
            type="number"
            value={monthlySavings}
            onChange={(e) => {
              setMonthlySavings(Number(e.target.value));
              setShowResults(false);
            }}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Interest Rate (%)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => {
              setInterestRate(Number(e.target.value));
              setShowResults(false);
            }}
            min="0"
            max="20"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-end">
          <button
            type="button"
            onClick={calculateGoal}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate
          </button>
        </div>
      </div>
      
      {/* Results Section */}
      {showResults && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-4">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">
            Your {goalName} Savings Plan
          </h3>
          
          {timeToGoal === Infinity ? (
            <p className="text-red-600 font-medium mb-3">
              Your goal is not achievable with the current monthly savings. Please increase your monthly savings amount.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 mb-1">Time to reach goal:</p>
                  <p className="text-xl font-bold text-blue-700">{formattedTime}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 mb-1">Target completion date:</p>
                  <p className="text-xl font-bold text-blue-700">{targetDate}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 mb-1">Goal amount:</p>
                  <p className="text-xl font-bold">{formatCurrency(targetAmount)}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 mb-1">Total to be saved:</p>
                  <p className="text-xl font-bold">{formatCurrency(targetAmount - currentSavings)}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <h4 className="font-medium mb-2">Financial insights:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1">•</div>
                    <div>
                      You'll need to save <span className="font-semibold">{formatCurrency(monthlySavings)}</span> every month to reach your goal by {targetDate}.
                    </div>
                  </li>
                  
                  {user && monthlySavings > user.monthlySurplus * 0.5 && (
                    <li className="flex items-start text-amber-700">
                      <div className="mr-2 mt-1">⚠️</div>
                      <div>
                        Your monthly savings target is more than 50% of your monthly surplus. Consider extending your timeline or increasing your income.
                      </div>
                    </li>
                  )}
                  
                  {interestRate > 0 && (
                    <li className="flex items-start">
                      <div className="mr-2 mt-1">•</div>
                      <div>
                        With a {interestRate}% interest rate, you'll earn approximately {formatCurrency((targetAmount - currentSavings) - (monthlySavings * timeToGoal))} in interest.
                      </div>
                    </li>
                  )}
                  
                  {goalType === 'car' && (
                    <li className="flex items-start">
                      <div className="mr-2 mt-1">•</div>
                      <div>
                        Consider researching car loan options with EMIs comparable to your monthly savings amount for potentially faster acquisition.
                      </div>
                    </li>
                  )}
                  
                  {goalType === 'house' && (
                    <li className="flex items-start">
                      <div className="mr-2 mt-1">•</div>
                      <div>
                        For home purchases, aim to save at least 20% for a down payment to avoid higher interest rates and mortgage insurance.
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
      
      <div className="text-sm text-gray-500 mt-4">
        <p>
          <strong>Note:</strong> This calculator provides estimates based on the information you provide. 
          Actual results may vary based on changes in interest rates, your saving patterns, and other financial factors.
        </p>
      </div>
    </div>
  );
};

export default SavingsGoalCalculator;
