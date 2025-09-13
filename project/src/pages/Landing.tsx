import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, BarChart3, Shield, Target, LineChart } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { fetchNewsData } from '../services/newsService';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const { data: newsData } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNewsData,
  });

  const features = [
    {
      icon: <BarChart3 size={40} className="text-blue-600" />,
      title: 'Smart Surplus Calculation',
      description: 'Automatically calculate your investable surplus based on your income, expenses, and financial goals.',
    },
    {
      icon: <Target size={40} className="text-blue-600" />,
      title: 'Portfolio Optimization',
      description: 'Get personalized investment recommendations based on your risk tolerance and financial goals.',
    },
    {
      icon: <LineChart size={40} className="text-blue-600" />,
      title: 'Indian Market Focus',
      description: 'Investment recommendations specifically tailored for Indian investors and market conditions.',
    },
    {
      icon: <Shield size={40} className="text-blue-600" />,
      title: 'Risk Assessment',
      description: 'Comprehensive risk assessment to ensure your investments align with your comfort level.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-green-600 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI-Powered Investment Advice Tailored for Indian Investors
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Get personalized investment recommendations based on your financial profile, risk tolerance, and goals.
            </p>
            
            {/* Show different CTA based on authentication state */}
            {isAuthenticated ? (
              <div className="flex space-x-4">
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Go to Dashboard <ChevronRight size={20} className="ml-2" />
                </Link>
                <Link 
                  to="/strategies" 
                  className="inline-flex items-center bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors"
                >
                  View Strategies <ChevronRight size={20} className="ml-2" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/register" 
                  className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Create Account <ChevronRight size={20} className="ml-2" />
                </Link>
                <Link 
                  to="/calculator" 
                  className="inline-flex items-center bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors"
                >
                  Try Investment Calculator <ChevronRight size={20} className="ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 w-2/5 h-3/4 bg-white/5 rounded-l-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose InvestSmart</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with deep financial expertise to provide you with the best investment recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Latest Financial News</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsData?.slice(0, 3).map((news) => (
              <div key={news.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {news.imageUrl && (
                  <img 
                    src={news.imageUrl} 
                    alt={news.title} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="text-sm text-blue-600 font-medium mb-2">{news.category}</div>
                  <h3 className="text-xl font-semibold mb-3">{news.title}</h3>
                  <p className="text-gray-600 mb-4">{news.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{news.date}</span>
                    <span className="text-sm font-medium">{news.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            {/* Different content for authenticated and non-authenticated users */}
            {isAuthenticated ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Explore More Investment Opportunities</h2>
                <p className="text-xl mb-8 text-white/90">
                  Check out our strategies and tools to optimize your investment portfolio.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Link 
                    to="/dashboard" 
                    className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-md font-medium text-lg hover:bg-blue-50 transition-colors"
                  >
                    Your Dashboard <ChevronRight size={20} className="ml-2" />
                  </Link>
                  <Link 
                    to="/strategies" 
                    className="inline-flex items-center bg-transparent border border-white text-white px-8 py-4 rounded-md font-medium text-lg hover:bg-white/10 transition-colors"
                  >
                    Investment Strategies <ChevronRight size={20} className="ml-2" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Investment Journey?</h2>
                <p className="text-xl mb-8 text-white/90">
                  Get instant investment recommendations tailored to your financial profile.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Link 
                    to="/register" 
                    className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-md font-medium text-lg hover:bg-blue-50 transition-colors"
                  >
                    Create Account <ChevronRight size={20} className="ml-2" />
                  </Link>
                  <Link 
                    to="/calculator" 
                    className="inline-flex items-center bg-transparent border border-white text-white px-8 py-4 rounded-md font-medium text-lg hover:bg-white/10 transition-colors"
                  >
                    Try Our Calculator <ChevronRight size={20} className="ml-2" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;