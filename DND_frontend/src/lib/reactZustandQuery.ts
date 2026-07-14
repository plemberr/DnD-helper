import { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';

type QueryKey = readonly unknown[];

type QueryOptions<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
  retry?: number | boolean;
};

type MutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  retry?: number | boolean;
};

type QueryEntry<TData = unknown> = {
  data?: TData;
  error?: Error;
  isLoading: boolean;
  isSuccess: boolean;
  updatedAt?: number;
};

type QueryStore = {
  queries: Record<string, QueryEntry>;
  setLoading: (key: string, isLoading: boolean) => void;
  setSuccessData: <TData>(key: string, data: TData) => void;
  setError: (key: string, error: Error) => void;
};

const useQueryStore = create<QueryStore>((set) => ({
  queries: {},
  setLoading: (key, isLoading) =>
    set((state) => ({
      queries: {
        ...state.queries,
        [key]: {
          ...state.queries[key],
          isLoading,
        },
      },
    })),
  setSuccessData: (key, data) =>
    set((state) => ({
      queries: {
        ...state.queries,
        [key]: {
          ...state.queries[key],
          data,
          isLoading: false,
          isSuccess: true,
          error: undefined,
          updatedAt: Date.now(),
        },
      },
    })),
  setError: (key, error) =>
    set((state) => ({
      queries: {
        ...state.queries,
        [key]: {
          ...state.queries[key],
          error,
          isLoading: false,
          isSuccess: false,
        },
      },
    })),
}));

const toError = (error: unknown): Error => (error instanceof Error ? error : new Error('Unknown error'));

const getRetryLimit = (retry: number | boolean | undefined): number => {
  if (retry === true) {
    return 3;
  }
  if (typeof retry === 'number') {
    return retry;
  }
  return 0;
};

export function useQuery<TData>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5_000,
  retry = false,
}: QueryOptions<TData>) {
  const key = useMemo(() => JSON.stringify(queryKey), [queryKey]);
  const entry = useQueryStore((state) => state.queries[key]) as QueryEntry<TData> | undefined;
  const setLoading = useQueryStore((state) => state.setLoading);
  const setSuccessData = useQueryStore((state) => state.setSuccessData);
  const setError = useQueryStore((state) => state.setError);

  const runFetch = async () => {
    setLoading(key, true);
    const retryLimit = getRetryLimit(retry);

    for (let attempt = 0; attempt <= retryLimit; attempt += 1) {
      try {
        const data = await queryFn();
        setSuccessData(key, data);
        return data;
      } catch (error) {
        const safeError = toError(error);
        if (attempt === retryLimit) {
          setError(key, safeError);
          throw safeError;
        }
      }
    }

    return undefined;
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const isStale = !entry?.updatedAt || Date.now() - entry.updatedAt > staleTime;
    if (isStale && !entry?.isLoading) {
      void runFetch();
    }
  }, [enabled, entry?.isLoading, entry?.updatedAt, staleTime, key]);

  return {
    data: entry?.data,
    error: entry?.error,
    isLoading: entry?.isLoading ?? false,
    isSuccess: entry?.isSuccess ?? false,
    refetch: runFetch,
  };
}

export function useMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  onSettled,
  retry = false,
}: MutationOptions<TData, TVariables>) {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = async (variables: TVariables) => {
    setLoading(true);
    setError(null);
    const retryLimit = getRetryLimit(retry);

    for (let attempt = 0; attempt <= retryLimit; attempt += 1) {
      try {
        const nextData = await mutationFn(variables);
        setData(nextData);
        onSuccess?.(nextData);
        return nextData;
      } catch (mutationError) {
        const safeError = toError(mutationError);
        if (attempt === retryLimit) {
          setError(safeError);
          onError?.(safeError);
          throw safeError;
        }
      } finally {
        if (attempt === retryLimit) {
          setLoading(false);
          onSettled?.();
        }
      }
    }

    return null;
  };

  return {
    mutate,
    isLoading,
    error,
    data,
  };
}
