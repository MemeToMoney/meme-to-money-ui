'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Chip,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Whatshot as FireIcon,
  HowToVote as VoteIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { BattleAPI, Battle } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';

interface BattleShareClientProps {
  battleId: string;
}

export default function BattleShareClient({ battleId }: BattleShareClientProps) {
  const router = useRouter();

  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    const loadBattle = async () => {
      try {
        const response = await BattleAPI.getBattle(battleId);
        if (isApiSuccess(response)) {
          setBattle(response.data);
        }
      } catch (err) {
        console.error('Failed to load battle:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBattle();
  }, [battleId]);

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace(`/battles/${battleId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [battleId, router]);

  const getVotePercent = (side: 'creator1' | 'creator2') => {
    if (!battle) return 50;
    const total = battle.creator1Votes + battle.creator2Votes;
    if (total === 0) return 50;
    const votes = side === 'creator1' ? battle.creator1Votes : battle.creator2Votes;
    return Math.round((votes / total) * 100);
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #EC4899 100%)',
      }}>
        <CircularProgress sx={{ color: 'white' }} />
        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.8)' }}>
          Loading battle...
        </Typography>
      </Box>
    );
  }

  if (!battle) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #EC4899 100%)',
        color: 'white', px: 3,
      }}>
        <FireIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Battle Not Found</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
          Redirecting...
        </Typography>
      </Box>
    );
  }

  const c1Percent = getVotePercent('creator1');
  const c2Percent = getVotePercent('creator2');
  const totalVotes = battle.creator1Votes + battle.creator2Votes;
  const isCompleted = battle.status === 'COMPLETED';
  const isVoting = battle.status === 'VOTING';

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #EC4899 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: 4,
    }}>
      {/* Preview Card */}
      <Card sx={{
        maxWidth: 400,
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      }}>
        {/* Card header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #6B46C1 0%, #EC4899 100%)',
          color: 'white',
          p: 2.5,
          textAlign: 'center',
        }}>
          <Chip
            icon={<FireIcon sx={{ color: '#FEF3C7 !important', fontSize: 14 }} />}
            label="MEME BATTLE"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.6rem',
              letterSpacing: 1.5,
              mb: 1,
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
            {battle.theme}
          </Typography>
          {isVoting && (
            <Chip
              icon={<VoteIcon sx={{ color: 'inherit !important', fontSize: 12 }} />}
              label="Vote Now!"
              size="small"
              sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: '0.7rem' }}
            />
          )}
          {isCompleted && (
            <Chip
              icon={<TrophyIcon sx={{ color: 'inherit !important', fontSize: 12 }} />}
              label="Completed"
              size="small"
              sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: '0.7rem' }}
            />
          )}
        </Box>

        {/* Battle matchup */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Creator 1 */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1, bgcolor: '#6B46C1', fontSize: '1.2rem', fontWeight: 700 }}>
                {(battle.creator1Handle || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {battle.creator1Handle || 'Challenger'}
              </Typography>
              {(isVoting || isCompleted) && (
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#6B46C1' }}>
                  {c1Percent}%
                </Typography>
              )}
              {isCompleted && battle.winnerId === battle.creator1Id && (
                <Chip label="Winner" size="small" sx={{ mt: 0.5, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '0.6rem' }} />
              )}
            </Box>

            {/* VS */}
            <Box sx={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 2, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
            }}>
              <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '0.8rem' }}>VS</Typography>
            </Box>

            {/* Creator 2 */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Avatar sx={{
                width: 56, height: 56, mx: 'auto', mb: 1,
                bgcolor: battle.creator2Id ? '#EC4899' : '#D1D5DB',
                fontSize: '1.2rem', fontWeight: 700,
              }}>
                {battle.creator2Id ? (battle.creator2Handle || 'U').charAt(0).toUpperCase() : '?'}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: battle.creator2Id ? '#1F2937' : '#9CA3AF' }}>
                {battle.creator2Id ? (battle.creator2Handle || 'Opponent') : 'Waiting...'}
              </Typography>
              {(isVoting || isCompleted) && battle.creator2Id && (
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#EC4899' }}>
                  {c2Percent}%
                </Typography>
              )}
              {isCompleted && battle.winnerId === battle.creator2Id && (
                <Chip label="Winner" size="small" sx={{ mt: 0.5, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '0.6rem' }} />
              )}
            </Box>
          </Box>

          {/* Vote bar */}
          {(isVoting || isCompleted) && totalVotes > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', borderRadius: 1.5, overflow: 'hidden', height: 10 }}>
                <Box sx={{ width: `${c1Percent}%`, bgcolor: '#6B46C1', transition: 'width 0.5s ease' }} />
                <Box sx={{ width: `${c2Percent}%`, bgcolor: '#EC4899', transition: 'width 0.5s ease' }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block', textAlign: 'center', fontWeight: 600 }}>
                {totalVotes.toLocaleString()} total votes
              </Typography>
            </Box>
          )}
        </Box>

        {/* CTA footer */}
        <Box sx={{
          bgcolor: '#FAF5FF',
          p: 2,
          textAlign: 'center',
          borderTop: '1px solid #EDE9FE',
        }}>
          <Typography variant="body2" sx={{ color: '#6B46C1', fontWeight: 700 }}>
            {isVoting ? 'Tap to vote on MemeToMoney!' : 'View on MemeToMoney'}
          </Typography>
        </Box>
      </Card>

      {/* Redirect notice */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
          Redirecting to the full battle page in {redirectCountdown}s...
        </Typography>
        <LinearProgress
          variant="determinate"
          value={((3 - redirectCountdown) / 3) * 100}
          sx={{
            maxWidth: 200,
            mx: 'auto',
            borderRadius: 1,
            height: 4,
            bgcolor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'white',
              borderRadius: 1,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            mt: 1,
            display: 'block',
            cursor: 'pointer',
            textDecoration: 'underline',
            '&:hover': { color: 'white' },
          }}
          onClick={() => router.replace(`/battles/${battleId}`)}
        >
          Go now
        </Typography>
      </Box>

      {/* Branding */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          MemeToMoney
        </Typography>
      </Box>
    </Box>
  );
}
