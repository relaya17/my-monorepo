import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearTokens, setTokens } from './storage';
import type { ApiResponse } from 'shared';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored JWT to every request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401; clear session on persistent failure
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = data.data!.accessToken;
        await setTokens(newToken, data.data!.refreshToken);
        pendingQueue.forEach((p) => p.resolve(newToken));
        pendingQueue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (refreshError) {
        pendingQueue.forEach((p) => p.reject(refreshError));
        pendingQueue = [];
        await clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Typed helpers ────────────────────────────────────────────────────────────

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.get<ApiResponse<T>>(url, { params });
  return data.data as T;
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, body);
  return data.data as T;
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.put<ApiResponse<T>>(url, body);
  return data.data as T;
}

export async function del<T>(url: string): Promise<T> {
  const { data } = await apiClient.delete<ApiResponse<T>>(url);
  return data.data as T;
}
