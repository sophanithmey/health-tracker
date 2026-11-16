import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Centralized Axios API client for all client-side HTTP communications.
 * Includes default timeout, standard headers, and unified error handling.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
