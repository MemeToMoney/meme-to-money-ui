'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  CurrencyRupee as CoinIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { MonetizationAPI } from '@/lib/api/monetization';
import { isApiSuccess } from '@/lib/api/client';

const COINS_PER_RUPEE = 100;
const MIN_REDEEM_COINS = 10000; // ₹100 minimum redemption

export default function CoinProgressBar() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    MonetizationAPI.getBalance()
      .then((res) => {
        if (isApiSuccess(res)) setBalance(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const rupeeValue = balance / COINS_PER_RUPEE;
  const progressPercent = Math.min((balance / MIN_REDEEM_COINS) * 100, 100);
  const coinsRemaining = Math.max(MIN_REDEEM_COINS - balance, 0);

  if (loading) {
    return (
      <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, border: '1px solid #E5E7EB' }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4, mt: 1 }} />
        <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'white',
        borderRadius: 3,
        border: '1px solid #E5E7EB',
      }}
    >
      {/* Header row: coin icon + balance */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: '#FFFBEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CoinIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2 }}>
              {balance.toLocaleString()} Coins
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem' }}>
              = ₹{rupeeValue.toFixed(2)}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: progressPercent >= 100 ? '#059669' : '#6B46C1',
            fontSize: '0.75rem',
          }}
        >
          {progressPercent.toFixed(0)}%
        </Typography>
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progressPercent}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: '#F3F4F6',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            background: progressPercent >= 100
              ? 'linear-gradient(90deg, #059669, #10B981)'
              : 'linear-gradient(90deg, #6B46C1, #9333EA)',
          },
        }}
      />

      {/* Footer text */}
      <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem', mt: 0.75, display: 'block' }}>
        {progressPercent >= 100
          ? 'You can redeem your coins now!'
          : `${coinsRemaining.toLocaleString()} more coins to reach ₹100 minimum redemption`}
      </Typography>
    </Box>
  );
}
