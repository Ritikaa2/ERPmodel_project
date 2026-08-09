export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: any[];
}

export const getStoredToken = (): string | null => {
  return localStorage.getItem('erp_auth_token') || sessionStorage.getItem('erp_auth_token');
};

export const setStoredToken = (token: string, rememberMe: boolean = true) => {
  if (rememberMe) {
    localStorage.setItem('erp_auth_token', token);
    sessionStorage.removeItem('erp_auth_token');
  } else {
    sessionStorage.setItem('erp_auth_token', token);
    localStorage.removeItem('erp_auth_token');
  }
};

export const clearStoredToken = () => {
  localStorage.removeItem('erp_auth_token');
  sessionStorage.removeItem('erp_auth_token');
};

export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Clear expired token if 401
        clearStoredToken();
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.data as T;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Mini ERP Backend API server.');
    }
    throw error;
  }
};
