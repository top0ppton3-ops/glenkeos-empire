/**
 * Base API Hook Utilities
 * Provides reusable patterns for data fetching with loading, error, and caching
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { APIError } from "../types/backend";

export interface UseQueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: APIError) => void;
}

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: APIError | null;
  refetch: () => Promise<void>;
}

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: APIError, variables: TVariables) => void;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: APIError | null;
  data: TData | null;
}

/**
 * useQuery Hook
 * Fetches data with automatic loading and error states
 */
export function useQuery<T>(
  queryFn: () => Promise<T>,
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const { enabled = true, refetchInterval, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<APIError | null>(null);

  const isMountedRef = useRef(true);
  const refetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();

      if (isMountedRef.current) {
        setData(result);
        setIsLoading(false);
        onSuccess?.(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const apiError = err as APIError;
        setError(apiError);
        setIsLoading(false);
        onError?.(apiError);
      }
    }
  }, [queryFn, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();

    // Setup refetch interval if specified
    if (refetchInterval && enabled) {
      refetchIntervalRef.current = setInterval(fetchData, refetchInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, [fetchData, refetchInterval, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

/**
 * useMutation Hook
 * Handles mutations with loading and error states
 */
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);

        if (isMountedRef.current) {
          setData(result);
          setIsLoading(false);
          onSuccess?.(result, variables);
        }

        return result;
      } catch (err) {
        const apiError = err as APIError;

        if (isMountedRef.current) {
          setError(apiError);
          setIsLoading(false);
          onError?.(apiError, variables);
        }

        throw apiError;
      }
    },
    [mutationFn, onSuccess, onError]
  );

  return {
    mutate,
    isLoading,
    error,
    data
  };
}
