import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AuthLanding = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            {/* Left column with logo and intro */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={40} className="text-white" />
                <h1 className="text-3xl font-bold">InvestSmart</h1>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                AI-Powered Investment Advice for Indian Investors
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Get personalized investment recommendations based on your financial profile, risk tolerance, and goals.
              </p>
            </div>
            
            {/* Right column with auth options */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Get Started Today</h3>
                
                <div className="space-y-4">
                  <Link 
                    to="/login" 
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium text-center transition-colors"
                  >
                    Sign In with Existing Account
                  </Link>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-sm text-gray-500">OR</span>
                    </div>
                  </div>
                  
                  <Link 
                    to="/register" 
                    className="block w-full border-2 border-blue-600 bg-white hover:bg-blue-50 text-blue-600 py-3 px-4 rounded-md font-medium text-center transition-colors"
                  >
                    Create New Account
                  </Link>
                </div>
                
                <div className="mt-8 text-center">
                  <Link 
                    to="/calculator" 
                    className="inline-flex items-center text-gray-600 hover:text-blue-600 text-sm"
                  >
                    Try our calculator without signing up <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuthLanding;