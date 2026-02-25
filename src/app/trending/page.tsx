'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Whatshot as TrendingIcon,
  Visibility as ViewIcon,
  ThumbUp as LikeIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI, Content } from '@/lib/api/content';
import { isApiSuccess, formatCreatorHandle, getHandleInitial } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

function TrendingPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(24);

  useEffect(() => {
    loadTrending();
  }, [user?.id, timeRange]);

  const loadTrending = async () => {
    setLoading(true);
    try {
      const response = await ContentAPI.getTrendingFeed(0, 20, timeRange, user?.id);
      if (isApiSuccess(response)) {
        setTrendingContent(response.data.content?.content || []);
      }
    } catch (err) {
      console.error('Failed to load trending:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContentUrl = (content: Content) => {
    return content.thumbnailUrl || content.processedFile?.cdnUrl || content.originalFile?.cdnUrl;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      <Box sx={{
        position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1,
        p: 2, borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6B46C1', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingIcon /> Trending
        </Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(_, val) => val && setTimeRange(val)}
          size="small"
        >
          <ToggleButton value={6} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>6h</ToggleButton>
          <ToggleButton value={24} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>24h</ToggleButton>
          <ToggleButton value={168} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>7d</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : trendingContent.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <TrendingIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 600 }}>No trending content yet</Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Check back later for viral memes!</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {trendingContent.map((content, index) => (
              <Grid item xs={6} sm={4} md={3} key={content.id}>
                <Card sx={{
                  borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
                  position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
                }}
                  onClick={() => router.push(`/profile/${content.creatorId}`)}
                >
                  {index < 3 && (
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      sx={{
                        position: 'absolute', top: 8, left: 8, zIndex: 1,
                        bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                        color: index === 0 ? '#000' : '#fff', fontWeight: 700,
                      }}
                    />
                  )}
                  <Box sx={{ position: 'relative', aspectRatio: '1' }}>
                    <CardMedia
                      component="img"
                      image={getContentUrl(content)}
                      alt={content.title}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {content.type === 'SHORT_VIDEO' && (
                      <PlayIcon sx={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        fontSize: 40, color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                      }} />
                    )}
                    <Box sx={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', p: 1.5,
                    }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ViewIcon sx={{ fontSize: 14, color: 'white' }} />
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                            {content.viewCount >= 1000 ? `${(content.viewCount / 1000).toFixed(1)}k` : content.viewCount}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LikeIcon sx={{ fontSize: 14, color: 'white' }} />
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                            {content.likeCount >= 1000 ? `${(content.likeCount / 1000).toFixed(1)}k` : content.likeCount}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {content.title || 'Untitled'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Avatar sx={{ width: 18, height: 18, fontSize: '0.6rem', bgcolor: '#6B46C1' }}>
                        {getHandleInitial(content.creatorHandle)}
                      </Avatar>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {formatCreatorHandle(content.creatorHandle)}
                      </Typography>
                    </Box>
                    {content.hashtags && content.hashtags.length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#6B46C1', fontSize: '0.65rem' }}>
                          {content.hashtags.slice(0, 2).map((t: string) => `#${t}`).join(' ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default function TrendingPage() {
  return (
    <ProtectedRoute>
      <TrendingPageContent />
    </ProtectedRoute>
  );
}
