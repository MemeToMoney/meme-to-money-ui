'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  MonetizationOn as CoinIcon,
  Videocam as VideoIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { AuthAPI, ReferrerInfo } from '@/lib/api/auth';
import { isApiSuccess } from '@/lib/api/client';

const APP_FEATURES = [
  {
    icon: <VideoIcon sx={{ fontSize: 28, color: '#6B46C1' }} />,
    title: 'Create & Share Memes',
    description: 'Upload memes, short videos, and go viral.',
  },
  {
    icon: <CoinIcon sx={{ fontSize: 28, color: '#F59E0B' }} />,
    title: 'Earn Real Coins',
    description: 'Get coins for views, likes, tips, and battles.',
  },
  {
    icon: <TrophyIcon sx={{ fontSize: 28, color: '#EF4444' }} />,
    title: 'Compete in Battles',
    description: 'Enter meme battles and win big rewards.',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 28, color: '#10B981' }} />,
    title: 'Build Your Community',
    description: 'Grow your audience and become a top creator.',
  },
];

export default function ReferralLandingPage() {
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  useEffect(() => {
    if (code) {
      loadReferrerInfo();
    }
  }, [code]);

  const loadReferrerInfo = async () => {
    try {
      setLoading(true);
      const response = await AuthAPI.getReferrerInfo(code);
      if (isApiSuccess(response)) {
        setReferrer(response.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load referrer info:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    router.push(`/auth/login?referralCode=${encodeURIComponent(code)}`);
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #F5F3FF 0%, #ffffff 100%)',
      }}>
        <CircularProgress sx={{ color: '#6B46C1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F5F3FF 0%, #ffffff 50%, #F5F3FF 100%)',
      pb: 6,
    }}>
      <Container maxWidth="sm" sx={{ px: 3, pt: 4 }}>
        {/* Hero Section */}
        <Box sx={{
          textAlign: 'center',
          mb: 4,
          pt: 2,
        }}>
          {/* App Logo / Branding */}
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#6B46C1',
              mx: 'auto',
              mb: 2,
              fontSize: '2rem',
              boxShadow: '0 4px 20px rgba(107, 70, 193, 0.3)',
            }}
          >
            M
          </Avatar>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}
          >
            Meme to Money
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
            Turn Memes into Money
          </Typography>

          {/* Referrer Info */}
          {referrer && !error ? (
            <Card sx={{
              borderRadius: 4,
              background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
              color: 'white',
              mb: 3,
              boxShadow: '0 8px 32px rgba(107, 70, 193, 0.25)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  src={referrer.profilePicture || undefined}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    mx: 'auto',
                    mb: 1.5,
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    border: '3px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {(referrer.displayName || referrer.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {referrer.displayName || referrer.name} invited you!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Join now and you both earn 100 coins
                </Typography>
              </CardContent>
            </Card>
          ) : error ? (
            <Card sx={{
              borderRadius: 4,
              bgcolor: '#FEF2F2',
              border: '1px solid #FECACA',
              mb: 3,
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ color: '#DC2626', fontWeight: 600, mb: 0.5 }}>
                  Invalid referral code
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  This referral link may be expired or invalid. You can still join MemeToMoney!
                </Typography>
              </CardContent>
            </Card>
          ) : null}
        </Box>

        {/* App Features */}
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: '#374151', mb: 2, textAlign: 'center' }}
        >
          Why join MemeToMoney?
        </Typography>

        <Box sx={{ mb: 4 }}>
          {APP_FEATURES.map((feature, index) => (
            <Card
              key={index}
              sx={{
                mb: 1.5,
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #F3F4F6',
              }}
            >
              <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: '#F5F3FF', flexShrink: 0 }}>
                  {feature.icon}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 0.25 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', lineHeight: 1.4 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Referral Bonus Highlight */}
        {referrer && !error && (
          <Card sx={{
            mb: 4,
            borderRadius: 3,
            bgcolor: '#FEF9C3',
            border: '1px solid #FDE68A',
            boxShadow: 'none',
          }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center', '&:last-child': { pb: 2.5 } }}>
              <CoinIcon sx={{ fontSize: 32, color: '#D97706', mb: 0.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#92400E' }}>
                Sign-up Bonus: 100 Coins
              </Typography>
              <Typography variant="caption" sx={{ color: '#78716C' }}>
                Use referral code <strong>{code}</strong> to claim your bonus
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* CTA Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleJoin}
          sx={{
            background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 700,
            borderRadius: 3,
            textTransform: 'none',
            boxShadow: '0 8px 24px rgba(107, 70, 193, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)',
              boxShadow: '0 12px 32px rgba(107, 70, 193, 0.45)',
            },
          }}
        >
          Join MemeToMoney
        </Button>

        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'center', color: '#9CA3AF', mt: 2 }}
        >
          Free to join. Start creating and earning today.
        </Typography>
      </Container>
    </Box>
  );
}
