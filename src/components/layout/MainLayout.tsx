'use client';

import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          marginLeft: sidebarOpen ? '240px' : '60px',
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          [theme.breakpoints.down('md')]: {
            marginLeft: sidebarOpen ? '240px' : '0px',
          },
        }}
      >
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <Box
            onClick={handleSidebarToggle}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }}
          />
        )}

        {/* Content Area */}
        <Box sx={{ minHeight: '100vh' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}