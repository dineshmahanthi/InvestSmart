import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebugger: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const [localState, setLocalState] = useState({
    token: null as string | null,
    user: null as any
  });

  // Periodically check local storage to monitor changes
  useEffect(() => {
    const checkStorage = () => {
      const token = localStorage.getItem('investsmartToken');
      const userData = localStorage.getItem('investsmartUser');
      let parsedUser = null;
      
      try {
        if (userData) {
          parsedUser = JSON.parse(userData);
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
      
      setLocalState({
        token,
        user: parsedUser
      });
    };
    
    // Check immediately
    checkStorage();
    
    // And every second
    const interval = setInterval(checkStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  const testDirectApi = async () => {
    try {
      console.log('Testing direct API call');
      const response = await fetch('/api/auth/check-email/rajesh@example.com');
      const data = await response.json();
      console.log('API response:', data);
      alert(`API test result: ${JSON.stringify(data)}`);
    } catch (err) {
      console.error('API test failed:', err);
      alert(`API test failed: ${err}`);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('investsmartToken');
    localStorage.removeItem('investsmartUser');
    alert('Local storage cleared');
    window.location.reload();
  };

  return (
    <div className="p-4 mt-4 bg-gray-100 border border-gray-300 rounded">
      <h2 className="text-lg font-bold mb-2">Auth Debugger</h2>
      
      <div className="mb-4">
        <h3 className="font-medium">Context State:</h3>
        <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
          {JSON.stringify({
            isAuthenticated,
            isLoading,
            error,
            hasUser: !!user,
            userData: user
          }, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium">LocalStorage State:</h3>
        <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
          {JSON.stringify({
            hasToken: !!localState.token,
            tokenPreview: localState.token ? `${localState.token.substring(0, 10)}...` : null,
            hasUser: !!localState.user,
            userData: localState.user
          }, null, 2)}
        </pre>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={testDirectApi}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test API
        </button>
        <button 
          onClick={clearStorage}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Storage
        </button>
      </div>
    </div>
  );
};

export default AuthDebugger;
