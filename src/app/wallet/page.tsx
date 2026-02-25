'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  TrendingUp as EarningsIcon,
  Star as CoinIcon,
  VerifiedUser as KycIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { IconButton } from '@mui/material';

function WalletPageContent() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const kycStatusColor = {
    NOT_SUBMITTED: '#6B7280',
    PENDING: '#F59E0B',
    VERIFIED: '#10B981',
    REJECTED: '#EF4444',
    EXPIRED: '#EF4444',
  }[user.kycStatus || 'NOT_SUBMITTED'];

  const kycStatusLabel = {
    NOT_SUBMITTED: 'Not Submitted',
    PENDING: 'Pending Review',
    VERIFIED: 'Verified',
    REJECTED: 'Rejected',
    EXPIRED: 'Expired',
  }[user.kycStatus || 'NOT_SUBMITTED'];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      {/* Header */}
      <Box sx={{
        position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1,
        p: 2, borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <IconButton onClick={() => router.back()}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6B46C1', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WalletIcon /> Wallet
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {/* Main Balance Card */}
        <Card sx={{
          borderRadius: 4, mb: 3,
          background: 'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 50%, #A78BFA 100%)',
          color: 'white', boxShadow: '0 8px 32px rgba(107, 70, 193, 0.3)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>Coin Balance</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {(user.coinBalance || 0).toLocaleString()}
              <Typography component="span" variant="h6" sx={{ ml: 1, opacity: 0.8, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>coins</Typography>
            </Typography>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ opacity: 0.8, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>Total Earnings</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{(user.totalEarnings || 0).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ opacity: 0.8, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>This Week</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{(user.weeklyEarnings || 0).toLocaleString()}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* KYC Status */}
        <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s ease-in-out', '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.12)' } }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <KycIcon sx={{ color: kycStatusColor }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>KYC Verification</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Required for payouts</Typography>
                </Box>
              </Box>
              <Chip label={kycStatusLabel} size="small" sx={{ bgcolor: `${kycStatusColor}15`, color: kycStatusColor, fontWeight: 600 }} />
            </Box>
            {user.kycStatus === 'NOT_SUBMITTED' && (
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2, textTransform: 'none', borderColor: '#6B46C1', color: '#6B46C1', borderRadius: 2, transition: 'all 0.2s ease', '&:hover': { bgcolor: 'rgba(107, 70, 193, 0.04)', borderColor: '#553C9A', transform: 'translateY(-1px)' } }}
                onClick={() => router.push('/settings')}
              >
                Submit KYC Documents
              </Button>
            )}
          </CardContent>
        </Card>

        {/* How to Earn */}
        <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s ease-in-out', '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.12)' } }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>How to Earn</Typography>
            {[
              { icon: '👁️', label: 'Get views on your content', detail: 'Earn coins per 1000 views' },
              { icon: '❤️', label: 'Get likes on your posts', detail: 'Earn coins per 100 likes' },
              { icon: '🔥', label: 'Go viral', detail: 'Bonus for 10K+ views in 24hrs' },
              { icon: '👥', label: 'Grow followers', detail: 'Milestone bonuses at 1K, 5K, 10K+' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
                <Typography sx={{ fontSize: '1.5rem' }}>{item.icon}</Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>{item.detail}</Typography>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s ease-in-out', '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.12)' } }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Payout Eligibility</Typography>
            {[
              { label: '100+ followers', met: (user.followerCount || 0) >= 100 },
              { label: 'KYC verified', met: user.kycStatus === 'VERIFIED' },
              { label: 'Content creator enabled', met: user.isContentCreator || false },
            ].map((req, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                <Box sx={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: req.met ? '#ECFDF5' : '#FEF2F2', color: req.met ? '#10B981' : '#EF4444', fontSize: '0.8rem',
                }}>
                  {req.met ? '✓' : '✗'}
                </Box>
                <Typography variant="body2" sx={{ color: req.met ? '#374151' : '#6B7280' }}>{req.label}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletPageContent />
    </ProtectedRoute>
  );
}
