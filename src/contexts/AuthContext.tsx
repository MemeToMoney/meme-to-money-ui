'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, TokenManager } from '@/lib/api/client';
import { AuthAPI } from '@/lib/api/auth';
import { isApiSuccess } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrMobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = TokenManager.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Validate token and get user profile
      const response = await AuthAPI.getCurrentUser();
      if (isApiSuccess(response)) {
        setUser(response.data);
      } else {
        // Token is invalid, remove it
        TokenManager.removeToken();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      TokenManager.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrMobile: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Starting login process');
      const response = await AuthAPI.login({ emailOrMobile, password });
      console.log('AuthContext: Login response received:', response);

      if (isApiSuccess(response)) {
        console.log('AuthContext: Login successful, setting user data:', response.data.user);
        setUser(response.data.user);
        return true;
      } else {
        console.log('AuthContext: Login failed, response not successful:', response);
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Login failed with error:', error);
      return false;
    }
  };

  const logout = () => {
    AuthAPI.logout();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      const response = await AuthAPI.updateProfile(profileData);
      if (isApiSuccess(response)) {
        setUser(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    updateUser,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};