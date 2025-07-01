import { User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface ApiError {
  error: string;
}

export const api = {
  // Login
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Giriş başarısız');
    }

    return data;
  },

  // Logout
  logout: async (token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Çıkış başarısız');
    }
  },

  // Get current user
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Kullanıcı bilgileri alınamadı');
    }

    return data.user;
  },
}; 