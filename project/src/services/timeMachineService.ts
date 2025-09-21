import { format, subMonths, subYears, parseISO } from 'date-fns';
import { fetchStockData } from './stockPredictionService';

export interface TimeSimulation {
  initialAmount: number;
  startDate: string;
  endDate: string;
  stockSymbols: string[];
  potentialValue: number;
  growthPercentage: number;
  bestPerformer: {
    symbol: string;
    name: string;
    growthPercentage: number;
  };
  worstPerformer: {
    symbol: string;
    name: string;
    growthPercentage: number;
  };
  breakdown: Array<{
    symbol: string;
    name: string;
    initialPrice: number;
    finalPrice: number;
    growthPercentage: number;
    sharesBought: number;
    initialValue: number;
    finalValue: number;
  }>;
}

export interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  startDate: string;
  stockSymbols: string[];
}

/**
 * Get a list of interesting time periods for historical simulation
 */
export function getSimulationPresets(): SimulationPreset[] {
  const now = new Date();
  
  return [
    {
      id: 'covid-dip',
      name: 'COVID-19 Market Dip',
      description: 'If you had invested during the pandemic market crash',
      startDate: '2020-03-23',
      stockSymbols: ['RELIANCE.NS', 'HDFCBANK.NS', 'INFY.NS', 'TCS.NS', 'ITC.NS']
    },
    {
      id: 'five-years-ago',
      name: '5 Years Ago',
      description: 'Long-term investment results from five years ago',
      startDate: format(subYears(now, 5), 'yyyy-MM-dd'),
      stockSymbols: ['RELIANCE.NS', 'INFY.NS', 'HDFCBANK.NS', 'SBIN.NS', 'BAJFINANCE.NS']
    },
    {
      id: 'pre-election',
      name: 'Before 2024 Elections',
      description: 'Investment results if you invested before the general election',
      startDate: '2024-01-15',
      stockSymbols: ['RELIANCE.NS', 'ADANIPORTS.NS', 'ITC.NS', 'HDFCBANK.NS', 'TCS.NS']
    },
    {
      id: 'one-year-ago',
      name: '1 Year Ago',
      description: 'Short-term results from investing a year ago',
      startDate: format(subYears(now, 1), 'yyyy-MM-dd'),
      stockSymbols: ['INFY.NS', 'TCS.NS', 'WIPRO.NS', 'ICICIBANK.NS', 'HDFCBANK.NS']
    },
    {
      id: 'six-months-ago',
      name: '6 Months Ago',
      description: 'Recent performance of top companies',
      startDate: format(subMonths(now, 6), 'yyyy-MM-dd'),
      stockSymbols: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'SUNPHARMA.NS']
    }
  ];
}

/**
 * Generate a time machine simulation for "what if" investment scenarios
 */
export async function generateTimeMachineSimulation(
  initialAmount: number,
  startDate: string,
  stockSymbols: string[],
  equalDistribution: boolean = true
): Promise<TimeSimulation> {
  try {
    // Validate inputs
    if (initialAmount <= 0 || !startDate || !stockSymbols.length) {
      throw new Error('Invalid simulation parameters');
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    // Fetch all stock data
  const allStocks = await fetchStockData();
  
  const resultsPromises = stockSymbols.map(async (symbol) => {
      // Find the stock data for this symbol
      const stockData = allStocks.find(s => s.symbol === symbol.replace('.NS', ''));
      
      if (!stockData) {
        throw new Error(`Could not find stock data for ${symbol}`);
      }
      
      // Generate historical prices based on the simulation date
      // In a real app, you would use actual historical data from an API
      const startDateObj = parseISO(startDate);
      const today = new Date();
      
      // Calculate a reasonable price change based on time difference
      const monthsDiff = (today.getFullYear() - startDateObj.getFullYear()) * 12 + 
                         (today.getMonth() - startDateObj.getMonth());
      
      // Historical price is calculated as a percentage of current price
      // For simplification, assume stocks generally grow over time
      // More realistic implementation would use actual historical API data
      const growthFactor = 1 - (monthsDiff * 0.01) - (Math.random() * 0.2);
      const startPrice = stockData.currentPrice * Math.max(0.3, growthFactor);
      const endPrice = stockData.currentPrice;
      
      if (startPrice <= 0 || endPrice <= 0) {
        throw new Error(`Could not calculate valid price data for ${symbol}`);
      }
      
      // Calculate performance
      const growthPercentage = ((endPrice - startPrice) / startPrice) * 100;
      
      // Calculate investment allocation
      const allocationAmount = equalDistribution 
        ? initialAmount / stockSymbols.length 
        : initialAmount; // For single stock
        
      // Calculate shares bought
      const sharesBought = allocationAmount / startPrice;
      
      // Calculate final value
      const finalValue = sharesBought * endPrice;
      
      return {
        symbol,
        name: getStockName(symbol),
        initialPrice: startPrice,
        finalPrice: endPrice,
        growthPercentage,
        sharesBought,
        initialValue: allocationAmount,
        finalValue
      };
    });
    
    // Wait for all stock calculations to complete
    const results = await Promise.all(resultsPromises);
    
    // Calculate total values
    const totalInitialValue = results.reduce((sum, stock) => sum + stock.initialValue, 0);
    const totalFinalValue = results.reduce((sum, stock) => sum + stock.finalValue, 0);
    const totalGrowthPercentage = ((totalFinalValue - totalInitialValue) / totalInitialValue) * 100;
    
    // Find best and worst performers
    const sortedByPerformance = [...results].sort((a, b) => b.growthPercentage - a.growthPercentage);
    const bestPerformer = sortedByPerformance[0];
    const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];
    
    return {
      initialAmount,
      startDate,
      endDate: today,
      stockSymbols,
      potentialValue: totalFinalValue,
      growthPercentage: totalGrowthPercentage,
      bestPerformer: {
        symbol: bestPerformer.symbol,
        name: bestPerformer.name,
        growthPercentage: bestPerformer.growthPercentage
      },
      worstPerformer: {
        symbol: worstPerformer.symbol,
        name: worstPerformer.name,
        growthPercentage: worstPerformer.growthPercentage
      },
      breakdown: results
    };
  } catch (error) {
    console.error('Error generating time machine simulation:', error);
    throw error;
  }
}

/**
 * Get a stock name from its symbol
 */
function getStockName(symbol: string): string {
  const stockNames: Record<string, string> = {
    'RELIANCE.NS': 'Reliance Industries',
    'TCS.NS': 'Tata Consultancy Services',
    'HDFCBANK.NS': 'HDFC Bank',
    'INFY.NS': 'Infosys',
    'HINDUNILVR.NS': 'Hindustan Unilever',
    'ITC.NS': 'ITC Ltd',
    'SBIN.NS': 'State Bank of India',
    'BHARTIARTL.NS': 'Bharti Airtel',
    'ICICIBANK.NS': 'ICICI Bank',
    'KOTAKBANK.NS': 'Kotak Mahindra Bank',
    'WIPRO.NS': 'Wipro Limited',
    'BAJFINANCE.NS': 'Bajaj Finance',
    'ADANIPORTS.NS': 'Adani Ports',
    'SUNPHARMA.NS': 'Sun Pharmaceutical'
  };
  
  return stockNames[symbol] || symbol.replace('.NS', '');
}

/**
 * Format currency in Indian style
 */
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
