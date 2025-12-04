'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Fab,
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  PlayArrow as ShortsIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const navigationItems = [
  {
    label: 'Home',
    value: '/feed',
    icon: <HomeIcon />
  },
  {
    label: 'Shorts',
    value: '/shorts',
    icon: <ShortsIcon />
  },
  {
    label: '', // Empty for center FAB
    value: '',
    icon: null
  },
  {
    label: 'Notifications',
    value: '/notifications',
    icon: <NotificationsIcon />
  },
  {
    label: 'Profile',
    value: '/profile',
    icon: <PersonIcon />
  }
];

export default function MobileBottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (newValue: string) => {
    if (newValue) {
      router.push(newValue);
    }
  };

  const handleCreateClick = () => {
    router.push('/upload');
  };

  // Don't show navigation on auth pages or landing
  const hideNavigation = ['/auth', '/landing', '/onboarding'].some(path =>
    pathname.startsWith(path)
  );

  if (hideNavigation) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Center Create FAB */}
      <Fab
        color="primary"
        onClick={handleCreateClick}
        sx={{
          position: 'absolute',
          top: -28,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
          width: 56,
          height: 56,
          zIndex: 1,
          boxShadow: '0 8px 24px rgba(107, 70, 193, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)',
            boxShadow: '0 12px 32px rgba(107, 70, 193, 0.5)',
          },
          '&:active': {
            transform: 'translateX(-50%) scale(0.95)',
          }
        }}
      >
        <AddIcon sx={{ color: 'white', fontSize: 28 }} />
      </Fab>

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          background: 'white',
          // Safe area padding for mobile devices
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        elevation={8}
      >
        <BottomNavigation
          value={pathname}
          onChange={(event, newValue) => handleNavigation(newValue)}
          showLabels
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '8px 12px',
              '&.Mui-selected': {
                color: '#6B46C1',
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
              '&.Mui-selected': {
                fontSize: '0.75rem',
              }
            }
          }}
        >
          {navigationItems.map((item, index) => {
            // Skip the center item (create button)
            if (index === 2) {
              return (
                <BottomNavigationAction
                  key="create-spacer"
                  label=""
                  value=""
                  icon={null}
                  disabled
                  sx={{
                    opacity: 0,
                    pointerEvents: 'none',
                    minWidth: 64 // Reserve space for FAB
                  }}
                />
              );
            }

            return (
              <BottomNavigationAction
                key={item.value}
                label={item.label}
                value={item.value}
                icon={item.icon}
                sx={{
                  color: pathname === item.value ? '#6B46C1' : '#6B7280',
                  '&.Mui-selected': {
                    color: '#6B46C1',
                  }
                }}
              />
            );
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}