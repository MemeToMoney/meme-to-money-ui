'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Fab,
  Paper,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Home as HomeIcon,
  PlayArrow as ShortsIcon,
  CameraAlt as MemeCamIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  MoreHoriz as MoreIcon,
  Schedule as ScheduleIcon,
  AccountBalanceWallet as WalletIcon,
  Notifications as NotificationsIcon,
  EmojiEvents as BattlesIcon,
  Settings as SettingsIcon,
  Leaderboard as LeaderboardIcon,
  Article as BlogIcon,
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
    label: 'Search',
    value: '/search',
    icon: <SearchIcon />
  },
  {
    label: 'More',
    value: '__more__',
    icon: <MoreIcon />
  }
];

const moreMenuItems = [
  { label: 'Profile', value: '/profile', icon: <PersonIcon sx={{ fontSize: 20 }} /> },
  { label: 'Scheduled', value: '/scheduled', icon: <ScheduleIcon sx={{ fontSize: 20 }} /> },
  { label: 'Wallet', value: '/wallet', icon: <WalletIcon sx={{ fontSize: 20 }} /> },
  { label: 'Notifications', value: '/notifications', icon: <NotificationsIcon sx={{ fontSize: 20 }} /> },
  { label: 'Battles', value: '/battles', icon: <BattlesIcon sx={{ fontSize: 20 }} /> },
  { label: 'Blogs', value: '/blog', icon: <BlogIcon sx={{ fontSize: 20 }} /> },
  { label: 'Leaderboard', value: '/leaderboard', icon: <LeaderboardIcon sx={{ fontSize: 20 }} /> },
  { label: 'Settings', value: '/settings', icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
];

export default function MobileBottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);

  const handleNavigation = (newValue: string) => {
    if (newValue === '__more__') {
      return; // handled by click event
    }
    if (newValue) {
      router.push(newValue);
    }
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };

  const handleMoreItemClick = (path: string) => {
    handleMoreClose();
    router.push(path);
  };

  // Check if current path matches any "more" menu item
  const isMoreActive = moreMenuItems.some(item => pathname.startsWith(item.value));

  const handleCreateClick = () => {
    router.push('/meme-cam');
  };

  // Don't show navigation on auth pages, landing, meme cam, or full-screen pages
  const hideNavigation = ['/auth', '/landing', '/onboarding', '/meme-cam'].some(path =>
    pathname.startsWith(path)
  );

  if (hideNavigation) {
    return null;
  }

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      {/* Center Meme Cam FAB - fixed to viewport */}
      <Fab
        color="primary"
        onClick={handleCreateClick}
        sx={{
          position: 'fixed',
          bottom: 35,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
          width: 56,
          height: 56,
          zIndex: 1001,
          boxShadow: '0 8px 24px rgba(107, 70, 193, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)',
            boxShadow: '0 12px 32px rgba(107, 70, 193, 0.5)',
          },
          transition: 'all 0.2s ease',
          '&:active': {
            transform: 'translateX(-50%) scale(0.95)',
          }
        }}
      >
        <MemeCamIcon sx={{ color: 'white', fontSize: 28 }} />
      </Fab>

      {/* "Meme Cam" label below FAB */}
      <Typography
        variant="caption"
        onClick={handleCreateClick}
        sx={{
          position: 'fixed',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          fontSize: '0.6rem',
          fontWeight: 600,
          color: '#6B46C1',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Meme Cam
      </Typography>

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
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        elevation={8}
      >
        <BottomNavigation
          value={pathname}
          onChange={(event, newValue) => handleNavigation(newValue)}
          showLabels
          sx={{
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '8px 12px',
              transition: 'color 0.2s ease, transform 0.2s ease',
              '&.Mui-selected': {
                color: '#6B46C1',
                transform: 'translateY(-2px)',
              },
              '&:not(.Mui-selected)': {
                color: '#4B5563',
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
              fontWeight: 500,
              transition: 'font-weight 0.2s ease',
              '&.Mui-selected': {
                fontSize: '0.7rem',
                fontWeight: 700,
              }
            }
          }}
        >
          {navigationItems.map((item, index) => {
            // Center spacer for FAB
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
                    minWidth: 72
                  }}
                />
              );
            }

            if (item.value === '__more__') {
              return (
                <BottomNavigationAction
                  key="more"
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  onClick={handleMoreClick}
                  sx={{
                    color: isMoreActive ? '#6B46C1' : '#4B5563',
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      color: '#6B46C1',
                    },
                    '&:hover': {
                      color: '#6B46C1',
                    },
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
                  color: pathname === item.value ? '#6B46C1' : '#4B5563',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: '#6B46C1',
                  },
                  '&:hover': {
                    color: '#6B46C1',
                  },
                }}
              />
            );
          })}
        </BottomNavigation>
      </Paper>

      {/* More Menu */}
      <Menu
        anchorEl={moreAnchorEl}
        open={Boolean(moreAnchorEl)}
        onClose={handleMoreClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 200,
            mb: 1,
          }
        }}
      >
        {moreMenuItems.map((menuItem) => (
          <MenuItem
            key={menuItem.value}
            onClick={() => handleMoreItemClick(menuItem.value)}
            sx={{
              py: 1.5,
              px: 2.5,
              color: pathname.startsWith(menuItem.value) ? '#6B46C1' : '#374151',
              fontWeight: pathname.startsWith(menuItem.value) ? 700 : 400,
              '&:hover': { bgcolor: '#F5F3FF' },
            }}
          >
            <ListItemIcon sx={{ color: pathname.startsWith(menuItem.value) ? '#6B46C1' : '#6B7280' }}>
              {menuItem.icon}
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'inherit' }}>
              {menuItem.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
