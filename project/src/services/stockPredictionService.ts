import { format, subDays } from 'date-fns';

// Types for stock data and predictions
export interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  historicalData: HistoricalDataPoint[];
  prediction: PredictionData;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume: number;
}

export interface PredictionData {
  nextDayPrediction: number;
  weekPrediction: number;
  monthPrediction: number;
  confidence: number;
  trend: 'up' | 'down' | 'neutral';
  factors: string[];
}

// List of stocks to track
const STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank' },
  { symbol: 'INFY', name: 'Infosys' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank' },
  { symbol: 'SBIN', name: 'State Bank of India' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
  { symbol: 'ITC', name: 'ITC Limited' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever' }
];

/**
 * Generate mock historical data for a stock
 */
function generateHistoricalData(basePrice: number, volatility: number, days: number): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  let price = basePrice;
  
  for (let i = days; i >= 0; i--) {
    // Random price movement with some trend
    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price + change, price * 0.7); // Ensure price doesn't go too low
    
    data.push({
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000
    });
  }
  
  return data;
}

/**
 * Generate prediction data based on historical trends
 */
function generatePrediction(historicalData: HistoricalDataPoint[]): PredictionData {
  const lastPrice = historicalData[historicalData.length - 1].price;
  const pricesBefore = historicalData.slice(-5).map(d => d.price);
  
  // Calculate average change over the last few days
  let avgChange = 0;
  for (let i = 1; i < pricesBefore.length; i++) {
    avgChange += (pricesBefore[i] - pricesBefore[i-1]) / pricesBefore[i-1];
  }
  avgChange = avgChange / (pricesBefore.length - 1);
  
  // Generate predictions with some randomness
  const trendDirection = avgChange > 0 ? 1 : avgChange < 0 ? -1 : 0;
  const trend = trendDirection > 0 ? 'up' : trendDirection < 0 ? 'down' : 'neutral';
  
  // Add some randomness to predictions
  const confidenceBase = Math.abs(avgChange) * 100; // Higher change = higher confidence base
  const confidence = Math.min(Math.max(confidenceBase + (Math.random() * 20 - 10), 35), 85);
  
  const nextDayChange = avgChange * (1 + (Math.random() * 0.5 - 0.25));
  const weekChange = avgChange * 5 * (1 + (Math.random() * 0.7 - 0.35));
  const monthChange = avgChange * 20 * (1 + (Math.random() * 0.8 - 0.4));
  
  // Factors affecting prediction
  const factorsPool = {
    up: [
      'Strong quarterly results',
      'Positive industry outlook',
      'New product launch expected',
      'Expanding market share',
      'Favorable government policies',
      'Strategic acquisition announcements'
    ],
    down: [
      'Missed earnings expectations',
      'Increased competition',
      'Regulatory challenges',
      'Margin pressure due to rising costs',
      'Management changes',
      'Sector-wide slowdown'
    ],
    neutral: [
      'Mixed quarterly results',
      'Stable market conditions',
      'Balanced risk factors',
      'Awaiting key business announcements',
      'Consolidation phase in the sector'
    ]
  };
  
  // Select 2-3 random factors based on trend
  const factorList = factorsPool[trend];
  const selectedFactors: string[] = [];
  const numFactors = Math.floor(Math.random() * 2) + 2; // 2-3 factors
  
  while (selectedFactors.length < numFactors && factorList.length > 0) {
    const randIndex = Math.floor(Math.random() * factorList.length);
    selectedFactors.push(factorList[randIndex]);
    factorList.splice(randIndex, 1); // Remove to avoid duplicates
  }
  
  return {
    nextDayPrediction: Number((lastPrice * (1 + nextDayChange)).toFixed(2)),
    weekPrediction: Number((lastPrice * (1 + weekChange)).toFixed(2)),
    monthPrediction: Number((lastPrice * (1 + monthChange)).toFixed(2)),
    confidence: Number(confidence.toFixed(1)),
    trend,
    factors: selectedFactors
  };
}

/**
 * Fetch stock data with predictions
 */
export async function fetchStockData(): Promise<StockData[]> {
  // In a real app, you would fetch from an external API
  // For now, we'll generate mock data
  
  return STOCKS.map(stock => {
    const basePrice = Math.floor(Math.random() * 4000) + 500; // Random base price between 500-4500
    const volatility = Math.random() * 0.02 + 0.01; // 1-3% daily volatility
    
    const historicalData = generateHistoricalData(basePrice, volatility, 30);
    const currentPrice = historicalData[historicalData.length - 1].price;
    const previousPrice = historicalData[historicalData.length - 2].price;
    
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;
    
    const prediction = generatePrediction(historicalData);
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      currentPrice,
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      historicalData,
      prediction
    };
  });
}

/**
 * Get detailed stock prediction data for a specific stock
 */
export async function getStockPrediction(symbol: string): Promise<StockData | null> {
  const stocks = await fetchStockData();
  return stocks.find(stock => stock.symbol === symbol) || null;
}

/**
 * Get stock recommendations based on predictions and user risk profile
 */
export async function getStockRecommendations(riskTolerance: 'low' | 'medium' | 'high'): Promise<StockData[]> {
  const allStocks = await fetchStockData();
  
  // Filter and sort stocks based on risk tolerance
  let filteredStocks: StockData[] = [];
  
  switch(riskTolerance) {
    case 'low':
      // Low risk - stable stocks with positive but modest predictions
      filteredStocks = allStocks.filter(stock => 
        stock.prediction.confidence > 60 &&
        stock.prediction.trend !== 'down' &&
        Math.abs(stock.changePercent) < 2
      );
      break;
      
    case 'medium':
      // Medium risk - balanced approach with moderate growth potential
      filteredStocks = allStocks.filter(stock => 
        stock.prediction.confidence > 50 &&
        (stock.prediction.trend === 'up' || stock.prediction.trend === 'neutral')
      );
      break;
      
    case 'high':
      // High risk - stocks with high growth potential regardless of volatility
      filteredStocks = allStocks.filter(stock => 
        stock.prediction.trend === 'up' &&
        stock.prediction.weekPrediction > stock.currentPrice * 1.03 // At least 3% predicted growth
      );
      break;
  }
  
  // Sort by prediction confidence and potential return
  return filteredStocks
    .sort((a, b) => {
      const aPotential = (a.prediction.weekPrediction - a.currentPrice) / a.currentPrice;
      const bPotential = (b.prediction.weekPrediction - b.currentPrice) / b.currentPrice;
      
      return b.prediction.confidence - a.prediction.confidence || bPotential - aPotential;
    })
    .slice(0, 5); // Return top 5 recommendations
}
