'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import { usePathname } from 'next/navigation';
import MobileBottomNavigation from './BottomNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();

  // Pages that shouldn't have the mobile layout (full-screen pages)
  const isFullScreenPage = ['/auth', '/landing', '/onboarding'].some(path =>
    pathname.startsWith(path)
  );

  if (isFullScreenPage) {
    return <>{children}</>;
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8f9fa',
    }}>
      {/* Main Content Area */}
      <Container
        maxWidth={false}
        sx={{
          maxWidth: '428px !important',
          px: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          mx: 'auto',
          bgcolor: 'white',
          minHeight: '100vh',
          position: 'relative',
          // Add padding for bottom navigation
          paddingBottom: '90px', // 70px nav height + 20px spacing
        }}
      >
        {/* Page Content */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}>
          {children}
        </Box>
      </Container>

      {/* Bottom Navigation */}
      <MobileBottomNavigation />
    </Box>
  );
}