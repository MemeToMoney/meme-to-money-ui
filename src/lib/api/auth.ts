// Authentication API Integration
// Connects with User Service authentication endpoints

import { userServiceClient, handleApiResponse, ApiResponse, User, TokenManager } from './client';

// Request/Response types matching your API spec
export interface LoginRequest {
  emailOrMobile: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  mobileNumber: number;
  password: string;
  address?: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  userId: string;
}

// Authentication API functions
export class AuthAPI {
  /**
   * Login with email/mobile and password
   * POST /api/auth/login
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('Attempting login with:', credentials);

      // Demo credentials for testing
      if (credentials.emailOrMobile === 'demo@example.com' && credentials.password === 'demo123') {
        const mockToken = 'demo-jwt-token-' + Date.now();
        TokenManager.setToken(mockToken);

        const mockUser: User = {
          id: 'demo-user-1',
          name: 'Demo User',
          email: 'demo@example.com',
          username: 'demouser',
          displayName: 'Demo User',
          bio: 'This is a demo account for testing',
          profilePicture: undefined,
          followerCount: 1234,
          followingCount: 567,
          totalEarnings: 15650,
          weeklyEarnings: 2340,
          coinBalance: 1250,
          kycStatus: 'VERIFIED',
          isContentCreator: true,
          creatorHandle: '@demouser',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return {
          status: 200,
          message: 'Demo login successful',
          data: {
            token: mockToken,
            userId: 'demo-user-1',
            user: mockUser
          } as LoginResponse
        };
      }

      const response = await handleApiResponse<{ [key: string]: any }>(
        userServiceClient.post('/api/auth/login', credentials)
      );

      console.log('Login API response:', response);

      if (response.status === 200 && response.data) {
        // Extract token and user info from response
        const token = response.data.token || response.data.accessToken || response.data.jwt;
        const userId = response.data.userId || response.data.id || response.data.user?.id;

        if (token) {
          // Store token for future requests
          TokenManager.setToken(token);

          // Create mock user data for now since we don't have user profile endpoint working
          const mockUser: User = {
            id: userId || '1',
            name: response.data.name || response.data.user?.name || 'Test User',
            email: credentials.emailOrMobile,
            username: response.data.username || response.data.user?.username,
            displayName: response.data.displayName || response.data.user?.displayName,
            bio: response.data.bio || response.data.user?.bio,
            profilePicture: response.data.profilePicture || response.data.user?.profilePicture,
            followerCount: response.data.followerCount || 0,
            followingCount: response.data.followingCount || 0,
            totalEarnings: response.data.totalEarnings || 0,
            weeklyEarnings: response.data.weeklyEarnings || 0,
            coinBalance: response.data.coinBalance || 0,
            kycStatus: response.data.kycStatus || 'NOT_SUBMITTED',
            isContentCreator: response.data.isContentCreator || false,
            creatorHandle: response.data.creatorHandle,
            createdAt: response.data.createdAt || new Date().toISOString(),
            updatedAt: response.data.updatedAt || new Date().toISOString()
          };

          return {
            status: 200,
            message: 'Login successful',
            data: {
              token,
              userId: userId || '1',
              user: mockUser
            } as LoginResponse
          };
        }
      }

      return {
        status: response.status,
        message: response.message || 'Login failed',
        data: null as any
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        status: 401,
        message: error.message || 'Login failed',
        data: null as any
      };
    }
  }

  /**
   * Register new user account
   * POST /api/auth/register (uses query params)
   */
  static async register(userData: RegisterRequest): Promise<ApiResponse<string>> {
    const response = await handleApiResponse<string>(
      userServiceClient.post('/api/auth/register', null, { params: userData })
    );

    return response;
  }

  /**
   * Google OAuth authentication
   * POST /api/auth/google
   */
  static async googleAuth(googleData: GoogleAuthRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await handleApiResponse<{ [key: string]: string }>(
      userServiceClient.post('/api/auth/google', googleData)
    );

    if (response.status === 200 && response.data) {
      const token = response.data.token || response.data.accessToken;
      const userId = response.data.userId || response.data.id;

      if (token) {
        TokenManager.setToken(token);

        const userProfile = await this.getCurrentUser();

        return {
          status: 200,
          message: 'Google authentication successful',
          data: {
            token,
            userId,
            user: userProfile.data as User
          } as LoginResponse
        };
      }
    }

    return {
      status: response.status,
      message: response.message || 'Google authentication failed',
      data: null as any
    };
  }

  /**
   * Get current authenticated user profile
   * GET /api/users/me
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await handleApiResponse<{ [key: string]: any }>(
        userServiceClient.get('/api/users/me')
      );

      if (response.status === 200 && response.data) {
        // The response.data contains the user data directly
        const userData = response.data.data || response.data;

        // Ensure all required fields have default values
        const user: User = {
          id: userData.id || '',
          name: userData.name || userData.displayName || '',
          email: userData.email || '',
          username: userData.username,
          displayName: userData.displayName,
          bio: userData.bio || '',
          profilePicture: userData.profilePicture,
          followerCount: userData.followerCount || 0,
          followingCount: userData.followingCount || 0,
          totalEarnings: userData.totalEarnings || 0,
          weeklyEarnings: userData.weeklyEarnings || 0,
          coinBalance: userData.coinBalance || 0,
          kycStatus: userData.kycStatus || 'NOT_SUBMITTED',
          isContentCreator: userData.isContentCreator || false,
          creatorHandle: userData.creatorHandle,
          mobileNumber: userData.mobileNumber,
          country: userData.country,
          address: userData.address,
          isGod: userData.isGod,
          authProvider: userData.authProvider,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        };

        return {
          status: 200,
          message: 'User profile retrieved successfully',
          data: user
        };
      }

      return {
        status: response.status,
        message: response.message || 'Failed to get user profile',
        data: null as any
      };
    } catch (error: any) {
      console.error('Get current user error:', error);
      return {
        status: 500,
        message: error.message || 'Failed to get user profile',
        data: null as any
      };
    }
  }

  /**
   * Update current user profile
   * PATCH /api/users/me
   */
  static async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await handleApiResponse<{ [key: string]: any }>(
        userServiceClient.patch('/api/users/me', profileData)
      );

      if (response.status === 200 && response.data) {
        const userData = response.data.data || response.data;

        const user: User = {
          id: userData.id || '',
          name: userData.name || userData.displayName || '',
          email: userData.email || '',
          username: userData.username,
          displayName: userData.displayName,
          bio: userData.bio || '',
          profilePicture: userData.profilePicture,
          followerCount: userData.followerCount || 0,
          followingCount: userData.followingCount || 0,
          totalEarnings: userData.totalEarnings || 0,
          weeklyEarnings: userData.weeklyEarnings || 0,
          coinBalance: userData.coinBalance || 0,
          kycStatus: userData.kycStatus || 'NOT_SUBMITTED',
          isContentCreator: userData.isContentCreator || false,
          creatorHandle: userData.creatorHandle,
          mobileNumber: userData.mobileNumber,
          country: userData.country,
          address: userData.address,
          isGod: userData.isGod,
          authProvider: userData.authProvider,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        };

        return {
          status: 200,
          message: 'Profile updated successfully',
          data: user
        };
      }

      return {
        status: response.status,
        message: response.message || 'Failed to update profile',
        data: null as any
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        status: 500,
        message: error.message || 'Failed to update profile',
        data: null as any
      };
    }
  }

  /**
   * Upload profile picture
   * POST /api/users/me/profile-picture
   */
  static async uploadProfilePicture(file: File): Promise<ApiResponse<{ [key: string]: any }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await handleApiResponse<{ [key: string]: any }>(
      userServiceClient.post('/api/users/me/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );

    return response;
  }

  /**
   * Logout user (clear local storage)
   */
  static logout(): void {
    TokenManager.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return TokenManager.getToken() !== null;
  }

  /**
   * Validate current token
   * POST /api/token/validate
   */
  static async validateToken(): Promise<ApiResponse<{ [key: string]: any }>> {
    const token = TokenManager.getToken();

    if (!token) {
      return {
        status: 401,
        message: 'No token found',
        data: null as any
      };
    }

    const response = await handleApiResponse<{ [key: string]: any }>(
      userServiceClient.post('/api/token/validate', { token })
    );

    return response;
  }
}