// Authentication API Integration
// Connects with User Service authentication endpoints

import { userServiceClient, contentServiceClient, handleApiResponse, ApiResponse, User, TokenManager } from './client';

// Request/Response types matching your API spec
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  mobileNumber: number;
  password: string;
  address?: string;
  referralCode?: string;
}

export interface ReferralInfo {
  referralCode: string;
  referralCount: number;
  referralLink: string;
  referredBy: string | null;
}

export interface ReferrerInfo {
  name: string;
  displayName: string | null;
  profilePicture: string | null;
  referralCode: string;
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
      const response = await handleApiResponse<{ [key: string]: any }>(
        userServiceClient.post('/api/auth/login', credentials)
      );

      if (response.status === 200 && response.data) {
        const token = response.data.token || response.data.accessToken || response.data.jwt;
        const userId = response.data.userId || response.data.id || response.data.user?.id;

        if (token) {
          // Store token for future requests
          TokenManager.setToken(token);

          // Fetch full user profile from backend
          const profileResponse = await this.getCurrentUser();
          const user: User = profileResponse.data || {
            id: userId || '',
            name: response.data.name || '',
            email: credentials.email,
            followerCount: 0,
            followingCount: 0,
            totalEarnings: 0,
            weeklyEarnings: 0,
            coinBalance: 0,
            kycStatus: 'NOT_SUBMITTED',
            isContentCreator: false,
            onboardingCompleted: false,
          } as User;

          return {
            status: 200,
            message: 'Login successful',
            data: {
              token,
              userId: user.id || userId || '',
              user
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
    // Build query parameters as your API expects
    const queryParams = new URLSearchParams({
      name: userData.name,
      email: userData.email,
      mobileNumber: userData.mobileNumber.toString(),
      password: userData.password
    });

    // Add optional address if provided
    if (userData.address) {
      queryParams.append('address', userData.address);
    }

    // Add optional referral code if provided
    if (userData.referralCode) {
      queryParams.append('referralCode', userData.referralCode);
    }

    const response = await handleApiResponse<string>(
      userServiceClient.post(`/api/auth/register?${queryParams.toString()}`, {})
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
          onboardingCompleted: userData.onboardingCompleted ?? false,
          website: userData.website,
          socialLinks: userData.socialLinks,
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

      if (response.status === 200) {
        // The PATCH returns just the user ID, so fetch the full profile
        const profileResponse = await this.getCurrentUser();
        if (profileResponse.status === 200 && profileResponse.data) {
          return {
            status: 200,
            message: 'Profile updated successfully',
            data: profileResponse.data
          };
        }
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
    try {
      // 1. Upload to Content Service (GCS)
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await contentServiceClient.post('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadResponse.status !== 200 || !uploadResponse.data) {
        throw new Error('Failed to upload image to storage');
      }

      const imageUrl = uploadResponse.data; // The API returns the URL string directly

      // 2. Update User Profile with the new URL
      const updateResponse = await handleApiResponse<{ [key: string]: any }>(
        userServiceClient.patch('/api/users/me', { profilePicture: imageUrl })
      );

      return updateResponse;
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      return {
        status: 500,
        message: error.message || 'Failed to upload profile picture',
        data: null as any
      };
    }
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

  // ==================== Referral APIs ====================

  /**
   * Get current user's referral info (authenticated)
   * GET /api/users/me/referral
   */
  static async getReferralInfo(): Promise<ApiResponse<ReferralInfo>> {
    return handleApiResponse<ReferralInfo>(
      userServiceClient.get('/api/users/me/referral')
    );
  }

  /**
   * Apply a referral code to the current user's account (authenticated)
   * POST /api/users/me/apply-referral
   */
  static async applyReferralCode(code: string): Promise<ApiResponse<string>> {
    return handleApiResponse<string>(
      userServiceClient.post('/api/users/me/apply-referral', { referralCode: code })
    );
  }

  /**
   * Get referrer info by referral code (public, no auth required)
   * GET /api/users/referral/{code}
   */
  static async getReferrerInfo(code: string): Promise<ApiResponse<ReferrerInfo>> {
    return handleApiResponse<ReferrerInfo>(
      userServiceClient.get(`/api/users/referral/${encodeURIComponent(code)}`)
    );
  }

  // ==================== Password APIs ====================

  /**
   * Change password (authenticated)
   * POST /api/auth/change-password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<string>> {
    return handleApiResponse<string>(
      userServiceClient.post('/api/auth/change-password', { currentPassword, newPassword })
    );
  }

  /**
   * Forgot password - send OTP to email (public)
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(email: string): Promise<ApiResponse<string>> {
    return handleApiResponse<string>(
      userServiceClient.post(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`, {})
    );
  }

  /**
   * Reset password with OTP (public)
   * POST /api/auth/reset-password
   */
  static async resetPassword(email: string, code: string, newPassword: string): Promise<ApiResponse<string>> {
    return handleApiResponse<string>(
      userServiceClient.post('/api/auth/reset-password', { email, code, newPassword })
    );
  }
}