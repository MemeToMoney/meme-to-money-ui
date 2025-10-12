'use client';

import React, { useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  // Router: redirects to landing or feed based on auth status

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Authenticated users go to feed
        router.push('/feed');
      } else {
        // Unauthenticated users go to landing page
        router.push('/landing');
      }
    }
  }, [isAuthenticated, loading, router]);

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