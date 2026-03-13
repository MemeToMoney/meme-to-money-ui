'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  People as PeopleIcon,
  Article as PostIcon,
  Favorite as LikeIcon,
  Visibility as ViewIcon,
  ChatBubbleOutline as CommentIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CommunityAPI, Community, CommunityDetail, Content, ContentAPI } from '@/lib/api/content';
import { isApiSuccess, formatTimeAgo, formatCreatorHandle, getHandleInitial } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

function CommunityDetailContent() {
  const [communityDetail, setCommunityDetail] = useState<CommunityDetail | null>(null);
  const [posts, setPosts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();

  const loadCommunity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CommunityAPI.getCommunity(slug, user?.id);
      if (isApiSuccess(res)) {
        setCommunityDetail(res.data);
        setIsMember(res.data.isMember);
      }
    } catch (e) {
      console.error('Failed to load community', e);
    }
    setLoading(false);
  }, [slug, user?.id]);

  const loadPosts = useCallback(async (pageNum: number) => {
    setPostsLoading(true);
    try {
      const res = await CommunityAPI.getCommunityPosts(slug, pageNum, 20);
      if (isApiSuccess(res)) {
        const data = res.data;
        if (pageNum === 0) {
          setPosts(data.content || []);
        } else {
          setPosts(prev => [...prev, ...(data.content || [])]);
        }
        setHasMore(!data.last);
      }
    } catch (e) {
      console.error('Failed to load posts', e);
    }
    setPostsLoading(false);
  }, [slug]);

  useEffect(() => {
    loadCommunity();
    loadPosts(0);
  }, [loadCommunity, loadPosts]);

  const handleJoinLeave = async () => {
    if (!user?.id) return;
    setJoining(true);
    try {
      const res = isMember
        ? await CommunityAPI.leaveCommunity(slug, user.id)
        : await CommunityAPI.joinCommunity(slug, user.id);

      if (isApiSuccess(res)) {
        setIsMember(!isMember);
        if (communityDetail) {
          setCommunityDetail({
            ...communityDetail,
            isMember: !isMember,
            community: {
              ...communityDetail.community,
              memberCount: isMember
                ? communityDetail.community.memberCount - 1
                : communityDetail.community.memberCount + 1,
            },
          });
        }
        setSnackbar({ open: true, message: isMember ? 'Left community' : 'Joined community!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: (res as any).message || 'Action failed', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Something went wrong', severity: 'error' });
    }
    setJoining(false);
  };

  const loadMorePosts = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  const getMediaUrl = (content: Content) => {
    if (content.processedFile?.cdnUrl) return content.processedFile.cdnUrl;
    if (content.originalFile?.cdnUrl) return content.originalFile.cdnUrl;
    if (content.thumbnailUrl) return content.thumbnailUrl;
    return null;
  };

  const community = communityDetail?.community;

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pl: { xs: 0, md: '280px' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#6B46C1' }} />
      </Box>
    );
  }

  if (!community) {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pl: { xs: 0, md: '280px' }, py: 4, px: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ color: '#374151', fontWeight: 700, mb: 2 }}>Community not found</Typography>
          <Button variant="contained" onClick={() => router.push('/communities')} sx={{ bgcolor: '#6B46C1', '&:hover': { bgcolor: '#553C9A' } }}>
            Back to Communities
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pl: { xs: 0, md: '280px' }, py: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Back button */}
        <IconButton onClick={() => router.push('/communities')} sx={{ mb: 2, color: '#374151' }}>
          <BackIcon />
        </IconButton>

        {/* Community Header */}
        <Card sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 3, mb: 3, overflow: 'visible' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 3 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 3,
                  bgcolor: '#F3F0FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  flexShrink: 0,
                }}
              >
                {community.iconEmoji}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#374151', mb: 0.5 }}>
                  {community.name}
                </Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.6, mb: 1.5 }}>
                  {community.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 18, color: '#6B46C1' }} />
                    <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.9rem' }}>
                      {community.memberCount}
                    </Typography>
                    <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>members</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PostIcon sx={{ fontSize: 18, color: '#6B46C1' }} />
                    <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.9rem' }}>
                      {community.postCount}
                    </Typography>
                    <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>posts</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {community.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        bgcolor: '#F3F0FF',
                        color: '#6B46C1',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            <Button
              fullWidth
              variant={isMember ? 'outlined' : 'contained'}
              disabled={joining}
              onClick={handleJoinLeave}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                py: 1.2,
                fontSize: '1rem',
                ...(isMember
                  ? {
                      borderColor: '#E5E7EB',
                      color: '#6B7280',
                      '&:hover': { borderColor: '#EF4444', color: '#EF4444', bgcolor: 'rgba(239,68,68,0.04)' },
                    }
                  : {
                      bgcolor: '#6B46C1',
                      '&:hover': { bgcolor: '#553C9A' },
                    }),
              }}
            >
              {joining ? <CircularProgress size={22} sx={{ color: isMember ? '#6B7280' : 'white' }} /> : isMember ? 'Leave Community' : 'Join Community'}
            </Button>
          </CardContent>
        </Card>

        {/* Posts */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#374151', mb: 2 }}>
          Recent Posts
        </Typography>

        {postsLoading && posts.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : posts.length === 0 ? (
          <Card sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 3, textAlign: 'center', py: 6 }}>
            <PostIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1.5 }} />
            <Typography sx={{ color: '#6B7280', fontSize: '1rem' }}>
              No posts yet in this community. Be the first to post!
            </Typography>
            <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', mt: 0.5 }}>
              Use tags like {community.tags.slice(0, 3).map(t => `#${t}`).join(', ')} in your posts
            </Typography>
          </Card>
        ) : (
          <>
            {posts.map((post) => {
              const mediaUrl = getMediaUrl(post);
              return (
                <Card
                  key={post.id}
                  sx={{
                    bgcolor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: 3,
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#6B46C1', boxShadow: '0 2px 12px rgba(107,70,193,0.08)' },
                  }}
                  onClick={() => router.push(`/feed?content=${post.id}`)}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Post header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Avatar
                        sx={{ width: 36, height: 36, bgcolor: '#6B46C1', fontSize: '0.9rem', fontWeight: 700 }}
                      >
                        {getHandleInitial(post.creatorHandle)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.9rem' }}>
                          {formatCreatorHandle(post.creatorHandle)}
                        </Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                          {formatTimeAgo(post.createdAt)}
                        </Typography>
                      </Box>
                      <Chip
                        label={post.type === 'SHORT_VIDEO' ? 'Video' : post.type === 'TEXT_POST' ? 'Text' : 'Meme'}
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#F8F9FA', color: '#6B7280' }}
                      />
                    </Box>

                    {/* Title / description */}
                    {post.title && (
                      <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '1rem', mb: 0.5 }}>
                        {post.title}
                      </Typography>
                    )}
                    {post.description && (
                      <Typography sx={{ color: '#6B7280', fontSize: '0.88rem', mb: 1.5, lineHeight: 1.5 }}>
                        {post.description.length > 200 ? post.description.slice(0, 200) + '...' : post.description}
                      </Typography>
                    )}

                    {/* Media preview */}
                    {mediaUrl && post.type !== 'TEXT_POST' && (
                      <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 1.5, maxHeight: 300 }}>
                        {post.type === 'SHORT_VIDEO' ? (
                          <video
                            src={mediaUrl}
                            style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
                            muted
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={post.title || 'Post'}
                            style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
                          />
                        )}
                      </Box>
                    )}

                    {/* Engagement stats */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, pt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <LikeIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#6B7280' }}>{post.likeCount}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <CommentIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#6B7280' }}>{post.commentCount}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <ViewIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#6B7280' }}>{post.viewCount}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}

            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <Button
                  variant="outlined"
                  onClick={loadMorePosts}
                  disabled={postsLoading}
                  sx={{
                    borderColor: '#E5E7EB',
                    color: '#6B46C1',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#6B46C1' },
                  }}
                >
                  {postsLoading ? <CircularProgress size={20} sx={{ color: '#6B46C1' }} /> : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function CommunityDetailPage() {
  return (
    <ProtectedRoute>
      <CommunityDetailContent />
    </ProtectedRoute>
  );
}
