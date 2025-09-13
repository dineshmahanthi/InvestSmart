import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Minus, BarChart2, LineChart as LineChartIcon,
  Calendar, ChevronRight, AlertCircle, Info, ArrowUp, ArrowDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { StockData, fetchStockData, getStockRecommendations } from '../services/stockPredictionService';

const StockPrediction = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [recommendations, setRecommendations] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('14d');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'line' | 'area' | 'bar'>('area');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const stockData = await fetchStockData();
        setStocks(stockData);
        
        if (user) {
          const recs = await getStockRecommendations(user.riskTolerance);
          setRecommendations(recs);
        }
        
        // Set the first stock as selected by default
        if (stockData.length > 0) {
          setSelectedStock(stockData[0]);
        }
      } catch (error) {
        console.error('Error loading stock data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  // Filter data based on selected time range
  const getFilteredData = (stock: StockData | null) => {
    if (!stock) return [];
    
    let days = 14;
    if (timeRange === '7d') days = 7;
    if (timeRange === '30d') days = 30;
    
    return stock.historicalData.slice(-days);
  };
  
  const formatIndianCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const renderTrendIcon = (trend: 'up' | 'down' | 'neutral', size = 16) => {
    if (trend === 'up') return <TrendingUp size={size} className="text-green-600" />;
    if (trend === 'down') return <TrendingDown size={size} className="text-red-600" />;
    return <Minus size={size} className="text-gray-500" />;
  };
  
  const renderChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  const renderChangeIndicator = (change: number) => {
    if (change > 0) return <ArrowUp size={14} className="inline" />;
    if (change < 0) return <ArrowDown size={14} className="inline" />;
    return null;
  };
  
  const renderConfidenceLevel = (confidence: number) => {
    if (confidence >= 75) return 'High';
    if (confidence >= 60) return 'Above Average';
    if (confidence >= 45) return 'Average';
    if (confidence >= 30) return 'Below Average';
    return 'Low';
  };
  
  const renderConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-green-600';
    if (confidence >= 60) return 'text-green-500';
    if (confidence >= 45) return 'text-yellow-500';
    if (confidence >= 30) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const renderStockChart = () => {
    const filteredData = getFilteredData(selectedStock);
    
    if (!filteredData.length) {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-50">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }
    
    switch (viewMode) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip formatter={(value) => formatIndianCurrency(Number(value))} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6"
                name="Stock Price" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip formatter={(value) => formatIndianCurrency(Number(value))} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorPrice)"
                name="Stock Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip formatter={(value) => formatIndianCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="price" fill="#3b82f6" name="Stock Price" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading stock data...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Stock Prediction Dashboard</h1>
          <p className="text-gray-600">
            Analyze stock trends and get personalized predictions based on your risk profile
          </p>
        </div>
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Stock list */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stock selector */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold mb-4">Stocks</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {stocks.map((stock) => (
                  <div 
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedStock?.symbol === stock.symbol 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-xs text-gray-500">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatIndianCurrency(stock.currentPrice)}</div>
                        <div className={`text-xs flex items-center ${renderChangeColor(stock.changePercent)}`}>
                          {renderChangeIndicator(stock.changePercent)}
                          {Math.abs(stock.changePercent).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center">
                      <div className="text-xs text-gray-500 flex items-center">
                        {renderTrendIcon(stock.prediction.trend)}
                        <span className="ml-1">
                          Trend: {stock.prediction.trend.charAt(0).toUpperCase() + stock.prediction.trend.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recommendations based on risk profile */}
            {user && recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold mb-4">
                  Recommended for You
                  <span className="text-sm font-normal ml-2 text-gray-500">
                    Based on {user.riskTolerance} risk profile
                  </span>
                </h2>
                <div className="space-y-3">
                  {recommendations.map((stock) => (
                    <div 
                      key={`rec-${stock.symbol}`}
                      onClick={() => setSelectedStock(stock)}
                      className="p-3 bg-green-50 rounded-md cursor-pointer hover:bg-green-100 transition-colors"
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">{stock.symbol}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                          stock.prediction.trend === 'up' 
                            ? 'bg-green-100 text-green-800' 
                            : stock.prediction.trend === 'down' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {stock.prediction.trend === 'up' ? 'Buy' : stock.prediction.trend === 'down' ? 'Sell' : 'Hold'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">{stock.name}</div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-xs">
                          <span className="text-gray-500">Current:</span> {formatIndianCurrency(stock.currentPrice)}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Predicted:</span>{' '}
                          <span className={renderChangeColor(stock.prediction.weekPrediction - stock.currentPrice)}>
                            {formatIndianCurrency(stock.prediction.weekPrediction)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 bg-yellow-50 p-3 rounded-md text-xs text-yellow-800">
                  <div className="flex items-start">
                    <AlertCircle size={14} className="mr-1 mt-0.5 flex-shrink-0" />
                    <div>
                      These recommendations are based on algorithmic predictions and 
                      your risk profile. Always consult with a financial advisor before making investment decisions.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {selectedStock && (
              <>
                {/* Stock details header */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedStock.symbol}</h2>
                      <p className="text-gray-600">{selectedStock.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatIndianCurrency(selectedStock.currentPrice)}</div>
                      <div className={`flex items-center justify-end ${renderChangeColor(selectedStock.change)}`}>
                        {renderChangeIndicator(selectedStock.change)}
                        <span className="font-medium">{Math.abs(selectedStock.change).toFixed(2)}</span>
                        <span className="mx-1">({Math.abs(selectedStock.changePercent).toFixed(2)}%)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <Calendar size={14} className="mr-1" />
                      <span className="text-sm">Last updated: {selectedStock.historicalData[selectedStock.historicalData.length - 1].date}</span>
                    </div>
                    <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      {renderTrendIcon(selectedStock.prediction.trend, 14)}
                      <span className="text-sm ml-1">Trend: {selectedStock.prediction.trend.charAt(0).toUpperCase() + selectedStock.prediction.trend.slice(1)}</span>
                    </div>
                    <div className={`flex items-center px-3 py-1 rounded-full bg-gray-100`}>
                      <Info size={14} className="mr-1" />
                      <span className="text-sm">Confidence: <span className={renderConfidenceColor(selectedStock.prediction.confidence)}>
                        {renderConfidenceLevel(selectedStock.prediction.confidence)} ({selectedStock.prediction.confidence}%)
                      </span></span>
                    </div>
                  </div>
                </div>
                
                {/* Chart controls */}
                <div className="flex flex-wrap justify-between items-center">
                  {/* Time range selector */}
                  <div className="flex bg-white rounded-lg shadow-sm mb-4 p-1">
                    <button
                      onClick={() => setTimeRange('7d')}
                      className={`px-4 py-2 text-sm rounded-md ${
                        timeRange === '7d' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setTimeRange('14d')}
                      className={`px-4 py-2 text-sm rounded-md ${
                        timeRange === '14d' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      14 Days
                    </button>
                    <button
                      onClick={() => setTimeRange('30d')}
                      className={`px-4 py-2 text-sm rounded-md ${
                        timeRange === '30d' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      30 Days
                    </button>
                  </div>
                  
                  {/* Chart type selector */}
                  <div className="flex bg-white rounded-lg shadow-sm mb-4 p-1">
                    <button
                      onClick={() => setViewMode('line')}
                      className={`px-3 py-2 text-sm rounded-md flex items-center ${
                        viewMode === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Line Chart"
                    >
                      <LineChartIcon size={16} className="mr-1" />
                      <span className="hidden sm:inline">Line</span>
                    </button>
                    <button
                      onClick={() => setViewMode('area')}
                      className={`px-3 py-2 text-sm rounded-md flex items-center ${
                        viewMode === 'area' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Area Chart"
                    >
                      <TrendingUp size={16} className="mr-1" />
                      <span className="hidden sm:inline">Area</span>
                    </button>
                    <button
                      onClick={() => setViewMode('bar')}
                      className={`px-3 py-2 text-sm rounded-md flex items-center ${
                        viewMode === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Bar Chart"
                    >
                      <BarChart2 size={16} className="mr-1" />
                      <span className="hidden sm:inline">Bar</span>
                    </button>
                  </div>
                </div>
                
                {/* Stock chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold mb-4">Price History - {selectedStock.symbol}</h3>
                  {renderStockChart()}
                </div>
                
                {/* Prediction details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold mb-4">Price Predictions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-sm text-gray-500 mb-1">Next Day</div>
                      <div className="text-xl font-bold">{formatIndianCurrency(selectedStock.prediction.nextDayPrediction)}</div>
                      <div className={`text-sm ${renderChangeColor(selectedStock.prediction.nextDayPrediction - selectedStock.currentPrice)}`}>
                        {renderChangeIndicator(selectedStock.prediction.nextDayPrediction - selectedStock.currentPrice)}
                        {(Math.abs((selectedStock.prediction.nextDayPrediction - selectedStock.currentPrice) / selectedStock.currentPrice) * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-sm text-gray-500 mb-1">1 Week</div>
                      <div className="text-xl font-bold">{formatIndianCurrency(selectedStock.prediction.weekPrediction)}</div>
                      <div className={`text-sm ${renderChangeColor(selectedStock.prediction.weekPrediction - selectedStock.currentPrice)}`}>
                        {renderChangeIndicator(selectedStock.prediction.weekPrediction - selectedStock.currentPrice)}
                        {(Math.abs((selectedStock.prediction.weekPrediction - selectedStock.currentPrice) / selectedStock.currentPrice) * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-sm text-gray-500 mb-1">1 Month</div>
                      <div className="text-xl font-bold">{formatIndianCurrency(selectedStock.prediction.monthPrediction)}</div>
                      <div className={`text-sm ${renderChangeColor(selectedStock.prediction.monthPrediction - selectedStock.currentPrice)}`}>
                        {renderChangeIndicator(selectedStock.prediction.monthPrediction - selectedStock.currentPrice)}
                        {(Math.abs((selectedStock.prediction.monthPrediction - selectedStock.currentPrice) / selectedStock.currentPrice) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Factors Affecting This Prediction:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedStock.prediction.factors.map((factor, index) => (
                        <li key={index} className="text-gray-700">{factor}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6 bg-yellow-50 p-4 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle size={20} className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-800 font-medium">Disclaimer</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Predictions are based on historical data analysis and algorithmic models. 
                          They should not be considered as financial advice. Past performance does 
                          not guarantee future results. Always conduct your own research before 
                          making investment decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Learn more section */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Want to learn more?</h3>
                      <p className="text-blue-100 mb-4">
                        Explore our educational resources on technical analysis and stock prediction models.
                      </p>
                      <a 
                        href="/strategies" 
                        className="inline-flex items-center bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50"
                      >
                        View Investment Strategies <ChevronRight size={16} className="ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StockPrediction;
