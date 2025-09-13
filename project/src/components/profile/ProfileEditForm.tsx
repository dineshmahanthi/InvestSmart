import { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { calculateFinancialMetrics } from '../../services/investmentService';
import { formatIndianCurrency } from '../../services/marketService';

interface ProfileEditFormProps {
  onCancel: () => void;
}

const ProfileEditForm = ({ onCancel }: ProfileEditFormProps) => {
  const { user, updateProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 0,
    location: '',
    salary: 0,
    additionalIncome: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    riskTolerance: 'medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        age: user.age,
        location: user.location || '',
        salary: user.salary,
        additionalIncome: user.additionalIncome || 0,
        fixedExpenses: user.fixedExpenses,
        variableExpenses: user.variableExpenses,
        riskTolerance: user.riskTolerance,
      });
    }
  }, [user]);

  // Calculate financial metrics based on current form data
  const financialMetrics = calculateFinancialMetrics({
    salary: formData.salary || 0,
    additionalIncome: formData.additionalIncome || 0,
    fixedExpenses: formData.fixedExpenses || 0,
    variableExpenses: formData.variableExpenses || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' || name === 'salary' || name === 'additionalIncome' || name === 'fixedExpenses' || name === 'variableExpenses'
        ? Number(value)
        : value,
    });
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (formData.age && formData.age < 18) newErrors.age = 'Age must be at least 18';
    if (!formData.salary) newErrors.salary = 'Salary is required';
    if (!formData.fixedExpenses) newErrors.fixedExpenses = 'Fixed expenses is required';
    if (!formData.variableExpenses) newErrors.variableExpenses = 'Variable expenses is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Include calculated financial metrics in the update
        const updatedData = {
          ...formData,
          monthlySurplus: financialMetrics.monthlySurplus,
          emergencyFund: financialMetrics.emergencyFund,
          investableAmount: financialMetrics.investableAmount,
        };
        
        await updateProfile(updatedData);
        setSuccessMessage('Profile updated successfully!');
        
        // Clear success message after 3 seconds and close the form
        setTimeout(() => {
          setSuccessMessage('');
          onCancel(); // Close the edit form and show the updated dashboard
        }, 2000);
      } catch (error) {
        console.error('Failed to update profile:', error);
        setErrors({ 
          submit: error instanceof Error ? error.message : 'Failed to update profile' 
        });
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold mb-6">Edit Your Profile</h2>
      
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      
      {errors.submit && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="18"
              max="100"
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.age ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age}</p>}
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, State"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700 mb-1">
              Risk Tolerance
            </label>
            <select
              id="riskTolerance"
              name="riskTolerance"
              value={formData.riskTolerance}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Conservative (Low Risk)</option>
              <option value="medium">Balanced (Medium Risk)</option>
              <option value="high">Aggressive (High Risk)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Salary (₹)
            </label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              min="0"
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.salary ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.salary && <p className="mt-1 text-sm text-red-500">{errors.salary}</p>}
          </div>
          
          <div>
            <label htmlFor="additionalIncome" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Monthly Income (₹)
            </label>
            <input
              type="number"
              id="additionalIncome"
              name="additionalIncome"
              value={formData.additionalIncome}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Other income sources like rent, dividends, etc.</p>
          </div>
          
          <div>
            <label htmlFor="fixedExpenses" className="block text-sm font-medium text-gray-700 mb-1">
              Fixed Monthly Expenses (₹)
            </label>
            <input
              type="number"
              id="fixedExpenses"
              name="fixedExpenses"
              value={formData.fixedExpenses}
              onChange={handleInputChange}
              min="0"
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.fixedExpenses ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fixedExpenses && <p className="mt-1 text-sm text-red-500">{errors.fixedExpenses}</p>}
          </div>
          
          <div>
            <label htmlFor="variableExpenses" className="block text-sm font-medium text-gray-700 mb-1">
              Variable Monthly Expenses (₹)
            </label>
            <input
              type="number"
              id="variableExpenses"
              name="variableExpenses"
              value={formData.variableExpenses}
              onChange={handleInputChange}
              min="0"
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.variableExpenses ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.variableExpenses && <p className="mt-1 text-sm text-red-500">{errors.variableExpenses}</p>}
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h3 className="font-medium text-blue-800 mb-2">Updated Financial Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Total Monthly Income:</p>
              <p className="font-medium">{formatIndianCurrency((formData.salary || 0) + (formData.additionalIncome || 0))}</p>
            </div>
            <div>
              <p className="text-gray-600">Monthly Surplus:</p>
              <p className="font-medium">{formatIndianCurrency(financialMetrics.monthlySurplus)}</p>
            </div>
            <div>
              <p className="text-gray-600">Emergency Fund:</p>
              <p className="font-medium">{formatIndianCurrency(financialMetrics.emergencyFund)}</p>
            </div>
            <div>
              <p className="text-gray-600">Monthly Investment Amount:</p>
              <p className="font-medium text-green-600">{formatIndianCurrency(financialMetrics.investableAmount)}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;
