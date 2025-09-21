import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, IndianRupee, AlertCircle, PiggyBank, ArrowRight, Edit2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generatePortfolioRecommendations } from '../services/investmentService';
import { formatIndianCurrency } from '../services/marketService';
import { useQuery } from '@tanstack/react-query';
import { fetchNewsData } from '../services/newsService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import InvestmentDashboardIcon from '../components/ui/InvestmentDashboardIcon';
import ProfileEditForm from '../components/profile/ProfileEditForm';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: newsData } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNewsData,
  });
  
  const [portfolio, setPortfolio] = useState<ReturnType<typeof generatePortfolioRecommendations> | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      const recommendations = generatePortfolioRecommendations(user);
      setPortfolio(recommendations);
    }
  }, [user]);

  // If user is not authenticated, redirect to login
  // In a real application, you would typically use a protected route component
  // or a router navigation guard for this, but we'll handle it directly here
  if (!user || !portfolio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const pieChartData = portfolio.investments.map((item) => ({
    name: item.name,
    value: item.allocation * 100,
    amount: item.amount,
    category: item.category,
    returns: item.returns,
  }));

  const barChartData = [
    { name: 'Monthly Income', amount: user.salary },
    { name: 'Fixed Expenses', amount: user.fixedExpenses },
    { name: 'Variable Expenses', amount: user.variableExpenses },
    { name: 'Investable Amount', amount: user.investableAmount },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8 flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-4 flex items-center">
              {user.photoUrl ? (
                <div className="relative">
                  <img 
                    src={user.photoUrl} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
                    onError={(e) => {
                      console.error('Dashboard - Image failed to load:', user.photoUrl);
                      // Replace with initials avatar if image fails to load
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                          ${user.name.charAt(0).toUpperCase()}
                        </div>`;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="ml-2">
                <InvestmentDashboardIcon size={40} primaryColor="#1E40AF" accentColor="#10B981" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
              <p className="text-gray-600">Here's your personalized financial dashboard</p>
            </div>
          </div>
          <div>
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              {isEditingProfile ? (
                <>
                  <User size={16} className="mr-2" /> View Dashboard
                </>
              ) : (
                <>
                  <Edit2 size={16} className="mr-2" /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>
        
        {isEditingProfile ? (
          <ProfileEditForm onCancel={() => {
            setIsEditingProfile(false);
            // Force portfolio recalculation when user profile is updated
            if (user) {
              setPortfolio(generatePortfolioRecommendations(user));
            }
          }} />
        ) : null}
        
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <IndianRupee size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-medium">Monthly Income</h3>
            </div>
            <p className="text-2xl font-bold">{formatIndianCurrency(user.salary)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium">Monthly Surplus</h3>
            </div>
            <p className="text-2xl font-bold">{formatIndianCurrency(user.monthlySurplus)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                <AlertCircle size={20} className="text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium">Emergency Fund</h3>
            </div>
            <p className="text-2xl font-bold">{formatIndianCurrency(user.emergencyFund)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <PiggyBank size={20} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-medium">Investable Amount</h3>
            </div>
            <p className="text-2xl font-bold">{formatIndianCurrency(user.investableAmount)}</p>
            <p className="text-sm text-gray-500 mt-1">Monthly</p>
          </div>
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Portfolio Allocation */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Recommended Portfolio Allocation</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((_entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, _name: string, props: any) => [
                      `${formatIndianCurrency(props.payload.amount)} (${value.toFixed(0)}%)`, 
                      props.payload.category
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600">Expected Annual Returns: <span className="font-bold text-green-600">{portfolio.expectedReturns}</span></p>
            </div>
          </div>
          
          {/* Monthly Finances */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Monthly Financial Breakdown</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatIndianCurrency(Number(value))} />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Investment Recommendations */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-xl font-bold mb-6">Personalized Investment Recommendations</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Returns</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolio.investments.map((investment: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{investment.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{investment.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(investment.allocation * 100).toFixed(0)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(investment.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{investment.returns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Disclaimer:</strong> These recommendations are based on your financial profile and risk tolerance. 
              Actual returns may vary. It's advisable to consult with a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
        
        {/* Stock Prediction CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg shadow-md mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-2">Stock Predictions & Analysis</h2>
              <p className="text-blue-100">
                Get AI-powered predictions for popular stocks and personalized recommendations based on your risk profile.
              </p>
            </div>
            <Link 
              to="/stocks" 
              className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors flex items-center"
            >
              Explore Stocks <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>

        {/* Latest News */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Latest Financial News</h2>
            <Link to="/news" className="text-blue-600 hover:underline flex items-center text-sm">
              View all news <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {newsData?.slice(0, 4).map((news) => (
              <div key={news.id} className="flex border-b pb-4">
                {news.imageUrl && (
                  <img 
                    src={news.imageUrl} 
                    alt={news.title} 
                    className="w-24 h-24 object-cover rounded-md mr-4"
                  />
                )}
                <div>
                  <div className="text-xs text-blue-600 font-medium mb-1">{news.category}</div>
                  <h3 className="font-medium mb-1">{news.title}</h3>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{news.date}</span>
                    <span>{news.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;