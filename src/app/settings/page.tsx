'use client';

import React, { useState } from 'react';
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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Notifications as NotificationsIcon,
    Security as SecurityIcon,
    Help as HelpIcon,
    Lock as LockIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthAPI } from '@/lib/api/auth';
import { isApiSuccess } from '@/lib/api/client';

export default function SettingsPage() {
    const router = useRouter();
    const { logout, user } = useAuth();
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const isGoogleUser = user?.authProvider === 'google';

    const handleLogout = () => {
        logout();
        router.push('/landing');
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (!passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('Please fill in all fields');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await AuthAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
            if (isApiSuccess(response)) {
                setPasswordSuccess('Password changed successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setChangePasswordOpen(false), 1500);
            } else {
                setPasswordError((response as any).message || 'Failed to change password');
            }
        } catch (err: any) {
            setPasswordError(err.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
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
                        <ListItemButton
                            onClick={() => {
                                if (isGoogleUser) {
                                    setPasswordError('Your account uses Google login. Password cannot be changed here.');
                                    setChangePasswordOpen(true);
                                } else {
                                    setPasswordError('');
                                    setPasswordSuccess('');
                                    setChangePasswordOpen(true);
                                }
                            }}
                        >
                            <ListItemIcon>
                                <LockIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="Change Password" secondary="Update your account password" />
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

            {/* Change Password Dialog */}
            <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Change Password</DialogTitle>
                <DialogContent>
                    {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
                    {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
                    {!isGoogleUser && (
                        <>
                            <TextField
                                fullWidth
                                label="Current Password"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                sx={{ mb: 2, mt: 1 }}
                            />
                            <TextField
                                fullWidth
                                label="New Password"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setChangePasswordOpen(false)} sx={{ textTransform: 'none', color: '#6B7280' }}>
                        Cancel
                    </Button>
                    {!isGoogleUser && (
                        <Button
                            onClick={handleChangePassword}
                            variant="contained"
                            disabled={passwordLoading}
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#6B46C1',
                                '&:hover': { bgcolor: '#553C9A' },
                            }}
                        >
                            {passwordLoading ? <CircularProgress size={20} /> : 'Change Password'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}
