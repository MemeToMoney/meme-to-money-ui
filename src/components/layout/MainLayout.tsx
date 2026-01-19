'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import MobileLayout from './MobileLayout';
import SidebarNavigation from './SidebarNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Pages that shouldn't have the sidebar/mobile layout (full-screen pages)
  const isFullScreenPage = ['/auth', '/landing', '/onboarding'].some(path =>
    pathname.startsWith(path)
  );

  if (isFullScreenPage) {
    return <>{children}</>;
  }

  // Mobile Layout
  if (!isDesktop) {
    return (
      <MobileLayout>
        {children}
      </MobileLayout>
    );
  }

  // Desktop Layout
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      <SidebarNavigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: '280px', // Width of sidebar
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden' // Prevent double scrollbars
        }}
      >
        {children}
      </Box>
    </Box>
  );
}