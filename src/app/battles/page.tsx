'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Avatar,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
import { BattleAPI, Battle, ContentAPI } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

const themes = [
  'Monday Mood', 'Exam Season', 'Gym Life', 'Office Drama',
  'Food Cravings', 'Dating Fails', 'Pet Problems', 'Netflix & Chill',
];

function BattlesContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedBattles, setVotedBattles] = useState<Record<string, 'creator1' | 'creator2'>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [creating, setCreating] = useState(false);
  const [contentUrls, setContentUrls] = useState<Record<string, string>>({});
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadBattles();
  }, [activeTab]);

  const loadBattles = async () => {
    setLoading(true);
    try {
      const response = activeTab === 0
        ? await BattleAPI.getLiveBattles(0, 20)
        : await BattleAPI.getCompletedBattles(0, 20);

      if (isApiSuccess(response)) {
        setBattles(response.data.content || []);
        // Load content thumbnails for battles with submitted memes
        const contentIds = (response.data.content || []).flatMap((b: Battle) =>
          [b.creator1ContentId, b.creator2ContentId].filter(Boolean) as string[]
        );
        loadContentThumbnails(contentIds);
      } else {
        setBattles([]);
      }
    } catch (err) {
      console.error('Failed to load battles:', err);
      setBattles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadContentThumbnails = async (contentIds: string[]) => {
    for (const cid of contentIds) {
      if (contentUrls[cid]) continue;
      try {
        const res = await ContentAPI.getContent(cid);
        if (isApiSuccess(res)) {
          const url = res.data.processedFile?.cdnUrl || res.data.originalFile?.cdnUrl || res.data.thumbnailUrl;
          if (url) setContentUrls(prev => ({ ...prev, [cid]: url }));
        }
      } catch {}
    }
  };

  const handleVote = async (battleId: string, side: 'creator1' | 'creator2') => {
    if (votedBattles[battleId]) return;
    try {
      const response = await BattleAPI.vote(battleId, side);
      if (isApiSuccess(response)) {
        setVotedBattles(prev => ({ ...prev, [battleId]: side }));
        setBattles(prev => prev.map(b => b.id === battleId ? response.data : b));
      }
    } catch (err: any) {
      console.error('Vote failed:', err);
    }
  };

  const handleCreateBattle = async () => {
    if (!selectedTheme.trim()) return;
    setCreating(true);
    try {
      const response = await BattleAPI.createBattle(selectedTheme.trim());
      if (isApiSuccess(response)) {
        setCreateDialogOpen(false);
        setSelectedTheme('');
        loadBattles();
      }
    } catch (err) {
      console.error('Create battle failed:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinBattle = async (battleId: string) => {
    try {
      const response = await BattleAPI.joinBattle(battleId);
      if (isApiSuccess(response)) {
        setBattles(prev => prev.map(b => b.id === battleId ? response.data : b));
      }
    } catch (err: any) {
      console.error('Join failed:', err);
    }
  };

  const getVotePercent = (battle: Battle, side: 'creator1' | 'creator2') => {
    const total = battle.creator1Votes + battle.creator2Votes;
    if (total === 0) return 50;
    const votes = side === 'creator1' ? battle.creator1Votes : battle.creator2Votes;
    return Math.round((votes / total) * 100);
  };

  const getTimeLeft = (votingEndsAt?: string) => {
    if (!votingEndsAt) return '';
    const ends = new Date(votingEndsAt);
    const now = new Date();
    const diff = ends.getTime() - now.getTime();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  // Format handle: show @ handle if it looks like a handle, otherwise show "Creator"
  const formatHandle = (handle?: string, fallback = 'Creator') => {
    if (!handle) return fallback;
    // If it looks like a raw MongoDB ObjectId, show fallback
    if (/^[a-f0-9]{24}$/.test(handle)) return fallback;
    return `@${handle.replace(/^@/, '')}`;
  };

  const getBattleStatusText = (battle: Battle) => {
    if (battle.status === 'WAITING') return 'Waiting for an opponent to join...';
    if (battle.status === 'ACTIVE') return 'Both creators submit their best meme!';
    if (battle.status === 'VOTING') return 'Vote for the best meme!';
    if (battle.status === 'COMPLETED') return 'Battle ended';
    return '';
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
          <IconButton onClick={() => setCreateDialogOpen(true)} sx={{ color: '#6B46C1' }}>
            <CreateIcon />
          </IconButton>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none', fontWeight: 700, color: '#6B7280',
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
              color: 'white', p: 2.5, borderRadius: 3, cursor: 'pointer',
            }}
            onClick={() => setCreateDialogOpen(true)}
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
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FireIcon sx={{ fontSize: 28 }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              {themes.slice(0, 4).map((theme) => (
                <Chip key={theme} label={theme} size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          </Card>
        </Box>
      )}

      {/* Battle Cards */}
      <Box sx={{ px: 2, pb: 10, maxWidth: 428, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : battles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              {activeTab === 0 ? 'No active battles right now. Start one!' : 'No completed battles yet'}
            </Typography>
          </Box>
        ) : (
          battles.map((battle) => {
            const voted = votedBattles[battle.id];
            const c1Percent = getVotePercent(battle, 'creator1');
            const c2Percent = getVotePercent(battle, 'creator2');
            const isVoting = battle.status === 'VOTING';
            const isCompleted = battle.status === 'COMPLETED';
            const isWaiting = battle.status === 'WAITING';
            const canJoin = isWaiting && user?.id !== battle.creator1Id;
            const timeLeft = getTimeLeft(battle.votingEndsAt);

            return (
              <Card key={battle.id} sx={{ mb: 2, borderRadius: 3, overflow: 'hidden' }}>
                {/* Battle header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: '#FAF5FF', borderBottom: '1px solid #EDE9FE' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B46C1' }}>
                    {battle.theme}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {battle.prizeCoins > 0 && (
                      <Chip label={`${battle.prizeCoins} coins`} size="small"
                        sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600, fontSize: '0.65rem' }}
                      />
                    )}
                    <Chip
                      icon={<TimerIcon sx={{ fontSize: 14, color: 'inherit !important' }} />}
                      label={isCompleted ? 'Ended' : isWaiting ? 'Waiting' : timeLeft}
                      size="small"
                      sx={{ bgcolor: isCompleted ? '#F3F4F6' : '#EDE9FE', color: isCompleted ? '#6B7280' : '#6B46C1', fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>

                {/* Battle arena */}
                <Box sx={{ display: 'flex', p: 2, gap: 1 }}>
                  {/* Creator 1 */}
                  <Box
                    sx={{
                      flex: 1, textAlign: 'center', p: 2, borderRadius: 2,
                      cursor: isVoting && !voted ? 'pointer' : 'default',
                      border: voted === 'creator1' ? '2px solid #6B46C1' : '2px solid transparent',
                      bgcolor: voted === 'creator1' ? '#FAF5FF' : '#F9FAFB',
                      transition: 'all 0.2s ease',
                      '&:hover': isVoting && !voted ? { bgcolor: '#FAF5FF', border: '2px solid #D8B4FE' } : {},
                    }}
                    onClick={() => isVoting && !voted && handleVote(battle.id, 'creator1')}
                  >
                    {battle.creator1ContentId && contentUrls[battle.creator1ContentId] ? (
                      <CardMedia component="img" image={contentUrls[battle.creator1ContentId]}
                        sx={{ width: '100%', aspectRatio: '1', borderRadius: 1.5, mb: 1.5, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', aspectRatio: '1', bgcolor: '#E5E7EB', borderRadius: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
                          {battle.status === 'WAITING' || battle.status === 'ACTIVE' ? 'Pending' : 'MEME'}
                        </Typography>
                      </Box>
                    )}
                    <Avatar sx={{ width: 28, height: 28, mx: 'auto', mb: 0.5, bgcolor: '#6B46C1', fontSize: '0.7rem' }}>
                      {(battle.creator1Handle || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                      {formatHandle(battle.creator1Handle, 'Challenger')}
                    </Typography>
                    {(isVoting || isCompleted) && (
                      <Typography variant="caption" sx={{ color: '#6B46C1', fontWeight: 700 }}>
                        {c1Percent}% ({battle.creator1Votes})
                      </Typography>
                    )}
                    {isCompleted && battle.winnerId === battle.creator1Id && (
                      <Chip label="Winner!" size="small" sx={{ mt: 0.5, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '0.6rem' }} />
                    )}
                  </Box>

                  {/* VS */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '0.7rem' }}>VS</Typography>
                    </Box>
                  </Box>

                  {/* Creator 2 */}
                  <Box
                    sx={{
                      flex: 1, textAlign: 'center', p: 2, borderRadius: 2,
                      cursor: isVoting && !voted ? 'pointer' : 'default',
                      border: voted === 'creator2' ? '2px solid #EC4899' : '2px solid transparent',
                      bgcolor: voted === 'creator2' ? '#FDF2F8' : '#F9FAFB',
                      transition: 'all 0.2s ease',
                      '&:hover': isVoting && !voted ? { bgcolor: '#FDF2F8', border: '2px solid #F9A8D4' } : {},
                    }}
                    onClick={() => isVoting && !voted && handleVote(battle.id, 'creator2')}
                  >
                    {battle.creator2ContentId && contentUrls[battle.creator2ContentId] ? (
                      <CardMedia component="img" image={contentUrls[battle.creator2ContentId]}
                        sx={{ width: '100%', aspectRatio: '1', borderRadius: 1.5, mb: 1.5, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', aspectRatio: '1', borderRadius: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: battle.creator2Id ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#E5E7EB' }}>
                        <Typography sx={{ color: battle.creator2Id ? 'white' : '#9CA3AF', fontWeight: 700, fontSize: '0.8rem' }}>
                          {battle.creator2Id ? (battle.status === 'ACTIVE' ? 'Pending' : 'MEME') : 'Waiting...'}
                        </Typography>
                      </Box>
                    )}
                    {battle.creator2Id ? (
                      <>
                        <Avatar sx={{ width: 28, height: 28, mx: 'auto', mb: 0.5, bgcolor: '#EC4899', fontSize: '0.7rem' }}>
                          {(battle.creator2Handle || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                          {formatHandle(battle.creator2Handle, 'Opponent')}
                        </Typography>
                        {(isVoting || isCompleted) && (
                          <Typography variant="caption" sx={{ color: '#EC4899', fontWeight: 700 }}>
                            {c2Percent}% ({battle.creator2Votes})
                          </Typography>
                        )}
                        {isCompleted && battle.winnerId === battle.creator2Id && (
                          <Chip label="Winner!" size="small" sx={{ mt: 0.5, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '0.6rem' }} />
                        )}
                      </>
                    ) : (
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#9CA3AF', display: 'block' }}>
                        No opponent yet
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Vote progress bar */}
                {(isVoting || isCompleted) && (battle.creator1Votes + battle.creator2Votes) > 0 && (
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', borderRadius: 1, overflow: 'hidden', height: 8 }}>
                      <Box sx={{ width: `${c1Percent}%`, bgcolor: '#6B46C1', transition: 'width 0.5s ease' }} />
                      <Box sx={{ width: `${c2Percent}%`, bgcolor: '#EC4899', transition: 'width 0.5s ease' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block', textAlign: 'center' }}>
                      {(battle.creator1Votes + battle.creator2Votes).toLocaleString()} total votes
                    </Typography>
                  </Box>
                )}

                {/* Battle status instructions */}
                {(isWaiting || battle.status === 'ACTIVE') && (
                  <Box sx={{ px: 2, pb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontStyle: 'italic', textAlign: 'center', display: 'block' }}>
                      {getBattleStatusText(battle)}
                      {isWaiting && ' (Auto-cancels in 24h)'}
                      {battle.status === 'ACTIVE' && ' (48h to submit)'}
                    </Typography>
                  </Box>
                )}

                {/* Join button for waiting battles */}
                {canJoin && (
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant="contained" onClick={() => handleJoinBattle(battle.id)}
                      sx={{ bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#553C9A' } }}
                    >
                      Join This Battle
                    </Button>
                  </Box>
                )}

                {/* Vote hint */}
                {isVoting && !voted && (
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
          })
        )}
      </Box>

      {/* Create Battle Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          <FireIcon sx={{ verticalAlign: 'middle', color: '#EF4444', mr: 1 }} />
          Start a Meme Battle
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose a theme or create your own. Another creator will join and you'll both submit your best meme!
          </Typography>
          <TextField
            fullWidth
            label="Battle Theme"
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            placeholder="e.g., Monday Mood, Exam Season..."
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" sx={{ color: '#6B7280', mb: 1, display: 'block' }}>
            Popular themes:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {themes.map((theme) => (
              <Chip key={theme} label={theme} size="small"
                onClick={() => setSelectedTheme(theme)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedTheme === theme ? '#6B46C1' : '#F3F4F6',
                  color: selectedTheme === theme ? 'white' : '#374151',
                  fontWeight: 600,
                  '&:hover': { bgcolor: selectedTheme === theme ? '#553C9A' : '#E5E7EB' },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateBattle} disabled={!selectedTheme.trim() || creating}
            sx={{ bgcolor: '#6B46C1', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#553C9A' } }}
          >
            {creating ? 'Creating...' : 'Create Battle'}
          </Button>
        </DialogActions>
      </Dialog>
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
