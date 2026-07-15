import { BASE_URL } from '../constants/config';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  
  headers.set('Content-Type', 'application/json');
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    // some responses like 204 No Content won't have JSON
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error || data?.message || 'An error occurred'
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, token: string) => 
    apiFetch<T>(path, { method: 'GET', token }),
    
  post: <T>(path: string, body: any, token?: string) => 
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body), token }),
    
  put: <T>(path: string, body: any, token: string) => 
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body), token }),
    
  delete: (path: string, token: string) => 
    apiFetch<void>(path, { method: 'DELETE', token }),
};
