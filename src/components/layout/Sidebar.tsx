'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Button,
  IconButton
} from '@mui/material';
import {
  Home as HomeIcon,
  PlayArrow as ShortsIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as ContestsIcon,
  Leaderboard as LeaderboardIcon,
  Analytics as AnalyticsIcon,
  AccountBalanceWallet as WalletIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: HomeIcon, path: '/', active: pathname === '/' },
    { label: 'Shorts', icon: ShortsIcon, path: '/shorts', badge: 'New', badgeColor: 'error', active: pathname === '/shorts' },
    { label: 'Trending', icon: TrendingIcon, path: '/trending', badge: 'Hot', badgeColor: 'error', active: pathname === '/trending' },
    { label: 'Contests', icon: ContestsIcon, path: '/contests', badge: '2', badgeColor: 'warning', active: pathname === '/contests' },
    { label: 'Leaderboard', icon: LeaderboardIcon, path: '/leaderboard', active: pathname === '/leaderboard' },
    { label: 'Analytics', icon: AnalyticsIcon, path: '/analytics', active: pathname === '/analytics' },
  ];

  const bottomItems = [
    { label: 'Wallet', icon: WalletIcon, path: '/wallet', active: pathname === '/wallet' },
    { label: 'Settings', icon: SettingsIcon, path: '/settings', active: pathname === '/settings' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        width: isOpen ? 240 : 60,
        height: '100vh',
        background: 'linear-gradient(180deg, #8B5FBF 0%, #6A4C93 50%, #5A4078 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        transition: 'width 0.3s ease',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isOpen && (
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              Meme to Money
            </Typography>
          )}
          <IconButton onClick={onToggle} sx={{ color: 'white', p: 0.5 }}>
            <MenuIcon />
          </IconButton>
        </Box>
        {isOpen && (
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
            Create • Compete • Earn
          </Typography>
        )}
      </Box>

      {/* User Profile Section */}
      {isOpen && (
        <Box sx={{ p: 2, pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#4FC3F7' }}>
              C
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                @Current User
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Creator Level 5
              </Typography>
            </Box>
          </Box>

          {/* Earnings Summary */}
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            p: 1.5,
            mb: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>This Week</Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>₹15,650</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Earned</Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>₹87,340</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Coin Balance</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ fontSize: 12, color: '#FFD700', mr: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>1250</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Items */}
      <Box sx={{ flex: 1 }}>
        <List sx={{ py: 0 }}>
          {navItems.map((item) => (
            <ListItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                cursor: 'pointer',
                px: 2,
                py: 1,
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: item.active ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                transition: 'background-color 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: isOpen ? 40 : 'auto' }}>
                <item.icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {isOpen && (
                <>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: item.active ? 'bold' : 'normal'
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      color={item.badgeColor as any}
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </>
              )}
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mx: 2, my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

        <List sx={{ py: 0 }}>
          {bottomItems.map((item) => (
            <ListItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                cursor: 'pointer',
                px: 2,
                py: 1,
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: item.active ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                transition: 'background-color 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: isOpen ? 40 : 'auto' }}>
                <item.icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {isOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: item.active ? 'bold' : 'normal'
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Go Premium Button */}
      {isOpen && (
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<StarIcon />}
            onClick={() => handleNavigation('/premium')}
            sx={{
              background: 'linear-gradient(45deg, #FFD700, #FFA000)',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(45deg, #FFA000, #FF8F00)',
              },
            }}
          >
            Go Premium
          </Button>
        </Box>
      )}

      {/* Footer */}
      {isOpen && (
        <Box sx={{ p: 2, pt: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.7rem' }}>
            © 2025 Meme to Money
          </Typography>
        </Box>
      )}
    </Box>
  );
}