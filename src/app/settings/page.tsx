'use client';

import React from 'react';
import {
    Box,
    Typography,
    Container,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    IconButton
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Notifications as NotificationsIcon,
    Security as SecurityIcon,
    Help as HelpIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/landing');
    };

    return (
        <Container maxWidth={false} sx={{ p: 0, height: '100%', bgcolor: '#f8f9fa' }}>
            {/* Header */}
            <Box sx={{
                position: 'sticky',
                top: 0,
                bgcolor: 'white',
                zIndex: 1,
                p: 2,
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <IconButton onClick={() => router.back()}>
                    <ArrowBackIcon sx={{ color: '#374151' }} />
                </IconButton>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        color: '#374151'
                    }}
                >
                    Settings
                </Typography>
            </Box>

            <Box sx={{ p: 2 }}>
                <List sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <PersonIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="Account" secondary="Privacy, security, change number" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <NotificationsIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="Notifications" secondary="Message, group & call tones" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <SecurityIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="Privacy" secondary="Block contacts, disappearing messages" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <HelpIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="Help" secondary="Help center, contact us, privacy policy" />
                        </ListItemButton>
                    </ListItem>
                </List>

                <Box sx={{ mt: 3 }}>
                    <List sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon sx={{ color: '#EF4444' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Logout"
                                    primaryTypographyProps={{ color: '#EF4444', fontWeight: 'bold' }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        MemeToMoney v1.0.0 (Beta)
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}
