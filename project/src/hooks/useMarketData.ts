import { useQuery } from '@tanstack/react-query';
import { MarketData } from '../types';
import { fetchMarketData } from '../services/marketService';

export function useMarketData() {
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery<MarketData[]>({
    queryKey: ['marketData'],
    queryFn: fetchMarketData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    marketData: data || [],
    isLoading,
    isError,
    error,
  };
}