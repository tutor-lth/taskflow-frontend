import { useState, useCallback } from 'react';
import { ApiResponse } from '../types';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  initialLoading?: boolean;
}

/**
 * Custom hook for API calls with loading and error handling
 */
export function useApi<T>(options: UseApiOptions<T> = {}) {
  const [loading, setLoading] = useState(options.initialLoading ?? false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async <R = T>(
      apiCall: () => Promise<ApiResponse<R>>,
      successCallback?: (data: R) => void,
      errorCallback?: (error: string) => void
    ): Promise<ApiResponse<R>> => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiCall();
        
        if (response.success && response.data) {
          setData(response.data as unknown as T);
          successCallback?.(response.data);
          options.onSuccess?.(response.data as unknown as T);
        } else {
          const errorMessage = response.message || 'An error occurred';
          setError(errorMessage);
          errorCallback?.(errorMessage);
          options.onError?.(errorMessage);
        }
        
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        errorCallback?.(errorMessage);
        options.onError?.(errorMessage);
        
        return {
          success: false,
          message: errorMessage,
          data: null as unknown as R,
          timestamp: new Date().toISOString()
        };
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset
  };
} 