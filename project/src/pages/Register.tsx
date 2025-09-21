import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, User, Briefcase, TrendingUp, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RegistrationFormData, RiskTolerance, ServerRegistrationData } from '../types';
import { calculateFinancialMetrics } from '../services/investmentService';
import { formatIndianCurrency } from '../services/marketService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Register = () => {
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 30,
    location: '',
    photoUrl: '',
    salary: 75000,
    fixedExpenses: 25000,
    variableExpenses: 15000,
    riskTolerance: 'medium',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const financialMetrics = calculateFinancialMetrics({
    salary: formData.salary,
    fixedExpenses: formData.fixedExpenses,
    variableExpenses: formData.variableExpenses,
  });

  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (!validatePassword(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.age) {
        newErrors.age = 'Age is required';
      } else if (formData.age < 18) {
        newErrors.age = 'You must be at least 18 years old';
      }
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }
    
    if (currentStep === 2) {
      if (!formData.salary) newErrors.salary = 'Salary is required';
      if (!formData.fixedExpenses) newErrors.fixedExpenses = 'Fixed expenses is required';
      if (!formData.variableExpenses) newErrors.variableExpenses = 'Variable expenses is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // OTP functions have been removed

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' || name === 'salary' || name === 'fixedExpenses' || name === 'variableExpenses' 
        ? Number(value) 
        : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      try {
        // Set loading state
        setErrors({});
        setIsSubmitting(true);
        
        // Create a registration data object with all required fields
        const registrationData: ServerRegistrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword, // Include confirmPassword for server validation
          age: formData.age,
          location: formData.location,
          photoUrl: formData.photoUrl,
          salary: formData.salary,
          fixedExpenses: formData.fixedExpenses,
          variableExpenses: formData.variableExpenses,
          riskTolerance: formData.riskTolerance,
          // Include calculated metrics
          monthlySurplus: financialMetrics.monthlySurplus,
          emergencyFund: financialMetrics.emergencyFund,
          investableAmount: financialMetrics.investableAmount
        };
        
        // Register the user in the database
        await registerUser(registrationData);
        
        console.log("User successfully registered and logged in");
        
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Failed to register. Please try again.';
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          // Handle specific error cases
          if (errorMessage.includes('already exists')) {
            setErrors({ ...errors, email: 'A user with this email already exists' });
            setStep(1); // Return to first step to fix email
            return;
          } else if (errorMessage.includes('Password must be')) {
            setErrors({ ...errors, password: errorMessage });
            setStep(1); // Return to first step to fix password
            return;
          } else if (errorMessage.includes('valid email')) {
            setErrors({ ...errors, email: 'Please enter a valid email address' });
            setStep(1); // Return to first step to fix email
            return;
          }
        }
        
        setErrors({ 
          ...errors, 
          submit: errorMessage
        });
        
        // Display alert with more detailed error information
        console.log('Detailed error information:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center mb-2">Create Your Financial Profile</h1>
            <p className="text-gray-600 text-center mb-6">
              Get personalized investment recommendations based on your profile
            </p>
            
            {renderStepIndicator()}
            
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Details */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <User size={24} className="text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold">Personal Details</h2>
                  </div>
                  
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <Mail size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <Lock size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <Lock size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
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
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Photo (Optional)
                    </label>
                    <div className="flex items-start gap-4">
                      {/* Photo Preview */}
                      {formData.photoUrl ? (
                        <div className="relative w-24 h-24">
                          <img
                            src={formData.photoUrl}
                            alt="Profile preview"
                            className="w-24 h-24 rounded-full object-cover border border-gray-300"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/100?text=Error";
                              e.currentTarget.alt = "Invalid image URL";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, photoUrl: ''})}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg font-semibold">
                          {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      
                      {/* URL Input */}
                      <div className="flex-grow">
                        <div className="space-y-3">
                          <div>
                            <input
                              type="text"
                              id="photoUrl"
                              name="photoUrl"
                              value={formData.photoUrl || ''}
                              onChange={handleInputChange}
                              placeholder="Enter photo URL"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              You can enter a URL to your profile photo
                            </p>
                          </div>
                          
                          {/* Note: File upload will be added after registration */}
                          <div className="text-xs text-gray-500">
                            <p>* You'll be able to upload a photo directly after registration</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Try these sample photos:</p>
                            <div className="flex gap-2">
                              <button 
                                type="button" 
                                className="text-xs text-blue-600 hover:underline"
                                onClick={() => setFormData({...formData, photoUrl: "https://randomuser.me/api/portraits/men/44.jpg"})}
                              >
                                Sample 1
                              </button>
                              <button 
                                type="button" 
                                className="text-xs text-blue-600 hover:underline"
                                onClick={() => setFormData({...formData, photoUrl: "https://randomuser.me/api/portraits/women/66.jpg"})}
                              >
                                Sample 2
                              </button>
                              <button 
                                type="button" 
                                className="text-xs text-blue-600 hover:underline"
                                onClick={() => setFormData({...formData, photoUrl: "https://randomuser.me/api/portraits/men/32.jpg"})}
                              >
                                Sample 3
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Financial Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <Briefcase size={24} className="text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold">Financial Information</h2>
                  </div>
                  
                  <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Income (₹)
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
                    <label htmlFor="fixedExpenses" className="block text-sm font-medium text-gray-700 mb-1">
                      Fixed Monthly Expenses (₹)
                    </label>
                    <p className="text-xs text-gray-500 mb-1">
                      Rent, EMIs, utilities, insurance, etc.
                    </p>
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
                    <p className="text-xs text-gray-500 mb-1">
                      Food, entertainment, shopping, travel, etc.
                    </p>
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
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-medium text-blue-800 mb-2">Monthly Financial Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Income:</span>
                        <span className="font-medium">{formatIndianCurrency(formData.salary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expenses:</span>
                        <span className="font-medium">{formatIndianCurrency(formData.fixedExpenses + formData.variableExpenses)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-700 font-medium">Monthly Surplus:</span>
                        <span className="font-bold text-green-600">{formatIndianCurrency(financialMetrics.monthlySurplus)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Investment Preferences */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <TrendingUp size={24} className="text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold">Investment Preferences</h2>
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
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.riskTolerance === 'low' && 'Priority on capital preservation with steady returns'}
                      {formData.riskTolerance === 'medium' && 'Balance between growth and stability'}
                      {formData.riskTolerance === 'high' && 'Focus on maximum growth, comfortable with volatility'}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-medium text-blue-800 mb-3">Your Financial Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Surplus:</span>
                        <span className="font-medium">{formatIndianCurrency(financialMetrics.monthlySurplus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recommended Emergency Fund:</span>
                        <span className="font-medium">{formatIndianCurrency(financialMetrics.emergencyFund)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-700 font-medium">Monthly Investment Amount:</span>
                        <span className="font-bold text-green-600">{formatIndianCurrency(financialMetrics.investableAmount)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Expected Returns (Annual)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`p-3 rounded-md text-center ${
                        formData.riskTolerance === 'low' 
                          ? 'bg-green-100 border-2 border-green-500' 
                          : 'bg-gray-100'
                      }`}>
                        <div className="font-medium">Conservative</div>
                        <div className="text-lg font-bold text-green-700">7-9%</div>
                      </div>
                      <div className={`p-3 rounded-md text-center ${
                        formData.riskTolerance === 'medium' 
                          ? 'bg-yellow-100 border-2 border-yellow-500' 
                          : 'bg-gray-100'
                      }`}>
                        <div className="font-medium">Balanced</div>
                        <div className="text-lg font-bold text-yellow-700">12-14%</div>
                      </div>
                      <div className={`p-3 rounded-md text-center ${
                        formData.riskTolerance === 'high' 
                          ? 'bg-red-100 border-2 border-red-500' 
                          : 'bg-gray-100'
                      }`}>
                        <div className="font-medium">Aggressive</div>
                        <div className="text-lg font-bold text-red-700">15-20%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.submit && (
                <div className="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {errors.submit}
                </div>
              )}
                
              <div className="mt-8 flex justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} className="mr-2" /> Previous
                  </button>
                ) : (
                  <div></div>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Next <ChevronRight size={16} className="ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Profile...
                      </>
                    ) : (
                      'Complete Profile'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;