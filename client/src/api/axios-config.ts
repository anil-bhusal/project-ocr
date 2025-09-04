import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

const createApiClient = (): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });


  // request interceptor
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // log request details in development
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      // add timestamp to request (using any for metadata extension)
      (config as any).metadata = { startTime: Date.now() };
      
      return config;
    },
    (error: AxiosError) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  // response interceptor
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // log response details in development
      if (import.meta.env.DEV) {
        const duration = Date.now() - ((response.config as any).metadata?.startTime || 0);
        console.log(`[API Response] ${response.status} ${response.config.url} (${duration}ms)`);
      }
      
      return response;
    },
    (error: AxiosError) => {
      // enhanced error handling
      const apiError: ApiError = {
        message: 'An error occurred',
        status: error.response?.status,
        code: error.code,
      };

      if (error.response) {
        // server responded with error status
        apiError.message = (error.response.data as any)?.message || `Server error: ${error.response.status}`;
        apiError.status = error.response.status;
        
        console.error(`[API Error] ${error.response.status}: ${apiError.message}`);
      } else if (error.request) {
        // request made but no response received
        apiError.message = 'Network error: No response from server';
        console.error('[API Error] Network error:', error.request);
      } else {
        // something else happened
        apiError.message = error.message || 'Unknown error occurred';
        console.error('[API Error] Setup error:', error.message);
      }

      // log error details in development
      if (import.meta.env.DEV) {
        console.error('[API Error Details]', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: apiError.message,
        });
      }

      return Promise.reject(apiError);
    }
  );

  return apiClient;
};

// create and export the configured axios instance
export const apiClient = createApiClient();

// export types for use in other files
export type { ApiError };