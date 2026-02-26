'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Card,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MonetizationAPI, LeaderboardEntry as APILeaderboardEntry } from '@/lib/api/monetization';
import { isApiSuccess } from '@/lib/api/client';

const rankEmojis: Record<number, string> = { 1: '\uD83E\uDD47', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' };

const periodMap: Record<number, string> = { 0: 'weekly', 1: 'monthly', 2: 'all-time' };

function LeaderboardContent() {
  const [period, setPeriod] = useState(0);
  const [leaderboard, setLeaderboard] = useState<APILeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await MonetizationAPI.getLeaderboard(periodMap[period], 20);
      if (isApiSuccess(response)) {
        setLeaderboard(response.data);
      } else {
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const formatScore = (score: number) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  const getDisplayName = (entry: APILeaderboardEntry) => {
    return entry.displayName || entry.handle || `User ${entry.rank}`;
  };

  const getInitial = (entry: APILeaderboardEntry) => {
    const name = entry.displayName || entry.handle || 'U';
    return name.charAt(0).toUpperCase();
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #EC4899 100%)',
          color: 'white',
          pb: 4,
          pt: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ color: 'white' }}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              <TrophyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Leaderboard
            </Typography>
          </Box>
          <Box sx={{ width: 40 }} />
        </Box>

        {/* Period tabs */}
        <Tabs
          value={period}
          onChange={(_, v) => setPeriod(v)}
          variant="fullWidth"
          sx={{
            mx: 2,
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 36,
              '&.Mui-selected': { color: 'white' },
            },
            '& .MuiTabs-indicator': { bgcolor: 'white', height: 3, borderRadius: 2 },
          }}
        >
          <Tab label="This Week" />
          <Tab label="This Month" />
          <Tab label="All Time" />
        </Tabs>

        {/* Top 3 podium */}
        {!loading && top3.length >= 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', mt: 3, px: 2, gap: 1 }}>
            {/* 2nd place */}
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Avatar
                src={top3[1].profilePicture}
                sx={{
                  width: 56, height: 56, mx: 'auto', mb: 0.5,
                  border: '3px solid #C0C0C0',
                  bgcolor: '#7C3AED',
                  fontSize: '1.2rem',
                }}
              >
                {getInitial(top3[1])}
              </Avatar>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                {getDisplayName(top3[1])}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatScore(top3[1].totalCoins)} coins
              </Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '8px 8px 0 0', mt: 1, pt: 2, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{rankEmojis[2]}</Typography>
              </Box>
            </Box>

            {/* 1st place */}
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Avatar
                src={top3[0].profilePicture}
                sx={{
                  width: 72, height: 72, mx: 'auto', mb: 0.5,
                  border: '3px solid #FFD700',
                  bgcolor: '#6B46C1',
                  fontSize: '1.5rem',
                }}
              >
                {getInitial(top3[0])}
              </Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {getDisplayName(top3[0])}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatScore(top3[0].totalCoins)} coins
              </Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: '8px 8px 0 0', mt: 1, pt: 3, pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{rankEmojis[1]}</Typography>
              </Box>
            </Box>

            {/* 3rd place */}
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Avatar
                src={top3[2].profilePicture}
                sx={{
                  width: 56, height: 56, mx: 'auto', mb: 0.5,
                  border: '3px solid #CD7F32',
                  bgcolor: '#9333EA',
                  fontSize: '1.2rem',
                }}
              >
                {getInitial(top3[2])}
              </Avatar>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                {getDisplayName(top3[2])}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatScore(top3[2].totalCoins)} coins
              </Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '8px 8px 0 0', mt: 1, pt: 1, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{rankEmojis[3]}</Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Empty state when < 3 entries */}
        {!loading && leaderboard.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              No leaderboard data yet. Start earning coins!
            </Typography>
          </Box>
        )}
      </Box>

      {/* Rest of leaderboard */}
      <Box sx={{ px: 2, pt: 2, pb: 10, maxWidth: 428, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : (
          rest.map((entry) => (
            <Card
              key={entry.rank}
              onClick={() => router.push(`/profile/${entry.userId}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                mb: 1,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#FAF5FF', transform: 'translateX(4px)' },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: '#9CA3AF', minWidth: 24, textAlign: 'center' }}
              >
                {entry.rank}
              </Typography>
              <Avatar src={entry.profilePicture} sx={{ bgcolor: '#6B46C1', width: 40, height: 40 }}>
                {getInitial(entry)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  {getDisplayName(entry)}
                </Typography>
                {entry.handle && (
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    @{entry.handle}
                  </Typography>
                )}
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B46C1' }}>
                  {formatScore(entry.totalCoins)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  coins
                </Typography>
              </Box>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}
