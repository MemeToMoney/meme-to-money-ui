'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  Grid,
  Card,
  CardMedia,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  MoreVert as MoreIcon,
  Block as BlockIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  MilitaryTech as MedalIcon,
  Verified as VerifiedIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { LinearProgress, Tooltip, Chip } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserAPI, FollowStatus, ReputationInfo } from '@/lib/api/user';
import { ContentAPI, Content } from '@/lib/api/content';
import { MessagingAPI } from '@/lib/api/messaging';
import { isApiSuccess } from '@/lib/api/client';
import { PostDetailModal } from '@/components/PostDetailModal';

function UserProfileContent() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [userContent, setUserContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Content | null>(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [reputation, setReputation] = useState<ReputationInfo | null>(null);

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (currentUser?.id && userId === currentUser.id) {
      router.replace('/profile');
      return;
    }
    if (userId) {
      loadProfile();
      loadUserContent();
    }
  }, [userId, currentUser?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, statusRes, repRes] = await Promise.all([
        UserAPI.getUserProfile(userId),
        UserAPI.getFollowStatus(userId),
        UserAPI.getReputation(userId),
      ]);

      if (isApiSuccess(profileRes)) {
        setProfileUser(profileRes.data);
      }
      if (isApiSuccess(statusRes)) {
        setFollowStatus(statusRes.data);
      }
      if (isApiSuccess(repRes)) {
        setReputation(repRes.data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserContent = async () => {
    try {
      setContentLoading(true);
      const response = await ContentAPI.getUserContent(userId, 0, 30, currentUser?.id);
      if (isApiSuccess(response)) {
        setUserContent(response.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load content:', err);
      setUserContent([]);
    } finally {
      setContentLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!followStatus) return;
    setFollowLoading(true);

    // Save previous state for rollback
    const prevFollowStatus = { ...followStatus };
    const prevFollowerCount = profileUser?.followerCount || 0;

    try {
      const isFollowing = followStatus.following;
      const isPending = followStatus.pending;

      // Optimistic update
      if (isFollowing || isPending) {
        setFollowStatus(prev => prev ? { ...prev, following: false, pending: false } : null);
        if (isFollowing) {
          setProfileUser((prev: any) => prev ? {
            ...prev,
            followerCount: Math.max(0, (prev.followerCount || 0) - 1),
          } : null);
        }
      }

      // If already following or pending, unfollow/cancel
      const response = (isFollowing || isPending)
        ? await UserAPI.unfollowUser(userId)
        : await UserAPI.followUser(userId);

      if (isApiSuccess(response)) {
        if (isFollowing || isPending) {
          // Already updated optimistically above
          setSnackbar({ open: true, message: isPending ? 'Follow request cancelled' : 'Unfollowed' });
        } else {
          // New follow - check if it's pending (private account) or active
          const newStatus = response.data?.status;
          if (newStatus === 'PENDING') {
            setFollowStatus(prev => prev ? { ...prev, pending: true } : null);
            setSnackbar({ open: true, message: 'Follow request sent!' });
          } else {
            setFollowStatus(prev => prev ? { ...prev, following: true } : null);
            setProfileUser((prev: any) => prev ? {
              ...prev,
              followerCount: (prev.followerCount || 0) + 1,
            } : null);
            setSnackbar({ open: true, message: 'Following!' });
          }
        }
      } else {
        // Revert on API failure
        setFollowStatus(prevFollowStatus);
        setProfileUser((prev: any) => prev ? { ...prev, followerCount: prevFollowerCount } : null);
        setSnackbar({ open: true, message: 'Action failed. Try again.' });
      }
    } catch (err) {
      console.error('Follow action failed:', err);
      // Revert on error
      setFollowStatus(prevFollowStatus);
      setProfileUser((prev: any) => prev ? { ...prev, followerCount: prevFollowerCount } : null);
      setSnackbar({ open: true, message: 'Action failed. Try again.' });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    setMessagingLoading(true);
    try {
      const res = await MessagingAPI.createDirectConversation(userId);
      if (isApiSuccess(res)) {
        router.push(`/messages?conversationId=${res.data.id}`);
      } else {
        router.push('/messages');
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
      router.push('/messages');
    } finally {
      setMessagingLoading(false);
    }
  };

  const getContentUrl = (content: Content) => {
    return content.processedFile?.cdnUrl || content.originalFile?.cdnUrl || content.thumbnailUrl;
  };

  const getProfilePictureUrl = (profilePicture?: string) => {
    if (!profilePicture) return undefined;
    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
      return profilePicture;
    }
    const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8080';
    const baseUrl = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;
    return `${USER_SERVICE_URL}${baseUrl}`;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
        <Container maxWidth={false} sx={{ p: 0 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'white', borderBottom: '1px solid #E5E7EB' }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton width={120} height={24} />
          </Box>
          <Box sx={{ bgcolor: 'white', p: 3, textAlign: 'center' }}>
            <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton width={160} height={28} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton width={100} height={20} sx={{ mx: 'auto', mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
              <Skeleton width={60} height={40} />
              <Skeleton width={60} height={40} />
              <Skeleton width={60} height={40} />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!profileUser) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">User not found</Typography>
          <Button onClick={() => router.back()} sx={{ mt: 2, textTransform: 'none', color: '#6B46C1' }}>
            Go back
          </Button>
        </Box>
      </Box>
    );
  }

  const isFollowing = followStatus?.following || false;
  const isFollowedBy = followStatus?.followedBy || false;
  const isPending = followStatus?.pending || false;
  const profilePicUrl = getProfilePictureUrl(profileUser.profilePicture);
  const isPrivate = profileUser.isPrivateAccount === true && !isFollowing;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      <Container maxWidth={false} sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'white',
          zIndex: 1,
          p: 2,
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <IconButton onClick={() => router.back()} size="small">
            <BackIcon sx={{ color: '#374151' }} />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#374151', flex: 1 }}>
            {profileUser.displayName || profileUser.name}
          </Typography>
          {profileUser.isPrivateAccount && (
            <LockIcon sx={{ color: '#6B7280', fontSize: 18 }} />
          )}
        </Box>

        {/* Profile Header */}
        <Box sx={{ bgcolor: 'white', pb: 3, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {/* Cover gradient */}
          <Box sx={{
            height: 100,
            background: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
            opacity: 0.3,
          }} />

          <Container maxWidth="md" sx={{ mt: -5, px: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {/* Avatar */}
              <Avatar
                src={profilePicUrl}
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: '#6B46C1',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  mb: 2,
                }}
              >
                {profileUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>

              {/* User Info */}
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}>
                {profileUser.displayName || profileUser.name}
              </Typography>

              <Typography variant="body1" sx={{ color: '#6B46C1', fontWeight: 600, mb: 0.5 }}>
                @{profileUser.creatorHandle || profileUser.username || 'user'}
              </Typography>

              {profileUser.currentStreak > 0 && (
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(107, 70, 193, 0.08)',
                  border: '1px solid rgba(107, 70, 193, 0.2)',
                  borderRadius: 3,
                  px: 1.5,
                  py: 0.5,
                  mb: 0.5,
                }}>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {'\uD83D\uDD25'} {profileUser.currentStreak} day streak
                    {profileUser.streakTitle ? ` \u00B7 ${profileUser.streakTitle}` : ''}
                  </Typography>
                </Box>
              )}

              {/* Reputation Badge & XP */}
              {reputation && (
                <Box sx={{ mb: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  {/* Rank Badge */}
                  <Chip
                    icon={<TrophyIcon sx={{ fontSize: 16 }} />}
                    label={`${reputation.rank} - ${reputation.reputationXP} XP`}
                    size="small"
                    sx={{
                      bgcolor: reputation.rank === 'Meme God' ? '#7C3AED'
                        : reputation.rank === 'Meme Lord' ? '#8B5CF6'
                        : reputation.rank === 'Meme Pro' ? '#A78BFA'
                        : reputation.rank === 'Meme Creator' ? '#C4B5FD'
                        : '#E9D5FF',
                      color: reputation.rank === 'Meme God' || reputation.rank === 'Meme Lord' || reputation.rank === 'Meme Pro'
                        ? 'white' : '#5B21B6',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      '& .MuiChip-icon': {
                        color: 'inherit',
                      },
                    }}
                  />

                  {/* XP Progress Bar to next rank */}
                  {reputation.nextRankXP !== -1 && (
                    <Tooltip title={`${reputation.reputationXP} / ${reputation.nextRankXP} XP to next rank`} arrow>
                      <Box sx={{ width: '100%', maxWidth: 220 }}>
                        <LinearProgress
                          variant="determinate"
                          value={reputation.progressPercent}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#EDE9FE',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              background: 'linear-gradient(90deg, #A78BFA 0%, #7C3AED 100%)',
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.65rem', mt: 0.25, display: 'block', textAlign: 'center' }}>
                          {reputation.reputationXP} / {reputation.nextRankXP} XP
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                  {reputation.nextRankXP === -1 && (
                    <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 600, fontSize: '0.65rem' }}>
                      Max Rank Achieved!
                    </Typography>
                  )}

                  {/* Badge Icons Row */}
                  {reputation.badges && reputation.badges.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {reputation.badges.map((badge, idx) => (
                        <Tooltip key={idx} title={badge} arrow>
                          <Chip
                            icon={
                              badge === 'First Meme' ? <StarIcon sx={{ fontSize: 14 }} /> :
                              badge === 'Battle Victor' ? <MedalIcon sx={{ fontSize: 14 }} /> :
                              badge === 'Streak Master' ? <SparkleIcon sx={{ fontSize: 14 }} /> :
                              <VerifiedIcon sx={{ fontSize: 14 }} />
                            }
                            label={badge}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 24,
                              fontSize: '0.65rem',
                              borderColor: '#D8B4FE',
                              color: '#6B46C1',
                              '& .MuiChip-icon': { color: '#6B46C1' },
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {isFollowedBy && (
                <Typography variant="caption" sx={{
                  color: '#6B7280',
                  bgcolor: '#F3F4F6',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 2,
                  mb: 1,
                }}>
                  Follows you
                </Typography>
              )}

              {!isPrivate && profileUser.bio && (
                <Typography variant="body2" sx={{ color: '#4B5563', mb: 2, maxWidth: 400, lineHeight: 1.6 }}>
                  {profileUser.bio}
                </Typography>
              )}

              {/* Stats Row */}
              <Box sx={{
                display: 'flex',
                gap: { xs: 3, sm: 4, md: 5 },
                mb: 3,
                p: 2,
                bgcolor: '#F9FAFB',
                borderRadius: 4,
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
                    {isPrivate ? '-' : (userContent?.length || 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Posts
                  </Typography>
                </Box>
                <Box
                  sx={{ textAlign: 'center', cursor: isPrivate ? 'default' : 'pointer', '&:hover': { opacity: isPrivate ? 1 : 0.7 } }}
                  onClick={() => !isPrivate && router.push(`/profile/${userId}/followers`)}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
                    {isPrivate ? '-' : (profileUser.followerCount || 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Followers
                  </Typography>
                </Box>
                <Box
                  sx={{ textAlign: 'center', cursor: isPrivate ? 'default' : 'pointer', '&:hover': { opacity: isPrivate ? 1 : 0.7 } }}
                  onClick={() => !isPrivate && router.push(`/profile/${userId}/following`)}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
                    {isPrivate ? '-' : (profileUser.followingCount || 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Following
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 400 }}>
                <Button
                  variant={(isFollowing || isPending) ? 'outlined' : 'contained'}
                  fullWidth
                  disabled={followLoading}
                  onClick={handleFollowToggle}
                  startIcon={
                    followLoading ? <CircularProgress size={16} /> : isFollowing ? <CheckIcon /> : isPending ? <CheckIcon /> : <PersonAddIcon />
                  }
                  sx={{
                    textTransform: 'none',
                    borderRadius: 3,
                    fontWeight: 600,
                    py: 1.2,
                    ...((isFollowing || isPending)
                      ? {
                          borderColor: isPending ? '#D1D5DB' : '#E5E7EB',
                          color: isPending ? '#6B7280' : '#374151',
                          '&:hover': { borderColor: '#EF4444', color: '#EF4444', bgcolor: 'rgba(239,68,68,0.04)' },
                        }
                      : {
                          bgcolor: '#6B46C1',
                          boxShadow: '0 4px 12px rgba(107, 70, 193, 0.2)',
                          '&:hover': { bgcolor: '#553C9A', boxShadow: '0 6px 16px rgba(107, 70, 193, 0.3)' },
                        }),
                  }}
                >
                  {isFollowing ? 'Following' : isPending ? 'Requested' : 'Follow'}
                </Button>
                {!isPrivate && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleMessage}
                    disabled={messagingLoading}
                    sx={{
                      borderColor: '#E5E7EB',
                      color: '#374151',
                      textTransform: 'none',
                      borderRadius: 3,
                      fontWeight: 600,
                      py: 1.2,
                      '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' },
                    }}
                  >
                    {messagingLoading ? <CircularProgress size={20} /> : 'Message'}
                  </Button>
                )}
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Private Account Notice */}
        {isPrivate ? (
          <Container maxWidth="md" sx={{ mt: 2, px: 2 }}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{
                width: 80,
                height: 80,
                bgcolor: '#F3F4F6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                border: '2px solid #E5E7EB',
              }}>
                <LockIcon sx={{ fontSize: 36, color: '#6B7280' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#374151', mb: 1 }}>
                This account is private
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', maxWidth: 300, mx: 'auto' }}>
                Follow this account to see their photos, videos, and posts.
              </Typography>
            </Box>
          </Container>
        ) : (
        <>
        {/* Content Grid */}
        <Container maxWidth="md" sx={{ mt: 2, px: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151', mb: 2, px: 1 }}>
            Posts
          </Typography>

          {contentLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#6B46C1' }} />
            </Box>
          ) : userContent.length > 0 ? (
            <Grid container spacing={{ xs: 0.5, sm: 1, md: 1 }}>
              {userContent.map((content) => {
                const contentUrl = getContentUrl(content);
                return (
                  <Grid item xs={4} sm={4} md={4} key={content.id} sx={{ minWidth: 0 }}>
                    <Card
                      sx={{
                        borderRadius: { xs: 1, sm: 2 },
                        overflow: 'hidden',
                        aspectRatio: '1',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        position: 'relative',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': { opacity: 0.9, transform: 'scale(1.03)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' },
                      }}
                      onClick={() => {
                        setSelectedPost(content);
                        setPostDialogOpen(true);
                      }}
                    >
                      {content.type === 'SHORT_VIDEO' ? (
                        <Box sx={{ position: 'relative', height: '100%' }}>
                          <CardMedia
                            component="img"
                            image={content.thumbnailUrl || contentUrl}
                            alt={content.title}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <PlayIcon sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: 32,
                            color: 'white',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                          }} />
                        </Box>
                      ) : (
                        <CardMedia
                          component="img"
                          image={contentUrl}
                          alt={content.title}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{
                width: 64,
                height: 64,
                bgcolor: '#F3F4F6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}>
                <PhotoCameraIcon sx={{ fontSize: 32, color: '#9CA3AF' }} />
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                No posts yet
              </Typography>
            </Box>
          )}
        </Container>
        </>
        )}

        {/* Post Detail Modal */}
        <PostDetailModal
          open={postDialogOpen}
          onClose={() => setPostDialogOpen(false)}
          post={selectedPost}
          onLike={() => {}}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity="info" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default function UserProfilePage() {
  return (
    <ProtectedRoute>
      <UserProfileContent />
    </ProtectedRoute>
  );
}
