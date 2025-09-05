import { QueryClient } from '@tanstack/react-query';

interface ErrorWithStatus {
  status?: number;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // don't retry on 4xx errors (client errors)
        const errorStatus = (error as ErrorWithStatus)?.status;
        if (errorStatus && errorStatus >= 400 && errorStatus < 500) {
          return false;
        }
        // retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // don't retry mutations on 4xx errors
        const errorStatus = (error as ErrorWithStatus)?.status;
        if (errorStatus && errorStatus >= 400 && errorStatus < 500) {
          return false;
        }
        // retry up to 2 times for network/server errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});