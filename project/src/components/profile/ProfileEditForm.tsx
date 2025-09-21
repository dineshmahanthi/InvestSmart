import { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { calculateFinancialMetrics } from '../../services/investmentService';
import { formatIndianCurrency } from '../../services/marketService';
import { getAvatars, getRandomAvatars, generateFreshAvatar, AvatarImage } from '../../services/aiProfileService';
import { Sparkles, X, Check, ImageIcon, RefreshCw } from 'lucide-react';

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
    photoUrl: '',
  });
  const [avatars, setAvatars] = useState<AvatarImage[]>(getAvatars());
  const [showAvatars, setShowAvatars] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [photoError, setPhotoError] = useState<string>('');

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
        photoUrl: user.photoUrl || '',
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

  // Toggle avatar display
  const toggleAvatarsDisplay = () => {
    setShowAvatars(prev => !prev);
    if (!showAvatars) {
      // Generate fresh avatars when opening the selection
      setAvatars(getRandomAvatars(12));
    }
  };
  
  // Select an avatar
  const selectAvatar = (avatar: AvatarImage) => {
    setFormData(prev => ({
      ...prev,
      photoUrl: avatar.url
    }));
    
    // Hide avatars after selection
    setShowAvatars(false);
    
    setSuccessMessage('Avatar selected successfully!');
    
    // Clear success message after 2 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 2000);
  };
  
  // Generate new set of random avatars
  const refreshAvatars = () => {
    setAvatars(getRandomAvatars(12));
    setPhotoError('');
  };
  
  // Generate a single fresh avatar and select it
  const generateNewAvatar = () => {
    const freshAvatar = generateFreshAvatar();
    selectAvatar(freshAvatar);
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
        {/* Profile Photo Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Image Preview */}
            <div className="relative">
              {formData.photoUrl ? (
                <div className="relative">
                  <img 
                    src={formData.photoUrl} 
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      console.error('Image failed to load:', formData.photoUrl);
                      e.currentTarget.src = "https://via.placeholder.com/100?text=Error";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, photoUrl: ''})}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-xl">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              {/* Random Avatars Section */}
              <div className="space-y-3">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-purple-500" />
                      <label className="text-sm font-medium text-gray-700">
                        Choose a Random Avatar
                      </label>
                    </div>
                    
                    {/* Toggle button to show/hide avatars */}
                    <button
                      type="button"
                      onClick={toggleAvatarsDisplay}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showAvatars ? 'Hide Options' : 'Show Options'}
                    </button>
                  </div>
                  
                  {/* Avatar Gallery - Only shown when showAvatars is true */}
                  {showAvatars && (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {avatars.map((avatar) => (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => selectAvatar(avatar)}
                            className={`relative rounded-lg overflow-hidden transition-all hover:opacity-90 border-2 border-transparent hover:border-purple-300`}
                          >
                            <img 
                              src={avatar.url} 
                              alt={avatar.alt}
                              className="w-full aspect-square object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex justify-between mt-2">
                        {/* Refresh avatars button */}
                        <button
                          type="button"
                          onClick={refreshAvatars}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          <RefreshCw size={14} />
                          Refresh Options
                        </button>
                        
                        {/* Generate unique avatar button */}
                        <button
                          type="button"
                          onClick={generateNewAvatar}
                          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                        >
                          <Sparkles size={14} />
                          Random Avatar
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* Show selected avatar if one is selected and options are hidden */}
                  {!showAvatars && formData.photoUrl && (
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20">
                        <img 
                          src={formData.photoUrl} 
                          alt="Selected Avatar" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-tl-md">
                          <Check size={14} />
                        </div>
                      </div>
                      <div className="text-sm text-green-600">Avatar saved! Click "Show Options" to change.</div>
                    </div>
                  )}
                  
                  {/* Error message */}
                  {photoError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">{photoError}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Only show OR divider and URL input when avatars are not being displayed */}
              {!showAvatars && (
                <>
                  {/* OR divider */}
                  <div className="flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>
                  
                  {/* URL Input Section */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                      <ImageIcon size={16} />
                      Use a custom photo URL
                    </label>
                    <input
                      type="text"
                      id="photoUrl"
                      name="photoUrl"
                      value={formData.photoUrl || ''}
                      onChange={handleInputChange}
                      placeholder="Enter photo URL"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

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
