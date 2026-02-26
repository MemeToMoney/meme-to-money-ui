'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Stars as StarsIcon,
  EmojiEvents as TrophyIcon,
  CardGiftcard as GiftIcon,
  Verified as VerifiedIcon,
  MonetizationOn as CoinIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthAPI, ReferralInfo } from '@/lib/api/auth';
import { isApiSuccess } from '@/lib/api/client';

const PERKS = [
  {
    icon: <CoinIcon sx={{ fontSize: 28, color: '#F59E0B' }} />,
    title: 'Both get 100 coins',
    description: 'You and your friend each earn 100 coins when they sign up.',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 28, color: '#6B46C1' }} />,
    title: 'Unlock exclusive badges',
    description: 'Earn the "Super Referrer" badge after 5 successful referrals.',
  },
  {
    icon: <TrophyIcon sx={{ fontSize: 28, color: '#EF4444' }} />,
    title: 'Climb the leaderboard',
    description: 'Top referrers get featured on the weekly leaderboard.',
  },
  {
    icon: <StarsIcon sx={{ fontSize: 28, color: '#10B981' }} />,
    title: 'Early access to features',
    description: 'Unlock beta features before anyone else with 10+ referrals.',
  },
];

function InvitePageContent() {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadReferralInfo();
  }, []);

  const loadReferralInfo = async () => {
    try {
      setLoading(true);
      const response = await AuthAPI.getReferralInfo();
      if (isApiSuccess(response)) {
        setReferralInfo(response.data);
      }
    } catch (err) {
      console.error('Failed to load referral info:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://memetomoney.com';
    return `${baseUrl}/invite/${referralInfo?.referralCode || ''}`;
  };

  const handleCopyCode = async () => {
    if (!referralInfo?.referralCode) return;
    try {
      await navigator.clipboard.writeText(referralInfo.referralCode);
      showSnackbar('Referral code copied!');
    } catch {
      showSnackbar('Failed to copy code');
    }
  };

  const handleCopyLink = async () => {
    const link = getReferralLink();
    try {
      await navigator.clipboard.writeText(link);
      showSnackbar('Referral link copied!');
    } catch {
      showSnackbar('Failed to copy link');
    }
  };

  const handleShare = async () => {
    const link = getReferralLink();
    const shareData = {
      title: 'Join MemeToMoney!',
      text: `Join MemeToMoney using my referral code and we both earn 100 coins! Use code: ${referralInfo?.referralCode}`,
      url: link,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        // User cancelled share or share failed
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#6B46C1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      {/* Header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        bgcolor: 'white',
        zIndex: 10,
        p: 2,
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        <IconButton onClick={() => router.back()} size="small">
          <ArrowBackIcon sx={{ color: '#374151' }} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6B46C1' }}>
          Refer & Earn
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, pt: 3 }}>
        {/* Hero Section */}
        <Box sx={{
          textAlign: 'center',
          mb: 3,
          p: 3,
          background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #A855F7 100%)',
          borderRadius: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <Box sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
          }} />

          <GiftIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Invite Friends, Earn Rewards
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 300, mx: 'auto' }}>
            Share your referral code and both you and your friend earn 100 coins!
          </Typography>
        </Box>

        {/* Referral Code Card */}
        <Card sx={{
          mb: 3,
          borderRadius: 3,
          border: '2px solid #E9D5FF',
          boxShadow: '0 4px 16px rgba(107, 70, 193, 0.08)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#6B7280', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Referral Code
            </Typography>

            {/* Code display */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              p: 2,
              mb: 2,
              bgcolor: '#F5F3FF',
              borderRadius: 3,
              border: '1px dashed #C4B5FD',
            }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#6B46C1',
                  letterSpacing: '0.15em',
                  fontFamily: 'monospace',
                }}
              >
                {referralInfo?.referralCode || '---'}
              </Typography>
              <IconButton
                onClick={handleCopyCode}
                sx={{
                  bgcolor: '#6B46C1',
                  color: 'white',
                  width: 36,
                  height: 36,
                  '&:hover': { bgcolor: '#553C9A' },
                }}
              >
                <CopyIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CopyIcon />}
                onClick={handleCopyLink}
                sx={{
                  textTransform: 'none',
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  fontWeight: 600,
                  borderRadius: 2,
                  py: 1.2,
                  '&:hover': { borderColor: '#6B46C1', color: '#6B46C1' },
                }}
              >
                Copy Link
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ShareIcon />}
                onClick={handleShare}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#6B46C1',
                  fontWeight: 600,
                  borderRadius: 2,
                  py: 1.2,
                  boxShadow: '0 4px 12px rgba(107, 70, 193, 0.3)',
                  '&:hover': { bgcolor: '#553C9A' },
                }}
              >
                Share
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Referral Stats */}
        <Card sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#6B7280', fontWeight: 600, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Referral Stats
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{
                flex: 1,
                textAlign: 'center',
                p: 2,
                bgcolor: '#F5F3FF',
                borderRadius: 3,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <PeopleIcon sx={{ fontSize: 20, color: '#6B46C1', mr: 0.5 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#6B46C1' }}>
                  {referralInfo?.referralCount || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>
                  Friends Referred
                </Typography>
              </Box>
              <Box sx={{
                flex: 1,
                textAlign: 'center',
                p: 2,
                bgcolor: '#FEF9C3',
                borderRadius: 3,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <CoinIcon sx={{ fontSize: 20, color: '#D97706', mr: 0.5 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#D97706' }}>
                  {(referralInfo?.referralCount || 0) * 100}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>
                  Coins Earned
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Perks / Rewards List */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#374151', mb: 2, px: 0.5 }}>
          Referral Rewards
        </Typography>

        {PERKS.map((perk, index) => (
          <Card
            key={index}
            sx={{
              mb: 1.5,
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s',
              '&:hover': { boxShadow: '0 4px 12px rgba(107, 70, 193, 0.1)' },
            }}
          >
            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#F5F3FF',
                  flexShrink: 0,
                }}
              >
                {perk.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 0.25 }}>
                  {perk.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280', lineHeight: 1.4 }}>
                  {perk.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}

        {/* How it works */}
        <Box sx={{ mt: 3, mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#374151', mb: 2, px: 0.5 }}>
            How It Works
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 0.5 }}>
            {[
              { step: '1', text: 'Share your unique referral code or link with friends' },
              { step: '2', text: 'Your friend signs up using your code' },
              { step: '3', text: 'Both of you earn 100 coins instantly!' },
            ].map((item) => (
              <Box key={item.step} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#6B46C1',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                }}>
                  {item.step}
                </Avatar>
                <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function InvitePage() {
  return (
    <ProtectedRoute>
      <InvitePageContent />
    </ProtectedRoute>
  );
}
