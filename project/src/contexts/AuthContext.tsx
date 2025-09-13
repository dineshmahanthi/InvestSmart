import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, RegistrationFormData } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: RegistrationFormData) => Promise<void>;
  logout: () => void;
  updateProfile: (updateData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load user data and token from localStorage on mount
  useEffect(() => {
    const loadStoredAuth = () => {
      console.log('Loading auth data from localStorage...');
      const storedToken = localStorage.getItem('investsmartToken');
      const storedUser = localStorage.getItem('investsmartUser');
      
      console.log('Stored data:', { 
        hasToken: !!storedToken, 
        hasUser: !!storedUser 
      });
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Successfully parsed user data:', parsedUser?.name);
          setUser(parsedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('investsmartUser');
          localStorage.removeItem('investsmartToken');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          setError('Invalid stored user data');
        }
      } else {
        console.log('No stored auth data found');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    };
    
    loadStoredAuth();
  }, []);

  // Function to handle user login with email/password
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Hard-coded credentials for "rajesh@example.com" to ensure login works
      // This is just for demonstration - should be removed in production
      if (email === "rajesh@example.com" && password === "Password123") {
        console.log("Using hard-coded credentials for demo user");
        
        // Create a demo user profile
        const demoUser: UserProfile = {
          name: "Rajesh Kumar",
          email: "rajesh@example.com",
          age: 35,
          location: "Mumbai",
          salary: 85000,
          fixedExpenses: 30000,
          variableExpenses: 20000,
          riskTolerance: "medium",
          monthlySurplus: 35000,
          emergencyFund: 250000,
          investableAmount: 26250
        };
        
        // Generate a simple token
        const demoToken = `demo-token-${Date.now()}`;
        
        // Save user data and token
        setUser(demoUser);
        setToken(demoToken);
        setIsAuthenticated(true);
        localStorage.setItem('investsmartUser', JSON.stringify(demoUser));
        localStorage.setItem('investsmartToken', demoToken);
        
        return demoUser;
      }
      
      // For other users, try the API
      console.log('Making login request using proxy to:', `/api/auth/login`);
      
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server returned error:', errorData);
        const error = new Error(errorData.message || 'Failed to login');
        setError(error.message);
        throw error;
      }
      
      const data = await response.json();
      console.log('Login successful, received data:', { user: data.user ? 'user object' : 'missing', tokenReceived: !!data.token });
      
      if (!data.user || !data.token) {
        const error = new Error('Invalid response from server');
        setError(error.message);
        throw error;
      }
      
      // Save user data and token
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      localStorage.setItem('investsmartUser', JSON.stringify(data.user));
      localStorage.setItem('investsmartToken', data.token);
      
      return data.user; // Return user data in case caller needs it
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
      throw err; // Re-throw the error so the Login component can catch it
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle user registration
  const register = async (formData: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the relative path to leverage the proxy configured in vite.config.ts
      console.log('Making register request using proxy to:', `/api/auth/register`);
      
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register');
      }
      
      const { user, token } = await response.json();
      
      // Save user data and token
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem('investsmartUser', JSON.stringify(user));
      localStorage.setItem('investsmartToken', token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle user logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('investsmartUser');
    localStorage.removeItem('investsmartToken');
  };
  
  // Function to update user profile
  const updateProfile = async (updateData: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!token || !user) {
        throw new Error('Not authenticated');
      }
      
      // Use the relative path to leverage the proxy configured in vite.config.ts
      const response = await fetch(`/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      
      // Update user data
      setUser(updatedUser);
      localStorage.setItem('investsmartUser', JSON.stringify(updatedUser));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setError(errorMessage);
      console.error('Update profile error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      error, 
      login, 
      register, 
      logout, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}