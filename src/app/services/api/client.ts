/**
 * API Client - Base HTTP client for all API calls
 */

import { supabase } from '../../../../utils/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

// Export BACKEND_URL for components that need it
export const BACKEND_URL = SUPABASE_URL;

export interface APIError {
  code: string;
  message: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
}

class APIClient {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async call<T = any>(
    functionName: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    body?: any,
    params?: Record<string, string>
  ): Promise<T> {
    const token = await this.getAuthToken();

    let url = `${FUNCTIONS_URL}/${functionName}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T = any>(functionName: string, params?: Record<string, string>): Promise<T> {
    return this.call<T>(functionName, 'GET', undefined, params);
  }

  async post<T = any>(functionName: string, body?: any): Promise<T> {
    return this.call<T>(functionName, 'POST', body);
  }

  async put<T = any>(functionName: string, body?: any): Promise<T> {
    return this.call<T>(functionName, 'PUT', body);
  }

  async delete<T = any>(functionName: string, body?: any): Promise<T> {
    return this.call<T>(functionName, 'DELETE', body);
  }
}

export const apiClient = new APIClient();
