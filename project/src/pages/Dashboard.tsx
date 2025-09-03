import { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, IndianRupee, AlertCircle, PiggyBank, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generatePortfolioRecommendations } from '../services/investmentService';
import { formatIndianCurrency } from '../services/marketService';
import { useQuery } from '@tanstack/react-query';
import { fetchNewsData } from '../services/newsService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: newsData } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNewsData,
  });
  
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    if (user) {
      const recommendations = generatePortfolioRecommendations(user);
      setPortfolio(recommendations);
    }
  }, [user]);

  if (!user || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
          <p className="text-gray-600">Here's your personalized financial dashboard</p>
        </div>
        
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
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
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
                  <Tooltip formatter={(value) => formatIndianCurrency(value)} />
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
                {portfolio.investments.map((investment, index) => (
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
        
        {/* Latest News */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Latest Financial News</h2>
            <a href="#" className="text-blue-600 hover:underline flex items-center text-sm">
              View all news <ArrowRight size={16} className="ml-1" />
            </a>
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