'use client';

import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  VerifiedUser as KycIcon,
  ArrowBack as BackIcon,
  EmojiEvents as LeaderboardIcon,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MonetizationAPI, WalletResponse, EarningsSummary, Earning } from '@/lib/api/monetization';
import { isApiSuccess } from '@/lib/api/client';

function WalletPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [recentEarnings, setRecentEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [walletRes, summaryRes, earningsRes] = await Promise.all([
        MonetizationAPI.getWallet(),
        MonetizationAPI.getEarningsSummary(),
        MonetizationAPI.getEarnings(),
      ]);

      if (isApiSuccess(walletRes)) setWallet(walletRes.data);
      if (isApiSuccess(summaryRes)) setSummary(summaryRes.data);
      if (isApiSuccess(earningsRes)) {
        setRecentEarnings(earningsRes.data.slice(0, 10));
        // Check if daily login bonus was already claimed today
        const today = new Date().toISOString().split('T')[0];
        const claimedToday = earningsRes.data.some(
          (e: Earning) => e.type === 'DAILY_LOGIN' && e.createdAt?.startsWith(today)
        );
        if (claimedToday) setDailyBonusClaimed(true);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDailyBonus = async () => {
    try {
      const res = await MonetizationAPI.claimDailyLogin();
      if (isApiSuccess(res) && res.data) {
        setDailyBonusClaimed(true);
        setSnackbar({ open: true, message: `+${res.data.coins} coins! Daily login bonus claimed!`, severity: 'success' });
        loadWalletData();
      } else {
        setDailyBonusClaimed(true);
        setSnackbar({ open: true, message: 'Daily bonus already claimed today', severity: 'info' });
      }
    } catch (err) {
      console.error('Failed to claim daily bonus:', err);
    }
  };

  if (!user) return null;

  const kycStatusColor: Record<string, string> = {
    NOT_SUBMITTED: '#6B7280',
    PENDING: '#F59E0B',
    VERIFIED: '#10B981',
    REJECTED: '#EF4444',
    EXPIRED: '#EF4444',
  };

  const kycStatusLabel: Record<string, string> = {
    NOT_SUBMITTED: 'Not Submitted',
    PENDING: 'Pending Review',
    VERIFIED: 'Verified',
    REJECTED: 'Rejected',
    EXPIRED: 'Expired',
  };

  const kycColor = kycStatusColor[user.kycStatus || 'NOT_SUBMITTED'];
  const kycLabel = kycStatusLabel[user.kycStatus || 'NOT_SUBMITTED'];

  const coinBalance = wallet?.coinBalance ?? user.coinBalance ?? 0;
  const totalEarned = wallet?.totalEarned ?? user.totalEarnings ?? 0;
  const thisWeek = summary?.thisWeekCoins ?? user.weeklyEarnings ?? 0;

  const earnMethods = [
    { icon: '\uD83D\uDCF7', label: 'Upload a meme/short', detail: '+10 coins (max 50/day)' },
    { icon: '\uD83D\uDC41\uFE0F', label: 'Get 100 views', detail: '+5 coins (max 100/day)' },
    { icon: '\u2764\uFE0F', label: 'Get a like', detail: '+1 coin (max 50/day)' },
    { icon: '\uD83D\uDCAC', label: 'Get a comment', detail: '+2 coins (max 40/day)' },
    { icon: '\uD83D\uDD04', label: 'Get a share', detail: '+3 coins (max 60/day)' },
    { icon: '\uD83D\uDC65', label: 'Get a new follower', detail: '+2 coins (max 40/day)' },
    { icon: '\u2B50', label: 'Daily login', detail: '+5 coins (once per day)' },
  ];

  const earningTypeLabels: Record<string, string> = {
    MEME_UPLOAD: 'Upload',
    VIEW_MILESTONE: 'Views',
    LIKE_RECEIVED: 'Like',
    COMMENT_RECEIVED: 'Comment',
    MEME_SHARED: 'Share',
    NEW_FOLLOWER: 'Follower',
    DAILY_LOGIN: 'Login',
    TIP_RECEIVED: 'Tip',
    BATTLE_WIN: 'Battle',
    REFERRAL: 'Referral',
    CONTENT_BONUS: 'Bonus',
    LEADERBOARD_REWARD: 'Leaderboard',
  };

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
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6B46C1', display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <WalletIcon /> Wallet
        </Typography>
        <IconButton onClick={() => router.push('/leaderboard')} sx={{ color: '#6B46C1' }}>
          <LeaderboardIcon />
        </IconButton>
      </Box>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : (
          <>
            {/* Main Balance Card */}
            <Card sx={{
              borderRadius: 4, mb: 3,
              background: 'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 50%, #A78BFA 100%)',
              color: 'white', boxShadow: '0 8px 32px rgba(107, 70, 193, 0.3)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Coin Balance</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {coinBalance.toLocaleString()}
                  <Typography component="span" variant="h6" sx={{ ml: 1, opacity: 0.8 }}>coins</Typography>
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  = {'\u20B9'}{(coinBalance / 100).toFixed(2)} (100 coins = {'\u20B9'}1)
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1.5, mt: 2, mb: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => router.push('/wallet/buy-coins')}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 2,
                      textTransform: 'none', fontWeight: 700, backdropFilter: 'blur(10px)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    + Add Money
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => router.push('/wallet/withdraw')}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 2,
                      textTransform: 'none', fontWeight: 700, backdropFilter: 'blur(10px)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    Withdraw
                  </Button>
                </Box>

                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Earned</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{totalEarned.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>This Week</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{thisWeek.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Spent</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{(wallet?.totalSpent ?? 0).toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Daily Login Bonus */}
            <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '2px solid #F5F3FF' }}>
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ fontSize: '2rem' }}>{'\u2B50'}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Daily Login Bonus</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Claim +5 coins every day!</Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  disabled={dailyBonusClaimed}
                  onClick={handleClaimDailyBonus}
                  sx={{
                    bgcolor: dailyBonusClaimed ? '#9CA3AF' : '#6B46C1',
                    textTransform: 'none', borderRadius: 2, fontWeight: 700,
                    '&:hover': { bgcolor: dailyBonusClaimed ? '#9CA3AF' : '#553C9A' },
                  }}
                >
                  {dailyBonusClaimed ? 'Claimed' : 'Claim +5'}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Earnings */}
            {recentEarnings.length > 0 && (
              <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Recent Earnings</Typography>
                  {recentEarnings.map((earning, i) => (
                    <Box key={earning.id} sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      py: 1.5, borderBottom: i < recentEarnings.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {earningTypeLabels[earning.type] || earning.type}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {earning.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={`+${earning.coins}`}
                        size="small"
                        sx={{ bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 700 }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* KYC Status */}
            <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <KycIcon sx={{ color: kycColor }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>KYC Verification</Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>Required for payouts</Typography>
                    </Box>
                  </Box>
                  <Chip label={kycLabel} size="small" sx={{ bgcolor: `${kycColor}15`, color: kycColor, fontWeight: 600 }} />
                </Box>
                {user.kycStatus === 'NOT_SUBMITTED' && (
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2, textTransform: 'none', borderColor: '#6B46C1', color: '#6B46C1', borderRadius: 2 }}
                    onClick={() => router.push('/settings')}
                  >
                    Submit KYC Documents
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* How to Earn */}
            <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>How to Earn Coins</Typography>
                {earnMethods.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: i < earnMethods.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <Typography sx={{ fontSize: '1.5rem', width: 36, textAlign: 'center' }}>{item.icon}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>{item.detail}</Typography>
                    </Box>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', textAlign: 'center' }}>
                  100 coins = {'\u20B9'}1 | Min redemption: 10,000 coins ({'\u20B9'}100)
                </Typography>
              </CardContent>
            </Card>

            {/* Payout Eligibility */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Payout Eligibility</Typography>
                {[
                  { label: '10,000+ coins', met: coinBalance >= 10000 },
                  { label: 'KYC verified', met: user.kycStatus === 'VERIFIED' },
                  { label: 'Content creator enabled', met: user.isContentCreator || false },
                ].map((req, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                    <Box sx={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: req.met ? '#ECFDF5' : '#FEF2F2', color: req.met ? '#10B981' : '#EF4444', fontSize: '0.8rem',
                    }}>
                      {req.met ? '\u2713' : '\u2717'}
                    </Box>
                    <Typography variant="body2" sx={{ color: req.met ? '#374151' : '#6B7280' }}>{req.label}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
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
