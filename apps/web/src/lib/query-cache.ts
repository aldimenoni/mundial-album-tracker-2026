type QueryCacheEntry<T> = {
  data?: T | undefined;
  error?: Error | undefined;
  updatedAt: number;
  promise?: Promise<T> | undefined;
};

const queryCache = new Map<string, QueryCacheEntry<unknown>>();
const invalidationListeners = new Set<(keys: string[]) => void>();

export function getQueryCacheEntry<T>(key: string): QueryCacheEntry<T> | undefined {
  return queryCache.get(key) as QueryCacheEntry<T> | undefined;
}

export function setQueryCacheEntry<T>(key: string, entry: QueryCacheEntry<T>): void {
  queryCache.set(key, entry as QueryCacheEntry<unknown>);
}

export function deleteQueryCacheEntry(key: string): void {
  queryCache.delete(key);
}

export function invalidateQuery(key: string): void {
  if (!queryCache.delete(key)) {
    return;
  }

  notifyInvalidation([key]);
}

export function invalidateQueriesByPrefix(prefix: string): void {
  const keys = [...queryCache.keys()].filter((key) => key.startsWith(prefix));

  for (const key of keys) {
    queryCache.delete(key);
  }

  if (keys.length > 0) {
    notifyInvalidation(keys);
  }
}

export function invalidateAlbumQueries(userId: string): void {
  invalidateQuery(`album:${userId}`);
  invalidateQuery(`summary:${userId}`);
  invalidateQueriesByPrefix(`compare:${userId}:`);
  invalidateQueriesByPrefix("compare-list:");
}

export function subscribeQueryInvalidation(listener: (keys: string[]) => void): () => void {
  invalidationListeners.add(listener);

  return () => {
    invalidationListeners.delete(listener);
  };
}

function notifyInvalidation(keys: string[]): void {
  for (const listener of invalidationListeners) {
    listener(keys);
  }
}
