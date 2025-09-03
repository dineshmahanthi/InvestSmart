import { MarketData } from '../types';

// Mock market data for development
const mockMarketData: MarketData[] = [
  {
    symbol: '^BSESN',
    name: 'SENSEX',
    price: 73402.35,
    change: 543.15,
    changePercent: 0.74,
  },
  {
    symbol: '^NSEI',
    name: 'NIFTY 50',
    price: 22304.85,
    change: 161.75,
    changePercent: 0.73,
  },
  {
    symbol: 'USDINR=X',
    name: 'USD/INR',
    price: 83.45,
    change: -0.12,
    changePercent: -0.14,
  },
  {
    symbol: 'EURINR=X',
    name: 'EUR/INR',
    price: 90.67,
    change: 0.23,
    changePercent: 0.25,
  },
];

// In a real app, this would fetch from an API
export async function fetchMarketData(): Promise<MarketData[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Add some randomness to make data look dynamic
      const updatedData = mockMarketData.map(item => {
        const randomChange = (Math.random() * 0.5) - 0.25;
        const newChangePercent = item.changePercent + randomChange;
        const newChange = (item.price * newChangePercent) / 100;
        const newPrice = item.price + newChange;
        
        return {
          ...item,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(newChange.toFixed(2)),
          changePercent: parseFloat(newChangePercent.toFixed(2)),
        };
      });
      
      resolve(updatedData);
    }, 500);
  });
}

// Format currency in Indian format (e.g., 1,00,000)
export function formatIndianCurrency(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(amount);
}