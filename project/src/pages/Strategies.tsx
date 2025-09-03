import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Shield, Target, BarChart3, PieChart, LineChart } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Strategies = () => {
  const strategies = [
    {
      title: "Value Investing",
      icon: <BarChart3 size={40} className="text-blue-600" />,
      description: "Focus on stocks trading below their intrinsic value with strong fundamentals and potential for long-term growth.",
      key_points: [
        "Price-to-Earnings (P/E) ratio analysis",
        "Book value assessment",
        "Cash flow evaluation",
        "Margin of safety principle"
      ]
    },
    {
      title: "Growth Investing",
      icon: <TrendingUp size={40} className="text-blue-600" />,
      description: "Target companies with strong potential for above-average growth in revenue and earnings.",
      key_points: [
        "Revenue growth analysis",
        "Market leadership potential",
        "Competitive advantages",
        "Industry trend alignment"
      ]
    },
    {
      title: "Index Investing",
      icon: <LineChart size={40} className="text-blue-600" />,
      description: "Passive investment strategy tracking market indices like NIFTY 50 or SENSEX for broad market exposure.",
      key_points: [
        "Low-cost index funds",
        "Broad market exposure",
        "Reduced management fees",
        "Long-term wealth building"
      ]
    },
    {
      title: "Dividend Growth",
      icon: <PieChart size={40} className="text-blue-600" />,
      description: "Focus on companies with consistent dividend payments and potential for dividend growth.",
      key_points: [
        "Dividend yield analysis",
        "Payout ratio evaluation",
        "Company stability assessment",
        "Income stream generation"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Investment Strategies & Algorithms
            </h1>
            <p className="text-xl mb-8 max-w-3xl">
              Discover proven investment strategies and sophisticated algorithms that power our AI-driven recommendations for the Indian market.
            </p>
          </div>
        </section>

        {/* Strategies Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {strategies.map((strategy, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
                  <div className="mb-4">{strategy.icon}</div>
                  <h2 className="text-2xl font-bold mb-4">{strategy.title}</h2>
                  <p className="text-gray-600 mb-6">{strategy.description}</p>
                  <ul className="space-y-3">
                    {strategy.key_points.map((point, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <ChevronRight size={16} className="text-blue-600 mr-2" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Investing?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Put these strategies to work with our AI-powered platform. Get personalized recommendations based on your risk profile and financial goals.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/register" 
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Account
              </Link>
              <Link 
                to="/login" 
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Strategies;