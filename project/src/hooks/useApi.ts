import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  authorized?: boolean;
}

export function useApi<T = any>(initialUrl: string, initialOptions: ApiOptions = {}) {
  const [url, setUrl] = useState<string>(initialUrl);
  const [options, setOptions] = useState<ApiOptions>(initialOptions);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);
  const { isAuthenticated } = useAuth();

  const refresh = useCallback(() => {
    setRefreshIndex(prevIndex => prevIndex + 1);
  }, []);

  const fetchData = useCallback(
    async (fetchUrl: string, fetchOptions: ApiOptions = {}) => {
      // Skip if requiring auth and not authenticated
      if (fetchOptions.authorized && !isAuthenticated) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        };

        // Add auth header if needed
        if (fetchOptions.authorized) {
          const token = localStorage.getItem('investsmartToken');
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        }

        const requestOptions: RequestInit = {
          method: fetchOptions.method || 'GET',
          headers,
        };

        if (fetchOptions.body && fetchOptions.method !== 'GET') {
          requestOptions.body = JSON.stringify(fetchOptions.body);
        }

        const response = await fetch(fetchUrl, requestOptions);

        // Check for HTTP errors
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        setData(responseData);
        return responseData;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (!url) return;
    
    fetchData(url, options);
  }, [url, options, refreshIndex, fetchData]);

  return {
    data,
    isLoading,
    error,
    setUrl,
    setOptions,
    refresh,
    fetchData: useCallback(
      (fetchUrl?: string, fetchOptions?: ApiOptions) => {
        return fetchData(fetchUrl || url, fetchOptions || options);
      },
      [fetchData, url, options]
    ),
  };
}

export default useApi;
