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
    Gavel as GavelIcon,
    Policy as PolicyIcon,
    Email as EmailIcon,
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
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);

    const isGoogleUser = user?.authProvider === 'google';

    const handleLogout = () => {
        logout();
        router.push('/landing');
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (!isGoogleUser && !passwordData.currentPassword) {
            setPasswordError('Please enter your current password');
            return;
        }
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
                setPasswordSuccess(isGoogleUser ? 'Password set successfully! You can now login with email & password.' : 'Password changed successfully!');
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
                {/* Account & Security */}
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, px: 1, mb: 0.5, display: 'block' }}>
                    ACCOUNT & SECURITY
                </Typography>
                <List sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', mb: 2 }}>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => router.push('/profile/edit')}>
                            <ListItemIcon>
                                <PersonIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="Edit Profile" secondary="Name, bio, profile picture, private account" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => {
                                setPasswordError('');
                                setPasswordSuccess('');
                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                setChangePasswordOpen(true);
                            }}
                        >
                            <ListItemIcon>
                                <LockIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary={isGoogleUser ? "Set Password" : "Change Password"} secondary={isGoogleUser ? "Create a password for your account" : "Update your account password"} />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <NotificationsIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="Notifications" secondary="Push notifications, email alerts" />
                        </ListItemButton>
                    </ListItem>
                </List>

                {/* Legal & Policies */}
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, px: 1, mb: 0.5, display: 'block' }}>
                    LEGAL & POLICIES
                </Typography>
                <List sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', mb: 2 }}>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => setPrivacyOpen(true)}>
                            <ListItemIcon>
                                <PolicyIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="Privacy Policy" secondary="How we collect and use your data" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => setTermsOpen(true)}>
                            <ListItemIcon>
                                <GavelIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="Terms of Service" secondary="Rules and guidelines for using MemeToMoney" />
                        </ListItemButton>
                    </ListItem>
                </List>

                {/* Support */}
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, px: 1, mb: 0.5, display: 'block' }}>
                    SUPPORT
                </Typography>
                <List sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', mb: 2 }}>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => window.open('mailto:support@upgradestacks.com')}>
                            <ListItemIcon>
                                <EmailIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="Contact Support" secondary="support@upgradestacks.com" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <HelpIcon sx={{ color: '#6B46C1' }} />
                            </ListItemIcon>
                            <ListItemText primary="FAQ & Help Center" secondary="Common questions and troubleshooting" />
                        </ListItemButton>
                    </ListItem>
                </List>

                <Box sx={{ mt: 1 }}>
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
                <DialogTitle sx={{ fontWeight: 700 }}>{isGoogleUser ? 'Set Password' : 'Change Password'}</DialogTitle>
                <DialogContent>
                    {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
                    {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
                    {isGoogleUser && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Create a password so you can also log in with email & password.
                        </Alert>
                    )}
                    {!isGoogleUser && (
                        <TextField
                            fullWidth
                            label="Current Password"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            sx={{ mb: 2, mt: 1 }}
                        />
                    )}
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        sx={{ mb: 2, ...(!isGoogleUser ? {} : { mt: 1 }) }}
                    />
                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setChangePasswordOpen(false)} sx={{ textTransform: 'none', color: '#6B7280' }}>
                        Cancel
                    </Button>
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
                        {passwordLoading ? <CircularProgress size={20} /> : (isGoogleUser ? 'Set Password' : 'Change Password')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Privacy Policy Dialog */}
            <Dialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Privacy Policy</DialogTitle>
                <DialogContent dividers sx={{ '& h3': { mt: 2, mb: 1, fontSize: '1rem', fontWeight: 700, color: '#374151' }, '& p': { color: '#4B5563', fontSize: '0.875rem', lineHeight: 1.7, mb: 1.5 } }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>Last updated: March 2026</Typography>

                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide when creating an account (name, email, phone number), profile data (bio, profile picture, handle), and content you upload (memes, videos). We also collect usage data including views, likes, comments, shares, and engagement metrics to calculate your coin earnings.</p>

                    <h3>2. How We Use Your Information</h3>
                    <p>Your information is used to: provide and personalize the MemeToMoney platform, calculate and award coin earnings based on your content performance, process payments and withdrawals via Razorpay, send you OTP codes and account notifications via email, display your profile to other users, and improve our services.</p>

                    <h3>3. Monetization & Payments</h3>
                    <p>We track content engagement (views, likes, comments, shares) to award coins (100 coins = {'\u20B9'}1). Payment processing for coin purchases is handled by Razorpay. For withdrawals, we collect UPI IDs or bank account details (account number, IFSC code) to process payouts. Minimum withdrawal is 10,000 coins ({'\u20B9'}100). KYC verification may be required for payouts.</p>

                    <h3>4. Data Sharing</h3>
                    <p>We do not sell your personal data. We share data only with: Razorpay (for payment processing), Google (if you use Google Sign-In), email service providers (for notifications and OTP), and as required by Indian law.</p>

                    <h3>5. Private Accounts</h3>
                    <p>You can set your account to private. When private, only approved followers can see your content. Follow requests require your manual approval. Your profile name, handle, and bio remain visible to all users.</p>

                    <h3>6. Data Security</h3>
                    <p>We use JWT-based authentication, encrypted passwords (BCrypt), and secure HTTPS connections. Payment data is handled by Razorpay&apos;s PCI-DSS compliant infrastructure. We do not store your card or UPI PIN details.</p>

                    <h3>7. Your Rights</h3>
                    <p>You can: edit or delete your profile, download your data, delete your account, change privacy settings, and opt out of notifications. To exercise these rights, contact support@upgradestacks.com.</p>

                    <h3>8. Contact</h3>
                    <p>For privacy concerns, email us at support@upgradestacks.com.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPrivacyOpen(false)} sx={{ textTransform: 'none', color: '#6B46C1' }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Terms of Service Dialog */}
            <Dialog open={termsOpen} onClose={() => setTermsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Terms of Service</DialogTitle>
                <DialogContent dividers sx={{ '& h3': { mt: 2, mb: 1, fontSize: '1rem', fontWeight: 700, color: '#374151' }, '& p': { color: '#4B5563', fontSize: '0.875rem', lineHeight: 1.7, mb: 1.5 } }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>Last updated: March 2026</Typography>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By using MemeToMoney, you agree to these terms. You must be at least 13 years old to use this platform. If you are under 18, you need parental consent.</p>

                    <h3>2. Account Responsibilities</h3>
                    <p>You are responsible for maintaining the security of your account. Do not share your password. You may log in via email/password or Google Sign-In. Each user may have only one account.</p>

                    <h3>3. Content Guidelines</h3>
                    <p>You retain ownership of content you upload. By uploading, you grant MemeToMoney a license to display, distribute, and promote your content on the platform. Prohibited content includes: explicit/adult content, hate speech, harassment, violence, copyright infringement, spam, and misleading information. We reserve the right to remove content that violates these guidelines.</p>

                    <h3>4. Coin Earnings & Monetization</h3>
                    <p>Coins are earned through content engagement: uploads (+10), views (+5 per 100), likes (+1), comments (+2), shares (+3), new followers (+2), and daily login (+5). Daily earning caps apply per category. Coins cannot be transferred between users except via the tipping feature. Conversion rate: 100 coins = {'\u20B9'}1. We reserve the right to adjust earning rates and caps.</p>

                    <h3>5. Purchases & Withdrawals</h3>
                    <p>Coin purchases are processed via Razorpay and are non-refundable once coins are credited. Withdrawals require a minimum of 10,000 coins ({'\u20B9'}100) and can be made via UPI or bank transfer. Payout requests are reviewed and processed within 3-7 business days. We may require KYC verification before processing payouts.</p>

                    <h3>6. Meme Battles</h3>
                    <p>Battles are optional competitive features. Entry fees (in coins) are non-refundable once a battle starts. Winners are decided by community votes. Inactive battles may be auto-cancelled (waiting: 24h, active: 48h, voting ends: 24h).</p>

                    <h3>7. Fair Use & Anti-Gaming</h3>
                    <p>Self-engagement (liking/commenting on your own content) does not earn coins. Automated or bot activity is prohibited. We reserve the right to suspend accounts and forfeit coins for any manipulation or abuse of the earning system.</p>

                    <h3>8. Termination</h3>
                    <p>We may suspend or terminate accounts that violate these terms. Upon termination, any pending payouts may be forfeited. You may delete your account at any time through settings.</p>

                    <h3>9. Limitation of Liability</h3>
                    <p>MemeToMoney is provided &quot;as is&quot;. We are not liable for any losses from platform downtime, payment failures, or content disputes. Our total liability is limited to the amount you have paid in the last 12 months.</p>

                    <h3>10. Contact</h3>
                    <p>For questions about these terms, email support@upgradestacks.com.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTermsOpen(false)} sx={{ textTransform: 'none', color: '#6B46C1' }}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
