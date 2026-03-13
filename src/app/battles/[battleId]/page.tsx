'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  CardMedia,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Share as ShareIcon,
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  Whatshot as FireIcon,
  HowToVote as VoteIcon,
  Login as LoginIcon,
  Upload as UploadIcon,
  CheckCircle as CheckIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { BattleAPI, Battle, ContentAPI, Content } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

export default function BattleDetailPage() {
  const params = useParams();
  const battleId = params.battleId as string;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votedFor, setVotedFor] = useState<'creator1' | 'creator2' | null>(null);
  const [voting, setVoting] = useState(false);
  const [contentUrls, setContentUrls] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Meme submission state
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [myMemes, setMyMemes] = useState<Content[]>([]);
  const [loadingMemes, setLoadingMemes] = useState(false);
  const [selectedMemeId, setSelectedMemeId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [memeUrls, setMemeUrls] = useState<Record<string, string>>({});

  const loadBattle = useCallback(async () => {
    setLoading(true);
    try {
      const response = await BattleAPI.getBattle(battleId);
      if (isApiSuccess(response)) {
        setBattle(response.data);
        // Load content thumbnails
        const contentIds = [response.data.creator1ContentId, response.data.creator2ContentId].filter(Boolean) as string[];
        loadContentThumbnails(contentIds);
      } else {
        setError('Battle not found');
      }
    } catch (err) {
      console.error('Failed to load battle:', err);
      setError('Failed to load battle');
    } finally {
      setLoading(false);
    }
  }, [battleId]);

  const loadMyVote = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await BattleAPI.getMyVote(battleId);
      if (isApiSuccess(response) && response.data) {
        // Determine which side the user voted for
        if (battle && response.data.votedFor === battle.creator1Id) {
          setVotedFor('creator1');
        } else if (battle && response.data.votedFor === battle.creator2Id) {
          setVotedFor('creator2');
        } else {
          // votedFor might be 'creator1' or 'creator2' directly
          const vote = response.data.votedFor as 'creator1' | 'creator2';
          if (vote === 'creator1' || vote === 'creator2') {
            setVotedFor(vote);
          }
        }
      }
    } catch {
      // User hasn't voted yet, that's fine
    }
  }, [isAuthenticated, battleId, battle]);

  // Load user's memes for submission picker
  const loadMyMemes = useCallback(async () => {
    if (!user?.id) return;
    setLoadingMemes(true);
    try {
      const response = await ContentAPI.getUserContent(user.id, 0, 50, user.id);
      if (isApiSuccess(response)) {
        const memes = (response.data.content || []).filter(
          (c: Content) => c.type === 'MEME' && (c.status === 'PUBLISHED' || c.status === 'READY')
        );
        setMyMemes(memes);
        // Load thumbnail URLs
        for (const meme of memes) {
          const url = meme.processedFile?.cdnUrl || meme.originalFile?.cdnUrl || meme.thumbnailUrl;
          if (url) {
            setMemeUrls(prev => ({ ...prev, [meme.id]: url }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load memes:', err);
    } finally {
      setLoadingMemes(false);
    }
  }, [user?.id]);

  // Handle meme submission
  const handleSubmitMeme = async () => {
    if (!selectedMemeId || submitting) return;
    setSubmitting(true);
    try {
      const response = await BattleAPI.submitMeme(battleId, selectedMemeId);
      if (isApiSuccess(response)) {
        setBattle(response.data);
        setSubmitDialogOpen(false);
        setSelectedMemeId(null);
        setSnackbar({ open: true, message: 'Meme submitted! Good luck!', severity: 'success' });
        // Reload content thumbnails for the updated battle
        const contentIds = [response.data.creator1ContentId, response.data.creator2ContentId].filter(Boolean) as string[];
        loadContentThumbnails(contentIds);
      } else {
        setSnackbar({ open: true, message: 'Failed to submit meme. Please try again.', severity: 'error' });
      }
    } catch (err: any) {
      console.error('Submit meme failed:', err);
      const msg = err?.response?.data?.message || 'Failed to submit meme. Please try again.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Open submission dialog
  const openSubmitDialog = () => {
    setSubmitDialogOpen(true);
    setSelectedMemeId(null);
    loadMyMemes();
  };

  useEffect(() => {
    loadBattle();
  }, [loadBattle]);

  useEffect(() => {
    if (battle && isAuthenticated) {
      loadMyVote();
    }
  }, [battle, isAuthenticated, loadMyVote]);

  // Countdown timer
  useEffect(() => {
    if (!battle?.votingEndsAt) return;

    const updateTimer = () => {
      const ends = new Date(battle.votingEndsAt!);
      const now = new Date();
      const diff = ends.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [battle?.votingEndsAt]);

  const loadContentThumbnails = async (contentIds: string[]) => {
    for (const cid of contentIds) {
      try {
        const res = await ContentAPI.getContent(cid);
        if (isApiSuccess(res)) {
          const url = res.data.processedFile?.cdnUrl || res.data.originalFile?.cdnUrl || res.data.thumbnailUrl;
          if (url) setContentUrls(prev => ({ ...prev, [cid]: url }));
        }
      } catch {
        // Ignore thumbnail load failures
      }
    }
  };

  const handleVote = async (side: 'creator1' | 'creator2') => {
    if (!isAuthenticated || votedFor || voting) return;
    setVoting(true);
    try {
      const response = await BattleAPI.vote(battleId, side);
      if (isApiSuccess(response)) {
        setVotedFor(side);
        setBattle(response.data);
        setSnackbar({ open: true, message: 'Vote recorded!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to vote. You may have already voted.', severity: 'error' });
      }
    } catch (err: any) {
      console.error('Vote failed:', err);
      setSnackbar({ open: true, message: 'Failed to vote. Please try again.', severity: 'error' });
    } finally {
      setVoting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/battles/${battleId}`;
    const shareData = {
      title: `Meme Battle: ${battle?.theme || 'Check it out!'}`,
      text: `Vote in this meme battle: "${battle?.theme}" on MemeToMoney!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
      }
    } catch (err) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Failed to share', severity: 'error' });
      }
    }
  };

  const getVotePercent = (side: 'creator1' | 'creator2') => {
    if (!battle) return 50;
    const total = battle.creator1Votes + battle.creator2Votes;
    if (total === 0) return 50;
    const votes = side === 'creator1' ? battle.creator1Votes : battle.creator2Votes;
    return Math.round((votes / total) * 100);
  };

  const getStatusLabel = () => {
    if (!battle) return '';
    switch (battle.status) {
      case 'WAITING': return 'Waiting for Opponent';
      case 'ACTIVE': return 'Memes Being Submitted';
      case 'VOTING': return 'Voting Open';
      case 'COMPLETED': return 'Battle Completed';
      case 'CANCELLED': return 'Battle Cancelled';
      default: return battle.status;
    }
  };

  const getStatusColor = () => {
    if (!battle) return '#6B7280';
    switch (battle.status) {
      case 'WAITING': return '#F59E0B';
      case 'ACTIVE': return '#3B82F6';
      case 'VOTING': return '#6B46C1';
      case 'COMPLETED': return '#10B981';
      case 'CANCELLED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <CircularProgress sx={{ color: '#6B46C1' }} />
        <Typography variant="body2" sx={{ mt: 2, color: '#6B7280' }}>Loading battle...</Typography>
      </Box>
    );
  }

  // Error state
  if (error || !battle) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8f9fa', px: 2 }}>
        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <FireIcon sx={{ fontSize: 40, color: '#EF4444' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Battle Not Found</Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mb: 3, textAlign: 'center' }}>
          This battle may have been removed or the link is invalid.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/battles')}
          sx={{ bgcolor: '#6B46C1', textTransform: 'none', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#553C9A' } }}
        >
          Browse Battles
        </Button>
      </Box>
    );
  }

  const c1Percent = getVotePercent('creator1');
  const c2Percent = getVotePercent('creator2');
  const totalVotes = battle.creator1Votes + battle.creator2Votes;
  const isVoting = battle.status === 'VOTING';
  const isCompleted = battle.status === 'COMPLETED';
  const isActive = battle.status === 'ACTIVE';
  const isWaiting = battle.status === 'WAITING';

  // Participant checks
  const isCreator1 = isAuthenticated && user?.id === battle.creator1Id;
  const isCreator2 = isAuthenticated && user?.id === battle.creator2Id;
  const isParticipant = isCreator1 || isCreator2;
  const hasSubmitted = isCreator1
    ? !!battle.creator1ContentId
    : isCreator2
      ? !!battle.creator2ContentId
      : false;
  const canSubmit = isActive && isParticipant && !hasSubmitted;
  const bothSubmitted = !!battle.creator1ContentId && !!battle.creator2ContentId;

  // Voters cannot be participants
  const canVote = isVoting && isAuthenticated && !votedFor && !isParticipant;

  // Can join (waiting battles, not the creator)
  const canJoin = isWaiting && isAuthenticated && !isCreator1;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      {/* Hero Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #EC4899 100%)',
          color: 'white',
          pb: 4,
          pt: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />

        {/* Top bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, position: 'relative', zIndex: 1 }}>
          <IconButton onClick={() => router.back()} sx={{ color: 'white' }}>
            <BackIcon />
          </IconButton>
          <IconButton onClick={handleShare} sx={{ color: 'white' }}>
            <ShareIcon />
          </IconButton>
        </Box>

        {/* Theme title */}
        <Box sx={{ textAlign: 'center', px: 3, position: 'relative', zIndex: 1 }}>
          <Chip
            icon={<FireIcon sx={{ color: '#FEF3C7 !important', fontSize: 16 }} />}
            label="MEME BATTLE"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.65rem',
              letterSpacing: 1.5,
              mb: 1.5,
              backdropFilter: 'blur(4px)',
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              mb: 1.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              lineHeight: 1.2,
            }}
          >
            {battle.theme}
          </Typography>

          {/* Status badge */}
          <Chip
            icon={
              isVoting ? <VoteIcon sx={{ color: 'inherit !important', fontSize: 14 }} /> :
              isCompleted ? <TrophyIcon sx={{ color: 'inherit !important', fontSize: 14 }} /> :
              <TimerIcon sx={{ color: 'inherit !important', fontSize: 14 }} />
            }
            label={getStatusLabel()}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.75rem',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Live timer */}
          {isVoting && timeLeft && timeLeft !== 'Ended' && (
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <TimerIcon sx={{ fontSize: 16, opacity: 0.9 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.9, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {timeLeft} left
              </Typography>
            </Box>
          )}

          {/* Prize */}
          {battle.prizeCoins > 0 && (
            <Box sx={{ mt: 1.5, display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(254,243,199,0.2)', borderRadius: 2, px: 2, py: 0.5 }}>
              <TrophyIcon sx={{ fontSize: 16, color: '#FDE68A' }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#FDE68A' }}>
                {battle.prizeCoins} coins prize
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Main content area */}
      <Box sx={{ maxWidth: 480, mx: 'auto', px: 2, mt: -2, position: 'relative', zIndex: 2 }}>
        {/* VS Battle Card */}
        <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 24px rgba(107,70,193,0.12)' }}>
          {/* Battle Arena */}
          <Box sx={{ display: 'flex', p: 2, gap: 1, alignItems: 'stretch' }}>
            {/* Creator 1 */}
            <Box
              sx={{
                flex: 1,
                textAlign: 'center',
                p: 2,
                borderRadius: 3,
                cursor: canVote ? 'pointer' : 'default',
                border: votedFor === 'creator1' ? '3px solid #6B46C1' : '3px solid transparent',
                bgcolor: votedFor === 'creator1' ? '#FAF5FF' : '#F9FAFB',
                transition: 'all 0.3s ease',
                '&:hover': canVote ? {
                  bgcolor: '#FAF5FF',
                  border: '3px solid #D8B4FE',
                  transform: 'scale(1.02)',
                } : {},
                position: 'relative',
              }}
              onClick={() => canVote && handleVote('creator1')}
            >
              {/* Winner badge */}
              {isCompleted && battle.winnerId === battle.creator1Id && (
                <Box sx={{
                  position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', zIndex: 3,
                  bgcolor: '#FEF3C7', borderRadius: 2, px: 1.5, py: 0.25,
                  border: '2px solid #F59E0B', boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <TrophyIcon sx={{ fontSize: 12 }} /> WINNER
                  </Typography>
                </Box>
              )}

              {/* Meme content */}
              {battle.creator1ContentId && contentUrls[battle.creator1ContentId] ? (
                <CardMedia
                  component="img"
                  image={contentUrls[battle.creator1ContentId]}
                  sx={{ width: '100%', aspectRatio: '1', borderRadius: 2, mb: 1.5, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
              ) : (
                <Box sx={{
                  width: '100%', aspectRatio: '1', borderRadius: 2, mb: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
                    {battle.status === 'WAITING' || battle.status === 'ACTIVE' ? 'Pending' : 'MEME'}
                  </Typography>
                </Box>
              )}

              <Avatar sx={{ width: 36, height: 36, mx: 'auto', mb: 0.5, bgcolor: '#6B46C1', fontSize: '0.85rem', fontWeight: 700 }}>
                {(battle.creator1Handle || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 700, display: 'block', color: '#1F2937' }}>
                {battle.creator1Handle || 'Challenger'}
              </Typography>

              {/* Vote count */}
              {(isVoting || isCompleted) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#6B46C1', lineHeight: 1 }}>
                    {c1Percent}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    {battle.creator1Votes.toLocaleString()} votes
                  </Typography>
                </Box>
              )}
            </Box>

            {/* VS divider */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 48 }}>
              <Box sx={{
                width: 2, flex: 1, bgcolor: '#E5E7EB', borderRadius: 1,
              }} />
              <Box sx={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                my: 1,
              }}>
                <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '0.85rem' }}>VS</Typography>
              </Box>
              <Box sx={{
                width: 2, flex: 1, bgcolor: '#E5E7EB', borderRadius: 1,
              }} />
            </Box>

            {/* Creator 2 */}
            <Box
              sx={{
                flex: 1,
                textAlign: 'center',
                p: 2,
                borderRadius: 3,
                cursor: canVote ? 'pointer' : 'default',
                border: votedFor === 'creator2' ? '3px solid #EC4899' : '3px solid transparent',
                bgcolor: votedFor === 'creator2' ? '#FDF2F8' : '#F9FAFB',
                transition: 'all 0.3s ease',
                '&:hover': canVote ? {
                  bgcolor: '#FDF2F8',
                  border: '3px solid #F9A8D4',
                  transform: 'scale(1.02)',
                } : {},
                position: 'relative',
              }}
              onClick={() => canVote && handleVote('creator2')}
            >
              {/* Winner badge */}
              {isCompleted && battle.winnerId === battle.creator2Id && (
                <Box sx={{
                  position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', zIndex: 3,
                  bgcolor: '#FEF3C7', borderRadius: 2, px: 1.5, py: 0.25,
                  border: '2px solid #F59E0B', boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <TrophyIcon sx={{ fontSize: 12 }} /> WINNER
                  </Typography>
                </Box>
              )}

              {/* Meme content */}
              {battle.creator2ContentId && contentUrls[battle.creator2ContentId] ? (
                <CardMedia
                  component="img"
                  image={contentUrls[battle.creator2ContentId]}
                  sx={{ width: '100%', aspectRatio: '1', borderRadius: 2, mb: 1.5, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
              ) : (
                <Box sx={{
                  width: '100%', aspectRatio: '1', borderRadius: 2, mb: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: battle.creator2Id
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : '#E5E7EB',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  <Typography sx={{ color: battle.creator2Id ? 'white' : '#9CA3AF', fontWeight: 700, fontSize: '0.8rem' }}>
                    {battle.creator2Id ? (battle.status === 'ACTIVE' ? 'Pending' : 'MEME') : 'Waiting...'}
                  </Typography>
                </Box>
              )}

              {battle.creator2Id ? (
                <>
                  <Avatar sx={{ width: 36, height: 36, mx: 'auto', mb: 0.5, bgcolor: '#EC4899', fontSize: '0.85rem', fontWeight: 700 }}>
                    {(battle.creator2Handle || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 700, display: 'block', color: '#1F2937' }}>
                    {battle.creator2Handle || 'Opponent'}
                  </Typography>

                  {(isVoting || isCompleted) && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#EC4899', lineHeight: 1 }}>
                        {c2Percent}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {battle.creator2Votes.toLocaleString()} votes
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <Avatar sx={{ width: 36, height: 36, mx: 'auto', mb: 0.5, bgcolor: '#D1D5DB', fontSize: '0.85rem' }}>?</Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#9CA3AF', display: 'block' }}>
                    No opponent yet
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Vote progress bar */}
          {(isVoting || isCompleted) && totalVotes > 0 && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', borderRadius: 2, overflow: 'hidden', height: 12, bgcolor: '#F3F4F6' }}>
                <Box sx={{
                  width: `${c1Percent}%`,
                  background: 'linear-gradient(90deg, #6B46C1, #7C3AED)',
                  transition: 'width 0.8s ease',
                  borderRadius: c2Percent === 0 ? 2 : '8px 0 0 8px',
                }} />
                <Box sx={{
                  width: `${c2Percent}%`,
                  background: 'linear-gradient(90deg, #EC4899, #F472B6)',
                  transition: 'width 0.8s ease',
                  borderRadius: c1Percent === 0 ? 2 : '0 8px 8px 0',
                }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block', textAlign: 'center', fontWeight: 600 }}>
                {totalVotes.toLocaleString()} total votes
              </Typography>
            </Box>
          )}
        </Card>

        {/* Action area */}
        <Box sx={{ mt: 3 }}>
          {/* Join button for waiting battles */}
          {canJoin && (
            <Card sx={{ borderRadius: 3, p: 2.5, textAlign: 'center', bgcolor: '#FAF5FF', border: '1px solid #EDE9FE', mb: 2 }}>
              <FireIcon sx={{ fontSize: 32, color: '#EF4444', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2937', mb: 0.5 }}>
                This battle needs an opponent!
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                Join and compete with your best meme
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={async () => {
                  try {
                    const response = await BattleAPI.joinBattle(battleId);
                    if (isApiSuccess(response)) {
                      setBattle(response.data);
                      setSnackbar({ open: true, message: 'You joined the battle! Now submit your meme.', severity: 'success' });
                    }
                  } catch (err: any) {
                    setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to join battle.', severity: 'error' });
                  }
                }}
                sx={{ bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 2, fontWeight: 700, py: 1.2, '&:hover': { bgcolor: '#553C9A' } }}
              >
                Join This Battle
              </Button>
            </Card>
          )}

          {/* Submit Meme CTA for participants in ACTIVE battles */}
          {canSubmit && (
            <Card sx={{ borderRadius: 3, p: 2.5, textAlign: 'center', bgcolor: '#FAF5FF', border: '1px solid #EDE9FE', mb: 2 }}>
              <UploadIcon sx={{ fontSize: 32, color: '#6B46C1', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2937', mb: 0.5 }}>
                Submit Your Meme!
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                Pick your best meme to compete in this battle. You have 48h to submit.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ImageIcon />}
                onClick={openSubmitDialog}
                sx={{
                  bgcolor: '#6B46C1',
                  textTransform: 'none',
                  borderRadius: 2,
                  fontWeight: 700,
                  py: 1.2,
                  fontSize: '0.95rem',
                  '&:hover': { bgcolor: '#553C9A' },
                }}
              >
                Choose a Meme to Submit
              </Button>
            </Card>
          )}

          {/* Submission confirmed for participant who already submitted */}
          {isActive && isParticipant && hasSubmitted && (
            <Card sx={{ borderRadius: 3, p: 2.5, textAlign: 'center', bgcolor: '#ECFDF5', border: '1px solid #D1FAE5', mb: 2 }}>
              <CheckIcon sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#065F46', mb: 0.5 }}>
                Meme Submitted!
              </Typography>
              <Typography variant="body2" sx={{ color: '#047857' }}>
                {bothSubmitted
                  ? 'Both memes are in! Voting will start soon.'
                  : 'Waiting for your opponent to submit their meme...'}
              </Typography>
            </Card>
          )}

          {/* Participant notice during voting */}
          {isVoting && isParticipant && (
            <Card sx={{ borderRadius: 3, p: 2.5, textAlign: 'center', bgcolor: '#FAF5FF', border: '1px solid #EDE9FE', mb: 2 }}>
              <VoteIcon sx={{ fontSize: 32, color: '#6B46C1', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2937', mb: 0.5 }}>
                Voting is Live!
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                Share this battle to get more votes. As a participant, you cannot vote.
              </Typography>
            </Card>
          )}

          {/* Vote CTA for logged-in non-participant users */}
          {isVoting && isAuthenticated && !votedFor && !isParticipant && (
            <Card sx={{ borderRadius: 3, p: 2.5, textAlign: 'center', bgcolor: '#FAF5FF', border: '1px solid #EDE9FE' }}>
              <VoteIcon sx={{ fontSize: 32, color: '#6B46C1', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2937', mb: 0.5 }}>
                Cast Your Vote!
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                Tap on the meme you think is funnier to vote
              </Typography>
              {voting && <CircularProgress size={24} sx={{ color: '#6B46C1' }} />}
            </Card>
          )}

          {/* Voted confirmation */}
          {votedFor && (
            <Card sx={{ borderRadius: 3, p: 2.5, textAlign: 'center', bgcolor: '#ECFDF5', border: '1px solid #D1FAE5' }}>
              <Chip
                label="Vote Recorded!"
                sx={{ bgcolor: '#10B981', color: 'white', fontWeight: 700, fontSize: '0.85rem', mb: 1, px: 1 }}
              />
              <Typography variant="body2" sx={{ color: '#065F46' }}>
                You voted for <strong>{votedFor === 'creator1' ? (battle.creator1Handle || 'Challenger') : (battle.creator2Handle || 'Opponent')}</strong>
              </Typography>
            </Card>
          )}

          {/* Login CTA for unauthenticated users */}
          {isVoting && !isAuthenticated && (
            <Card sx={{ borderRadius: 3, p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #FAF5FF 0%, #FDF2F8 100%)', border: '1px solid #EDE9FE' }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6B46C1 0%, #EC4899 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
              }}>
                <VoteIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2937', mb: 0.5 }}>
                Want to vote?
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                Log in to cast your vote and support your favorite meme creator!
              </Typography>
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={() => router.push(`/auth/login?redirect=/battles/${battleId}`)}
                sx={{
                  background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 4,
                  py: 1.2,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 12px rgba(107,70,193,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)',
                  },
                }}
              >
                Login to Vote
              </Button>
            </Card>
          )}

          {/* Completed battle summary */}
          {isCompleted && battle.winnerId && (
            <Card sx={{ borderRadius: 3, p: 2.5, textAlign: 'center', bgcolor: '#FFFBEB', border: '1px solid #FDE68A', mt: 2 }}>
              <TrophyIcon sx={{ fontSize: 40, color: '#F59E0B', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#92400E' }}>
                Battle Champion!
              </Typography>
              <Typography variant="body2" sx={{ color: '#78350F', mt: 0.5 }}>
                <strong>
                  {battle.winnerId === battle.creator1Id
                    ? (battle.creator1Handle || 'Challenger')
                    : (battle.creator2Handle || 'Opponent')}
                </strong> won with{' '}
                {battle.winnerId === battle.creator1Id
                  ? `${c1Percent}% of votes`
                  : `${c2Percent}% of votes`}
              </Typography>
              {battle.prizeCoins > 0 && (
                <Chip
                  label={`Won ${battle.prizeCoins} coins!`}
                  sx={{ mt: 1, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }}
                />
              )}
            </Card>
          )}

          {/* Completed with no winner (tie or cancelled) */}
          {isCompleted && !battle.winnerId && (
            <Card sx={{ borderRadius: 3, p: 2.5, textAlign: 'center', bgcolor: '#F3F4F6', border: '1px solid #E5E7EB', mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#6B7280' }}>
                Battle Ended
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>
                {totalVotes === 0 ? 'No votes were cast in this battle.' : 'This battle ended in a tie!'}
              </Typography>
            </Card>
          )}
        </Box>

        {/* Share button */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            sx={{
              borderColor: '#6B46C1',
              color: '#6B46C1',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 4,
              '&:hover': { borderColor: '#553C9A', bgcolor: '#FAF5FF' },
            }}
          >
            Share This Battle
          </Button>
        </Box>

        {/* Battle details */}
        <Card sx={{ mt: 3, borderRadius: 3, p: 2, bgcolor: 'white' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B7280', mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
            Battle Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Status</Typography>
              <Chip label={getStatusLabel()} size="small" sx={{ bgcolor: `${getStatusColor()}20`, color: getStatusColor(), fontWeight: 600, fontSize: '0.7rem' }} />
            </Box>
            {battle.createdAt && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Created</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                  {new Date(battle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
              </Box>
            )}
            {battle.votingEndsAt && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Voting Ends</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                  {new Date(battle.votingEndsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Total Votes</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                {totalVotes.toLocaleString()}
              </Typography>
            </Box>
            {battle.prizeCoins > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Prize Pool</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#F59E0B' }}>
                  {battle.prizeCoins} coins
                </Typography>
              </Box>
            )}
          </Box>
        </Card>

        {/* Browse more battles */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => router.push('/battles')}
            sx={{ color: '#6B46C1', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#FAF5FF' } }}
          >
            Browse All Battles
          </Button>
        </Box>
      </Box>

      {/* Meme Submission Dialog */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => !submitting && setSubmitDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ImageIcon sx={{ color: '#6B46C1' }} />
          Select Your Meme
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
            Choose one of your published memes to submit for this battle. Pick your best one!
          </Typography>

          {loadingMemes ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#6B46C1' }} />
            </Box>
          ) : myMemes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ImageIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#6B7280', mb: 1 }}>
                No memes found
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                Upload a meme first, then come back to submit it for the battle.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSubmitDialogOpen(false);
                  router.push('/upload');
                }}
                sx={{ borderColor: '#6B46C1', color: '#6B46C1', textTransform: 'none', fontWeight: 600, borderRadius: 2, '&:hover': { borderColor: '#553C9A', bgcolor: '#FAF5FF' } }}
              >
                Upload a Meme
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              {myMemes.map((meme) => {
                const url = memeUrls[meme.id];
                const isSelected = selectedMemeId === meme.id;
                return (
                  <Box
                    key={meme.id}
                    onClick={() => setSelectedMemeId(meme.id)}
                    sx={{
                      position: 'relative',
                      cursor: 'pointer',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: isSelected ? '3px solid #6B46C1' : '3px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': { border: '3px solid #D8B4FE' },
                    }}
                  >
                    {url ? (
                      <CardMedia
                        component="img"
                        image={url}
                        sx={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{
                        width: '100%', aspectRatio: '1', bgcolor: '#F3F4F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ImageIcon sx={{ color: '#D1D5DB', fontSize: 32 }} />
                      </Box>
                    )}
                    {/* Selected overlay */}
                    {isSelected && (
                      <Box sx={{
                        position: 'absolute', inset: 0,
                        bgcolor: 'rgba(107,70,193,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckIcon sx={{ color: 'white', fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                      </Box>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block', textAlign: 'center', py: 0.5, px: 0.5,
                        fontWeight: 600, color: '#374151', fontSize: '0.65rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {meme.title}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {submitting && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress sx={{ borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: '#6B46C1' } }} />
              <Typography variant="caption" sx={{ color: '#6B7280', mt: 0.5, display: 'block', textAlign: 'center' }}>
                Submitting your meme...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setSubmitDialogOpen(false)}
            disabled={submitting}
            sx={{ textTransform: 'none', color: '#6B7280' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitMeme}
            disabled={!selectedMemeId || submitting}
            sx={{
              bgcolor: '#6B46C1',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#553C9A' },
              '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Meme'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
