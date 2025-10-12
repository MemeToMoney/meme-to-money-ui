// API Client Configuration for Meme-to-Money Platform
// Integrates with existing User Service and prepares for Content/Monetization services

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Environment-based service URLs
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8080';
const CONTENT_SERVICE_URL = process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:8081';
const MONETIZATION_SERVICE_URL = process.env.NEXT_PUBLIC_MONETIZATION_SERVICE_URL || 'http://localhost:8082';

// Response types matching your API specification
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  followerCount: number;
  followingCount: number;
  totalEarnings: number;
  weeklyEarnings: number;
  coinBalance: number;
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  isContentCreator: boolean;
  creatorHandle?: string;
  mobileNumber?: number;
  country?: string;
  address?: string;
  isGod?: boolean;
  authProvider?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  id: string;
  userId: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  tags: string[];
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
  };
}

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = 'meme_token';
  private static readonly REFRESH_TOKEN_KEY = 'meme_refresh_token';

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Base API client factory
function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth tokens
  client.interceptors.request.use(
    (config) => {
      const authHeaders = TokenManager.getAuthHeaders();
      Object.assign(config.headers, authHeaders);
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired, redirect to login
        TokenManager.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

// Service clients
export const userServiceClient = createApiClient(USER_SERVICE_URL);
export const contentServiceClient = createApiClient(CONTENT_SERVICE_URL);
export const monetizationServiceClient = createApiClient(MONETIZATION_SERVICE_URL);

// Export token manager for use in components
export { TokenManager };

// Helper function for handling API responses
export async function handleApiResponse<T>(
  apiCall: Promise<any>
): Promise<ApiResponse<T>> {
  try {
    const response = await apiCall;
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);

    // Handle different error types
    if (error.response) {
      // Server responded with error
      return {
        status: error.response.status,
        message: error.response.data?.message || 'An error occurred',
        data: null as T,
      };
    } else if (error.request) {
      // Network error
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
        data: null as T,
      };
    } else {
      // Other error
      return {
        status: -1,
        message: 'An unexpected error occurred',
        data: null as T,
      };
    }
  }
}

// Type-safe API response handler
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.status >= 200 && response.status < 300 && response.data !== null;
}