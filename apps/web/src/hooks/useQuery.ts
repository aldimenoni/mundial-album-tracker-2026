import { useCallback, useEffect, useRef, useState } from "react";
import {
  getQueryCacheEntry,
  setQueryCacheEntry,
  subscribeQueryInvalidation
} from "../lib/query-cache";

type UseQueryOptions = {
  enabled?: boolean;
  staleTime?: number;
};

type UseQueryResult<T> = {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<T | undefined>;
};

function isStale(updatedAt: number, staleTime: number): boolean {
  return Date.now() - updatedAt > staleTime;
}

async function fetchQueryEntry<T>(
  key: string,
  fetcher: () => Promise<T>,
  staleTime: number,
  force = false
): Promise<T> {
  const existing = getQueryCacheEntry<T>(key);

  if (existing?.promise) {
    return existing.promise;
  }

  if (existing?.data !== undefined && !force && !isStale(existing.updatedAt, staleTime)) {
    return existing.data;
  }

  const promise = fetcher()
    .then((data) => {
      setQueryCacheEntry(key, {
        data,
        updatedAt: Date.now()
      });
      return data;
    })
    .catch((error: unknown) => {
      const nextError = error instanceof Error ? error : new Error("Query failed");
      setQueryCacheEntry(key, {
        data: existing?.data,
        error: nextError,
        updatedAt: existing?.updatedAt ?? 0
      });
      throw nextError;
    })
    .finally(() => {
      const entry = getQueryCacheEntry<T>(key);

      if (entry?.promise) {
        setQueryCacheEntry(key, {
          data: entry.data,
          error: entry.error,
          updatedAt: entry.updatedAt
        });
      }
    });

  setQueryCacheEntry(key, {
    data: existing?.data,
    error: existing?.error,
    updatedAt: existing?.updatedAt ?? 0,
    promise
  });

  return promise;
}

export function useQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const enabled = options.enabled ?? Boolean(key);
  const staleTime = options.staleTime ?? 60_000;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const cachedEntry = key && enabled ? getQueryCacheEntry<T>(key) : undefined;
  const [data, setData] = useState<T | undefined>(cachedEntry?.data);
  const [error, setError] = useState<Error | null>(cachedEntry?.error ?? null);
  const [isLoading, setIsLoading] = useState(enabled && cachedEntry?.data === undefined && !cachedEntry?.error);
  const [isFetching, setIsFetching] = useState(false);

  const runQuery = useCallback(
    async (force = false): Promise<T | undefined> => {
      if (!key || !enabled) {
        return undefined;
      }

      const existing = getQueryCacheEntry<T>(key);
      const hasCachedData = existing?.data !== undefined;

      if (!hasCachedData) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }

      try {
        const nextData = await fetchQueryEntry(key, () => fetcherRef.current(), staleTime, force);
        setData(nextData);
        setError(null);
        return nextData;
      } catch (nextError: unknown) {
        const parsedError = nextError instanceof Error ? nextError : new Error("Query failed");
        setError(parsedError);
        return getQueryCacheEntry<T>(key)?.data;
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    [enabled, key, staleTime]
  );

  useEffect(() => {
    void runQuery(false);
  }, [runQuery]);

  useEffect(() => {
    if (!key || !enabled) {
      return undefined;
    }

    return subscribeQueryInvalidation((keys) => {
      if (keys.includes(key)) {
        void runQuery(true);
      }
    });
  }, [enabled, key, runQuery]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch: () => runQuery(true)
  };
}

export function prefetchQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  staleTime = 60_000
): Promise<T> {
  return fetchQueryEntry(key, fetcher, staleTime, false);
}
