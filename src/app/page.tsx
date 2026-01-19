'use client';

import React, { useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  // Router: redirects to landing, onboarding, or feed based on auth status

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Check if user has completed onboarding
        if (!user.onboardingCompleted) {
          // New users go to onboarding
          router.push('/onboarding');
        } else {
          // Existing users go to feed
          router.push('/feed');
        }
      } else {
        // Unauthenticated users go to landing page
        router.push('/landing');
      }
    }
  }, [isAuthenticated, loading, user, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  // Return null while redirecting
  return null;
}