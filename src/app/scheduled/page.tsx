'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI, Content, PageResponse } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';

function ScheduledPostsContent() {
  const [posts, setPosts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingPostId, setCancellingPostId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const loadScheduledPosts = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await ContentAPI.getUserContent(user.id, 0, 50, user.id);
      if (isApiSuccess(response)) {
        const allContent = response.data.content || [];
        // Filter for scheduled posts (status PROCESSING or READY that have a future publishedAt)
        const scheduled = allContent.filter(
          (c: Content) =>
            c.status === 'PROCESSING' ||
            (c.status === 'READY' && c.publishedAt && new Date(c.publishedAt) > new Date())
        );
        setPosts(scheduled);
      } else {
        setError('Failed to load scheduled posts');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadScheduledPosts();
  }, [loadScheduledPosts]);

  const handleCancelClick = (postId: string) => {
    setCancellingPostId(postId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancellingPostId || !user?.id) return;
    try {
      setCancelling(true);
      // Remove the post from the local list optimistically
      setPosts((prev) => prev.filter((p) => p.id !== cancellingPostId));
      setCancelDialogOpen(false);
      setCancellingPostId(null);
    } catch {
      // Reload on failure
      loadScheduledPosts();
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelDismiss = () => {
    setCancelDialogOpen(false);
    setCancellingPostId(null);
  };

  const getContentThumbnail = (content: Content) =>
    content.thumbnailUrl ||
    content.processedFile?.cdnUrl ||
    content.originalFile?.cdnUrl;

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    let relative = '';
    if (diffMs < 0) {
      relative = 'Overdue';
    } else if (diffHours < 1) {
      relative = 'Less than 1 hour';
    } else if (diffHours < 24) {
      relative = `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      relative = `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }

    return { formatted, time, relative };
  };

  const getStatusChip = (content: Content) => {
    if (content.status === 'PROCESSING') {
      return (
        <Chip
          label="Processing"
          size="small"
          sx={{
            bgcolor: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 24,
          }}
        />
      );
    }
    return (
      <Chip
        icon={<ScheduleIcon sx={{ fontSize: 14, color: '#6B46C1 !important' }} />}
        label="Scheduled"
        size="small"
        sx={{
          bgcolor: 'rgba(107, 70, 193, 0.15)',
          color: '#6B46C1',
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 24,
        }}
      />
    );
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'white',
          zIndex: 10,
          p: 2,
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton onClick={() => router.back()} sx={{ color: '#1a1a1a' }} size="small">
          <ArrowBack />
        </IconButton>
        <ScheduleIcon sx={{ color: '#6B46C1', fontSize: 24 }} />
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.1rem' }}
        >
          Scheduled Posts
        </Typography>
      </Box>

      <Container maxWidth={false} sx={{ p: 0, maxWidth: { xs: '100%', sm: '100%', md: 600 } }}>
        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Box sx={{ px: 2, pt: 2 }}>
            <Alert
              severity="error"
              sx={{ borderRadius: 2 }}
              action={
                <Button onClick={loadScheduledPosts} sx={{ color: 'inherit' }}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(107, 70, 193, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ScheduleIcon sx={{ fontSize: 40, color: '#6B46C1' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}
            >
              No Scheduled Posts
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6B7280', mb: 3, maxWidth: 280, mx: 'auto' }}
            >
              You don&apos;t have any posts scheduled yet. Create content and schedule it to publish later.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/upload')}
              sx={{
                bgcolor: '#6B46C1',
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                '&:hover': { bgcolor: '#553C9A' },
              }}
            >
              Create Post
            </Button>
          </Box>
        )}

        {/* Scheduled Posts List */}
        {!loading && posts.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2 }}>
            <Typography
              variant="body2"
              sx={{ color: '#6B7280', fontWeight: 500, mb: 0.5 }}
            >
              {posts.length} scheduled post{posts.length !== 1 ? 's' : ''}
            </Typography>

            {posts.map((post) => {
              const thumbnail = getContentThumbnail(post);
              const scheduleInfo = post.publishedAt
                ? formatScheduledDate(post.publishedAt)
                : null;

              return (
                <Card
                  key={post.id}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 'none',
                    border: '1px solid #E5E7EB',
                    bgcolor: 'white',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
                  }}
                >
                  <Box sx={{ display: 'flex' }}>
                    {/* Thumbnail */}
                    <Box
                      sx={{
                        width: 100,
                        minHeight: 100,
                        flexShrink: 0,
                        position: 'relative',
                        bgcolor: '#E5E7EB',
                      }}
                    >
                      {thumbnail ? (
                        <CardMedia
                          component="img"
                          image={thumbnail}
                          alt={post.title || 'Scheduled post'}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                              'linear-gradient(135deg, rgba(107, 70, 193, 0.2) 0%, rgba(107, 70, 193, 0.1) 100%)',
                          }}
                        >
                          {post.type === 'SHORT_VIDEO' ? (
                            <VideoIcon sx={{ fontSize: 32, color: '#6B46C1' }} />
                          ) : (
                            <ImageIcon sx={{ fontSize: 32, color: '#6B46C1' }} />
                          )}
                        </Box>
                      )}
                      {/* Type badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          borderRadius: 0.5,
                          px: 0.5,
                          py: 0.25,
                        }}
                      >
                        <Typography
                          sx={{
                            color: 'white',
                            fontSize: '0.55rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {post.type === 'SHORT_VIDEO' ? 'Video' : 'Meme'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Content Details */}
                    <CardContent
                      sx={{
                        flex: 1,
                        p: 1.5,
                        '&:last-child': { pb: 1.5 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: '#1a1a1a',
                            fontSize: '0.85rem',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 200,
                          }}
                        >
                          {post.title || 'Untitled Post'}
                        </Typography>

                        {scheduleInfo && (
                          <Box sx={{ mb: 0.75 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#6B7280',
                                fontSize: '0.72rem',
                                display: 'block',
                              }}
                            >
                              {scheduleInfo.formatted} at {scheduleInfo.time}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: scheduleInfo.relative === 'Overdue' ? '#DC2626' : '#6B46C1',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                              }}
                            >
                              {scheduleInfo.relative}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                          {getStatusChip(post)}
                          {post.hashtags && post.hashtags.length > 0 && (
                            <Typography
                              variant="caption"
                              sx={{ color: '#6B46C1', fontSize: '0.68rem' }}
                            >
                              {post.hashtags
                                .slice(0, 2)
                                .map((t) => `#${t}`)
                                .join(' ')}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Cancel button */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                          size="small"
                          startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleCancelClick(post.id)}
                          sx={{
                            color: '#DC2626',
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(220, 38, 38, 0.1)',
                            '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.2)' },
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDismiss}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 360,
            mx: 2,
            bgcolor: 'white',
            border: '1px solid #E5E7EB',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            color: '#1a1a1a',
            pb: 0.5,
          }}
        >
          Cancel Scheduled Post?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ color: '#6B7280', fontSize: '0.88rem' }}
          >
            This will remove the post from your schedule. The post will not be published at the scheduled time. You can always reschedule it later.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCancelDismiss}
            sx={{
              color: '#1a1a1a',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Keep It
          </Button>
          <Button
            onClick={handleCancelConfirm}
            disabled={cancelling}
            variant="contained"
            sx={{
              bgcolor: '#DC2626',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function ScheduledPostsPage() {
  return (
    <ProtectedRoute>
      <ScheduledPostsContent />
    </ProtectedRoute>
  );
}
