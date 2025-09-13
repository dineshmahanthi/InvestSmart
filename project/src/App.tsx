import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import FinBot from './components/chat/FinBot';

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calculator = lazy(() => import('./pages/Calculator'));
const Strategies = lazy(() => import('./pages/Strategies'));
const News = lazy(() => import('./pages/News'));
const StockPrediction = lazy(() => import('./pages/StockPrediction'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calculator" 
                element={
                  <ProtectedRoute>
                    <Calculator />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/strategies" 
                element={<Strategies />} 
              />
              <Route 
                path="/news" 
                element={
                  <ProtectedRoute>
                    <News />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/stocks" 
                element={
                  <ProtectedRoute>
                    <StockPrediction />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <FinBot />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;