// API Client Configuration for Meme-to-Money Platform
// Integrates with existing User Service and prepares for Content/Monetization services

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Environment-based service URLs
const isProdApi = process.env.NEXT_PUBLIC_API_ENV === 'production' || process.env.NODE_ENV === 'production';

// Development URLs (localhost)
const DEV_USER_SERVICE_URL = 'http://localhost:8080';
const DEV_CONTENT_SERVICE_URL = 'http://localhost:8081';
const DEV_MONETIZATION_SERVICE_URL = 'http://localhost:8084';

// Production URLs (via Load Balancer - path-based routing handles service dispatch)
const PROD_BASE_URL = 'https://www.upgradestacks.com';
const PROD_USER_SERVICE_URL = PROD_BASE_URL;
const PROD_CONTENT_SERVICE_URL = PROD_BASE_URL;
const PROD_MONETIZATION_SERVICE_URL = PROD_BASE_URL;
const PROD_MESSAGING_SERVICE_URL = PROD_BASE_URL;
const PROD_NOTIFICATION_SERVICE_URL = PROD_BASE_URL;

// Development URLs
const DEV_MESSAGING_SERVICE_URL = 'http://localhost:8082';
const DEV_NOTIFICATION_SERVICE_URL = 'http://localhost:8083';

// Select URLs based on environment (env vars take precedence)
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || (isProdApi ? PROD_USER_SERVICE_URL : DEV_USER_SERVICE_URL);
const CONTENT_SERVICE_URL = process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || (isProdApi ? PROD_CONTENT_SERVICE_URL : DEV_CONTENT_SERVICE_URL);
const MONETIZATION_SERVICE_URL = process.env.NEXT_PUBLIC_MONETIZATION_SERVICE_URL || (isProdApi ? PROD_MONETIZATION_SERVICE_URL : DEV_MONETIZATION_SERVICE_URL);
const MESSAGING_SERVICE_URL = process.env.NEXT_PUBLIC_MESSAGING_SERVICE_URL || (isProdApi ? PROD_MESSAGING_SERVICE_URL : DEV_MESSAGING_SERVICE_URL);
const NOTIFICATION_SERVICE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || (isProdApi ? PROD_NOTIFICATION_SERVICE_URL : DEV_NOTIFICATION_SERVICE_URL);

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
  upiId?: string;
  isPrivateAccount?: boolean;
  authProvider?: string;
  onboardingCompleted?: boolean;
  website?: string;
  socialLinks?: { [key: string]: string };
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
function createApiClient(baseURL: string, timeout = 30000): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
    maxContentLength: 100 * 1024 * 1024, // 100MB
    maxBodyLength: 100 * 1024 * 1024, // 100MB
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
export const contentServiceClient = createApiClient(CONTENT_SERVICE_URL, 120000); // 2min timeout for uploads
export const monetizationServiceClient = createApiClient(MONETIZATION_SERVICE_URL);
export const messagingServiceClient = createApiClient(MESSAGING_SERVICE_URL);
export const notificationServiceClient = createApiClient(NOTIFICATION_SERVICE_URL);

// Export messaging service URL for WebSocket connections
export const getMessagingWsUrl = () => {
  const base = MESSAGING_SERVICE_URL.replace(/^http/, 'ws');
  return `${base}/ws`;
};

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

/**
 * Parse Java LocalDateTime array format or ISO string into a JS Date.
 * Java serializes LocalDateTime as [year, month, day, hour, minute, second, nanosecond].
 * Also handles ISO strings and regular date strings.
 */
export function parseJavaDate(dateValue: any): Date {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  if (Array.isArray(dateValue)) {
    // Java LocalDateTime array: [year, month, day, hour, minute, second, nanosecond?]
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  if (typeof dateValue === 'number') return new Date(dateValue);
  // ISO string or other string format
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Format a date value (Java array or string) as a relative time string.
 */
export function formatTimeAgo(dateValue: any): string {
  const date = parseJavaDate(dateValue);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w`;
  return date.toLocaleDateString();
}

/**
 * Format a creator handle for display.
 * Strips '@' prefix if present, handles raw userIds gracefully.
 */
export function formatCreatorHandle(handle?: string, fallback = 'User'): string {
  if (!handle) return fallback;
  // If it looks like a raw MongoDB ObjectId-style userId, show fallback
  if (handle.startsWith('user_') || /^[a-f0-9]{24}$/.test(handle)) return fallback;
  // Strip @ prefix for display, then re-add it
  const clean = handle.startsWith('@') ? handle : `@${handle}`;
  return clean;
}

/**
 * Get display initial from creator handle.
 */
export function getHandleInitial(handle?: string): string {
  if (!handle) return 'U';
  const clean = handle.startsWith('@') ? handle.slice(1) : handle;
  if (clean.startsWith('user_') || /^[a-f0-9]{24}$/.test(clean)) return 'U';
  return clean.charAt(0).toUpperCase();
}