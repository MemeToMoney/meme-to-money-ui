'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Button,
  Grid,
  Skeleton,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Tag as TagIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  ThumbUp as LikeIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI, Content } from '@/lib/api/content';
import { isApiSuccess, formatCreatorHandle, getHandleInitial } from '@/lib/api/client';

function HashtagPageContent() {
  const params = useParams();
  const tag = typeof params.tag === 'string' ? decodeURIComponent(params.tag) : '';
  const router = useRouter();
  const { user } = useAuth();

  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (tag) {
      loadHashtagContent(0);
    }
  }, [tag]);

  const loadHashtagContent = async (pageNum: number) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await ContentAPI.getContentByHashtag(tag, pageNum, 21, 365, user?.id);

      if (isApiSuccess(response)) {
        const data = response.data;
        // Handle ContentFeedResponse format from ExploreController
        const items = data?.content?.content || data?.content || [];
        const total = data?.content?.totalElements ?? data?.totalElements ?? 0;
        const isLast = data?.content?.last ?? data?.last ?? true;

        if (pageNum === 0) {
          setContent(items);
        } else {
          setContent(prev => [...prev, ...items]);
        }
        setPage(pageNum);
        setHasMore(!isLast);
        setTotalElements(total);
      }
    } catch (err) {
      console.error('Failed to load hashtag content:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    loadHashtagContent(page + 1);
  };

  const getContentUrl = (item: Content) => {
    return item.thumbnailUrl || item.processedFile?.cdnUrl || item.originalFile?.cdnUrl;
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'white',
          zIndex: 1,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        {/* Top bar with back button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 1,
          }}
        >
          <IconButton onClick={() => router.back()} size="small">
            <BackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827' }}>
            Hashtag
          </Typography>
        </Box>

        {/* Hashtag info section */}
        <Box
          sx={{
            px: 3,
            pb: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Hashtag icon circle */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TagIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1.2,
              }}
              noWrap
            >
              #{tag}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6B7280', mt: 0.5 }}
            >
              {loading ? (
                <Skeleton width={100} />
              ) : (
                `${formatCount(totalElements)} post${totalElements !== 1 ? 's' : ''}`
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content Grid */}
      <Container maxWidth={false} sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 0.5 }}>
            <Grid container spacing={0.5}>
              {[...Array(12)].map((_, i) => (
                <Grid item xs={4} key={i}>
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      width: '100%',
                      paddingTop: '100%',
                      borderRadius: 0.5,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : content.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 10, px: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(107, 70, 193, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <TagIcon sx={{ fontSize: 40, color: '#6B46C1' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
              No posts yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Be the first to post with #{tag}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/upload')}
              sx={{
                mt: 3,
                bgcolor: '#6B46C1',
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                '&:hover': { bgcolor: '#553C9A' },
              }}
            >
              Create Post
            </Button>
          </Box>
        ) : (
          <Box sx={{ p: 0.5 }}>
            <Grid container spacing={0.5}>
              {content.map((item) => (
                <Grid item xs={4} key={item.id}>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '100%',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      borderRadius: 0.5,
                      '&:hover': {
                        opacity: 0.85,
                        transition: 'opacity 0.2s',
                      },
                    }}
                    onClick={() => router.push(`/profile/${item.creatorId}`)}
                  >
                    <Box
                      component="img"
                      src={getContentUrl(item)}
                      alt={item.title || 'Content'}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e: any) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUNBM0FGIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    {/* Video play icon */}
                    {item.type === 'SHORT_VIDEO' && (
                      <PlayIcon
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontSize: 22,
                          color: 'white',
                          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
                        }}
                      />
                    )}
                    {/* Overlay stats */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                        p: 0.75,
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <LikeIcon sx={{ fontSize: 12, color: 'white' }} />
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem' }}>
                          {formatCount(item.likeCount)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <ViewIcon sx={{ fontSize: 12, color: 'white' }} />
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem' }}>
                          {formatCount(item.viewCount)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Load more */}
            {hasMore && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  sx={{
                    textTransform: 'none',
                    color: '#6B46C1',
                    fontWeight: 600,
                  }}
                >
                  {loadingMore ? <CircularProgress size={20} sx={{ color: '#6B46C1' }} /> : 'Load more'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default function HashtagPage() {
  return (
    <ProtectedRoute>
      <HashtagPageContent />
    </ProtectedRoute>
  );
}
