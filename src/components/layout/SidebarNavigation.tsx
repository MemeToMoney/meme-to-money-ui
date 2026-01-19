'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button,
    Typography,
    Avatar,
    Divider
} from '@mui/material';
import {
    Home as HomeIcon,
    PlayArrow as ShortsIcon,
    Add as AddIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

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
        label: 'Notifications',
        value: '/notifications',
        icon: <NotificationsIcon />
    },
    {
        label: 'Profile',
        value: '/profile',
        icon: <PersonIcon />
    },
    {
        label: 'Settings',
        value: '/settings',
        icon: <SettingsIcon />
    }
];

export default function SidebarNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const handleLogout = () => {
        logout();
        router.push('/landing');
    };

    return (
        <Box sx={{
            width: 280,
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            borderRight: '1px solid rgba(0,0,0,0.06)',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)', // Glassmorphism
            display: 'flex',
            flexDirection: 'column',
            p: 3,
            zIndex: 1200
        }}>
            {/* Logo */}
            <Box sx={{ px: 2, mb: 5, mt: 1 }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: 'cursive',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #6B46C1 0%, #EC4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        cursor: 'pointer',
                        letterSpacing: '-0.02em',
                        fontSize: '1.75rem'
                    }}
                    onClick={() => router.push('/feed')}
                >
                    MemeToMoney
                </Typography>
            </Box>

            {/* Navigation Items */}
            <List sx={{ flex: 1, px: 0 }}>
                {navigationItems.map((item) => {
                    const isActive = pathname === item.value;
                    return (
                        <ListItem key={item.value} disablePadding sx={{ mb: 1.5 }}>
                            <ListItemButton
                                selected={isActive}
                                onClick={() => handleNavigation(item.value)}
                                sx={{
                                    borderRadius: 4,
                                    py: 1.5,
                                    px: 2.5,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&.Mui-selected': {
                                        bgcolor: '#6B46C1',
                                        color: 'white',
                                        boxShadow: '0 8px 20px rgba(107, 70, 193, 0.25)',
                                        '&:hover': {
                                            bgcolor: '#553C9A',
                                            boxShadow: '0 10px 25px rgba(107, 70, 193, 0.35)',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'white',
                                        }
                                    },
                                    '&:not(.Mui-selected):hover': {
                                        bgcolor: 'rgba(107, 70, 193, 0.04)',
                                        transform: 'translateX(4px)',
                                        '& .MuiListItemIcon-root': {
                                            color: '#6B46C1',
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 42,
                                    color: isActive ? 'white' : '#6B7280',
                                    transition: 'color 0.3s'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '1rem',
                                        letterSpacing: '0.01em'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}

                {/* Create Button */}
                <ListItem disablePadding sx={{ mt: 4, px: 1 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/upload')}
                        sx={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            py: 1.8,
                            borderRadius: 4,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 700,
                            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                boxShadow: '0 15px 30px rgba(16, 185, 129, 0.35)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Create Post
                    </Button>
                </ListItem>
            </List>

            {/* User Profile / Logout */}
            <Box sx={{ mt: 'auto', pt: 3, borderTop: '1px solid rgba(0,0,0,0.06)', px: 1 }}>
                {user && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 2,
                            p: 1.5,
                            borderRadius: 3,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.03)'
                            }
                        }}
                        onClick={() => router.push('/profile')}
                    >
                        <Avatar
                            src={user.profilePicture}
                            sx={{
                                width: 44,
                                height: 44,
                                bgcolor: '#6B46C1',
                                border: '2px solid white',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            {user.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden', flex: 1 }}>
                            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: '#111827' }}>
                                {user.displayName || user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                @{user.username || 'user'}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 3,
                        color: '#EF4444',
                        py: 1.2,
                        px: 2,
                        '&:hover': {
                            bgcolor: 'rgba(239, 68, 68, 0.08)',
                        }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: '#EF4444' }}>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{
                            fontWeight: 600,
                            fontSize: '0.95rem'
                        }}
                    />
                </ListItemButton>
            </Box>
        </Box>
    );
}
