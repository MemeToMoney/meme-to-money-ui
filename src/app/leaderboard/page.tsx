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
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  Whatshot as FireIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ContentAPI } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  handle: string;
  avatar?: string;
  score: number;
  postCount: number;
  badge: string;
}

// Mock leaderboard data (will be replaced with real API)
const generateMockLeaderboard = (): LeaderboardEntry[] => [
  { rank: 1, userId: '1', displayName: 'MemeKing420', handle: '@memeking420', score: 48200, postCount: 156, badge: 'Crown' },
  { rank: 2, userId: '2', displayName: 'DankQueen', handle: '@dankqueen', score: 41800, postCount: 134, badge: 'Fire' },
  { rank: 3, userId: '3', displayName: 'ViralVince', handle: '@viralvince', score: 38500, postCount: 98, badge: 'Lightning' },
  { rank: 4, userId: '4', displayName: 'LolMaster', handle: '@lolmaster', score: 32100, postCount: 112, badge: 'Star' },
  { rank: 5, userId: '5', displayName: 'SavageSara', handle: '@savagesara', score: 28900, postCount: 87, badge: 'Rocket' },
  { rank: 6, userId: '6', displayName: 'CringeLord', handle: '@cringelord', score: 24300, postCount: 201, badge: '' },
  { rank: 7, userId: '7', displayName: 'MoodMemer', handle: '@moodmemer', score: 21700, postCount: 76, badge: '' },
  { rank: 8, userId: '8', displayName: 'RelatableRaj', handle: '@relatableraj', score: 19500, postCount: 93, badge: '' },
  { rank: 9, userId: '9', displayName: 'FunnyFiona', handle: '@funnyfiona', score: 17200, postCount: 64, badge: '' },
  { rank: 10, userId: '10', displayName: 'MemeLord99', handle: '@memelord99', score: 15800, postCount: 142, badge: '' },
];

const rankEmojis: Record<number, string> = { 1: '\uD83E\uDD47', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' };
const rankColors: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

function LeaderboardContent() {
  const [period, setPeriod] = useState(0); // 0=weekly, 1=monthly, 2=all-time
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // TODO: Replace with real API call: ContentAPI.getLeaderboard(period)
    setLoading(true);
    setTimeout(() => {
      setLeaderboard(generateMockLeaderboard());
      setLoading(false);
    }, 500);
  }, [period]);

  const formatScore = (score: number) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
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
                sx={{
                  width: 56, height: 56, mx: 'auto', mb: 0.5,
                  border: '3px solid #C0C0C0',
                  bgcolor: '#7C3AED',
                  fontSize: '1.2rem',
                }}
              >
                {top3[1].displayName.charAt(0)}
              </Avatar>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                {top3[1].displayName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatScore(top3[1].score)} pts
              </Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '8px 8px 0 0', mt: 1, pt: 2, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{rankEmojis[2]}</Typography>
              </Box>
            </Box>

            {/* 1st place */}
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Avatar
                sx={{
                  width: 72, height: 72, mx: 'auto', mb: 0.5,
                  border: '3px solid #FFD700',
                  bgcolor: '#6B46C1',
                  fontSize: '1.5rem',
                }}
              >
                {top3[0].displayName.charAt(0)}
              </Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {top3[0].displayName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatScore(top3[0].score)} pts
              </Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: '8px 8px 0 0', mt: 1, pt: 3, pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{rankEmojis[1]}</Typography>
              </Box>
            </Box>

            {/* 3rd place */}
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Avatar
                sx={{
                  width: 56, height: 56, mx: 'auto', mb: 0.5,
                  border: '3px solid #CD7F32',
                  bgcolor: '#9333EA',
                  fontSize: '1.2rem',
                }}
              >
                {top3[2].displayName.charAt(0)}
              </Avatar>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                {top3[2].displayName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatScore(top3[2].score)} pts
              </Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '8px 8px 0 0', mt: 1, pt: 1, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{rankEmojis[3]}</Typography>
              </Box>
            </Box>
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
              <Avatar sx={{ bgcolor: '#6B46C1', width: 40, height: 40 }}>
                {entry.displayName.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  {entry.displayName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {entry.handle} &middot; {entry.postCount} memes
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B46C1' }}>
                  {formatScore(entry.score)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  points
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
