const API_URL = 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers = new Headers(options.headers);

  // Add token to headers if provided
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Add content type for non-GET requests
  if (options.method !== 'GET' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }

  const data = await response.json();
  return data as T;
}

// Helper function to get token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Helper function to make authenticated requests
export async function authenticatedRequest<T>(
  endpoint: string,
  options: Omit<RequestOptions, 'token'> = {}
): Promise<T> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  return apiRequest<T>(endpoint, { ...options, token });
} 