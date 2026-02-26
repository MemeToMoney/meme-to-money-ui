'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Avatar,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  HowToVote as VoteIcon,
  EmojiEvents as TrophyIcon,
  Add as CreateIcon,
  Timer as TimerIcon,
  Whatshot as FireIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface MemeBattle {
  id: string;
  theme: string;
  status: 'active' | 'voting' | 'completed';
  creator1: { name: string; handle: string; memeUrl?: string; votes: number };
  creator2: { name: string; handle: string; memeUrl?: string; votes: number };
  totalVotes: number;
  endsAt: string;
  prize?: string;
}

// Mock battles data (will be replaced with real API)
const mockBattles: MemeBattle[] = [
  {
    id: '1',
    theme: 'Monday Mood',
    status: 'voting',
    creator1: { name: 'MemeKing420', handle: '@memeking420', votes: 234 },
    creator2: { name: 'DankQueen', handle: '@dankqueen', votes: 189 },
    totalVotes: 423,
    endsAt: '2h 30m',
    prize: '500 coins',
  },
  {
    id: '2',
    theme: 'Work From Home',
    status: 'voting',
    creator1: { name: 'ViralVince', handle: '@viralvince', votes: 567 },
    creator2: { name: 'LolMaster', handle: '@lolmaster', votes: 432 },
    totalVotes: 999,
    endsAt: '5h 12m',
    prize: '1000 coins',
  },
  {
    id: '3',
    theme: 'Gym Life',
    status: 'active',
    creator1: { name: 'FitFunny', handle: '@fitfunny', votes: 0 },
    creator2: { name: 'GymFail', handle: '@gymfail', votes: 0 },
    totalVotes: 0,
    endsAt: '23h 45m',
  },
  {
    id: '4',
    theme: 'Cooking Disaster',
    status: 'completed',
    creator1: { name: 'ChefMeme', handle: '@chefmeme', votes: 1240 },
    creator2: { name: 'BurntToast', handle: '@burnttoast', votes: 890 },
    totalVotes: 2130,
    endsAt: 'Ended',
    prize: '500 coins',
  },
];

const themes = [
  'Monday Mood', 'Exam Season', 'Gym Life', 'Office Drama',
  'Food Cravings', 'Dating Fails', 'Pet Problems', 'Netflix & Chill',
];

function BattlesContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [votedBattles, setVotedBattles] = useState<Record<string, 'creator1' | 'creator2'>>({});
  const router = useRouter();

  const filteredBattles = mockBattles.filter((b) => {
    if (activeTab === 0) return b.status === 'voting' || b.status === 'active';
    return b.status === 'completed';
  });

  const handleVote = (battleId: string, side: 'creator1' | 'creator2') => {
    if (votedBattles[battleId]) return; // Already voted
    setVotedBattles((prev) => ({ ...prev, [battleId]: side }));
    // TODO: API call - ContentAPI.voteBattle(battleId, side)
  };

  const getVotePercent = (battle: MemeBattle, side: 'creator1' | 'creator2') => {
    if (battle.totalVotes === 0) return 50;
    return Math.round((battle[side].votes / battle.totalVotes) * 100);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
          <IconButton onClick={() => router.back()}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a1a' }}>
              <FireIcon sx={{ verticalAlign: 'middle', color: '#EF4444', mr: 0.5 }} />
              Meme Battles
            </Typography>
          </Box>
          <IconButton onClick={() => router.push('/meme-cam')} sx={{ color: '#6B46C1' }}>
            <CreateIcon />
          </IconButton>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              color: '#6B7280',
              '&.Mui-selected': { color: '#6B46C1' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#6B46C1' },
          }}
        >
          <Tab label="Live Battles" icon={<VoteIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Results" icon={<TrophyIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Create Battle CTA */}
      {activeTab === 0 && (
        <Box sx={{ p: 2 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #6B46C1 0%, #EC4899 100%)',
              color: 'white',
              p: 2.5,
              borderRadius: 3,
              cursor: 'pointer',
            }}
            onClick={() => router.push('/meme-cam')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Start a Meme Battle!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Challenge someone with your best meme
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48, height: 48, borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <FireIcon sx={{ fontSize: 28 }} />
              </Box>
            </Box>

            {/* Today's themes */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              {themes.slice(0, 4).map((theme) => (
                <Chip
                  key={theme}
                  label={theme}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              ))}
            </Box>
          </Card>
        </Box>
      )}

      {/* Battle Cards */}
      <Box sx={{ px: 2, pb: 10, maxWidth: 428, mx: 'auto' }}>
        {filteredBattles.map((battle) => {
          const voted = votedBattles[battle.id];
          const c1Percent = getVotePercent(battle, 'creator1');
          const c2Percent = getVotePercent(battle, 'creator2');

          return (
            <Card key={battle.id} sx={{ mb: 2, borderRadius: 3, overflow: 'hidden' }}>
              {/* Battle header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2, py: 1.5,
                  bgcolor: '#FAF5FF',
                  borderBottom: '1px solid #EDE9FE',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B46C1' }}>
                  {battle.theme}
                </Typography>
                <Chip
                  icon={<TimerIcon sx={{ fontSize: 14, color: 'inherit !important' }} />}
                  label={battle.endsAt}
                  size="small"
                  sx={{
                    bgcolor: battle.status === 'completed' ? '#F3F4F6' : '#EDE9FE',
                    color: battle.status === 'completed' ? '#6B7280' : '#6B46C1',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>

              {/* Battle arena */}
              <Box sx={{ display: 'flex', p: 2, gap: 1 }}>
                {/* Creator 1 */}
                <Box
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    cursor: battle.status === 'voting' && !voted ? 'pointer' : 'default',
                    border: voted === 'creator1' ? '2px solid #6B46C1' : '2px solid transparent',
                    bgcolor: voted === 'creator1' ? '#FAF5FF' : '#F9FAFB',
                    transition: 'all 0.2s ease',
                    '&:hover': battle.status === 'voting' && !voted ? {
                      bgcolor: '#FAF5FF',
                      border: '2px solid #D8B4FE',
                    } : {},
                  }}
                  onClick={() => battle.status === 'voting' && handleVote(battle.id, 'creator1')}
                >
                  {/* Meme placeholder */}
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      bgcolor: '#E5E7EB',
                      borderRadius: 1.5,
                      mb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
                      MEME
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 28, height: 28, mx: 'auto', mb: 0.5, bgcolor: '#6B46C1', fontSize: '0.7rem' }}>
                    {battle.creator1.name.charAt(0)}
                  </Avatar>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                    {battle.creator1.name}
                  </Typography>
                  {(battle.status === 'voting' || battle.status === 'completed') && (
                    <Typography variant="caption" sx={{ color: '#6B46C1', fontWeight: 700 }}>
                      {c1Percent}% ({battle.creator1.votes})
                    </Typography>
                  )}
                </Box>

                {/* VS */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '0.7rem' }}>VS</Typography>
                  </Box>
                </Box>

                {/* Creator 2 */}
                <Box
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    cursor: battle.status === 'voting' && !voted ? 'pointer' : 'default',
                    border: voted === 'creator2' ? '2px solid #EC4899' : '2px solid transparent',
                    bgcolor: voted === 'creator2' ? '#FDF2F8' : '#F9FAFB',
                    transition: 'all 0.2s ease',
                    '&:hover': battle.status === 'voting' && !voted ? {
                      bgcolor: '#FDF2F8',
                      border: '2px solid #F9A8D4',
                    } : {},
                  }}
                  onClick={() => battle.status === 'voting' && handleVote(battle.id, 'creator2')}
                >
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 1.5,
                      mb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
                      MEME
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 28, height: 28, mx: 'auto', mb: 0.5, bgcolor: '#EC4899', fontSize: '0.7rem' }}>
                    {battle.creator2.name.charAt(0)}
                  </Avatar>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                    {battle.creator2.name}
                  </Typography>
                  {(battle.status === 'voting' || battle.status === 'completed') && (
                    <Typography variant="caption" sx={{ color: '#EC4899', fontWeight: 700 }}>
                      {c2Percent}% ({battle.creator2.votes})
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Vote progress bar */}
              {(battle.status === 'voting' || battle.status === 'completed') && battle.totalVotes > 0 && (
                <Box sx={{ px: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', borderRadius: 1, overflow: 'hidden', height: 8 }}>
                    <Box sx={{ width: `${c1Percent}%`, bgcolor: '#6B46C1', transition: 'width 0.5s ease' }} />
                    <Box sx={{ width: `${c2Percent}%`, bgcolor: '#EC4899', transition: 'width 0.5s ease' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block', textAlign: 'center' }}>
                    {battle.totalVotes.toLocaleString()} total votes
                    {battle.prize && ` \u00B7 Prize: ${battle.prize}`}
                  </Typography>
                </Box>
              )}

              {/* Vote button */}
              {battle.status === 'voting' && !voted && (
                <Box sx={{ px: 2, pb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#6B46C1', fontWeight: 600, textAlign: 'center', display: 'block' }}>
                    Tap a meme to vote!
                  </Typography>
                </Box>
              )}

              {voted && (
                <Box sx={{ px: 2, pb: 2, textAlign: 'center' }}>
                  <Chip label="Voted!" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
                </Box>
              )}
            </Card>
          );
        })}

        {filteredBattles.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              {activeTab === 0 ? 'No active battles right now' : 'No completed battles yet'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function BattlesPage() {
  return (
    <ProtectedRoute>
      <BattlesContent />
    </ProtectedRoute>
  );
}
