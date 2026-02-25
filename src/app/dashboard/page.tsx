'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Avatar,
  CardMedia,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewsIcon,
  AttachMoney as MoneyIcon,
  ThumbUp as LikesIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI, Content } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [userContent, setUserContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadContent();
  }, [user?.id]);

  const loadContent = async () => {
    try {
      const response = await ContentAPI.getUserContent(user!.id, 0, 50, user!.id);
      if (isApiSuccess(response)) {
        setUserContent(response.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate stats from real content
  const totalViews = userContent.reduce((sum, c) => sum + (c.viewCount || 0), 0);
  const totalLikes = userContent.reduce((sum, c) => sum + (c.likeCount || 0), 0);
  const totalShares = userContent.reduce((sum, c) => sum + (c.shareCount || 0), 0);
  const totalComments = userContent.reduce((sum, c) => sum + (c.commentCount || 0), 0);
  const avgEngagement = userContent.length > 0
    ? ((totalLikes + totalComments + totalShares) / Math.max(totalViews, 1) * 100).toFixed(1)
    : '0';

  // Sort by views for top performing
  const topContent = [...userContent].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);

  const getContentUrl = (content: Content) => {
    return content.thumbnailUrl || content.processedFile?.cdnUrl || content.originalFile?.cdnUrl;
  };

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      <Box sx={{
        position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1,
        p: 2, borderBottom: '1px solid #E5E7EB',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6B46C1', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon /> Creator Dashboard
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : (
          <>
            {/* Key Metrics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: 'Total Views', value: formatNumber(totalViews), icon: <ViewsIcon />, color: '#6B46C1' },
                { label: 'Total Likes', value: formatNumber(totalLikes), icon: <LikesIcon />, color: '#EF4444' },
                { label: 'Total Shares', value: formatNumber(totalShares), icon: <ShareIcon />, color: '#3B82F6' },
                { label: 'Comments', value: formatNumber(totalComments), icon: <CommentIcon />, color: '#10B981' },
              ].map((metric) => (
                <Grid item xs={6} md={3} key={metric.label}>
                  <Card sx={{
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'default',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: metric.color }}>
                            {metric.value}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>
                            {metric.label}
                          </Typography>
                        </Box>
                        <Box sx={{ color: metric.color, opacity: 0.2 }}>{React.cloneElement(metric.icon, { sx: { fontSize: 40 } })}</Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Engagement & Earnings Row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' } }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#F59E0B' }}>{avgEngagement}%</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Engagement Rate</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' } }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#10B981' }}>{userContent.length}</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Total Posts</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' } }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#6B46C1' }}>{user.followerCount || 0}</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Followers</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' } }} onClick={() => router.push('/wallet')}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669' }}>{user.coinBalance || 0}</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Coins</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Top Performing Content */}
            <Paper sx={{ borderRadius: 3, p: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Top Performing Content</Typography>
              {topContent.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>No content yet. Start creating!</Typography>
                  <Button onClick={() => router.push('/upload')} variant="contained" sx={{ mt: 2, bgcolor: '#6B46C1', textTransform: 'none', '&:hover': { bgcolor: '#553C9A' } }}>
                    Create Post
                  </Button>
                </Box>
              ) : (
                topContent.map((content, i) => (
                  <Box key={content.id} sx={{
                    display: 'flex', alignItems: 'center', gap: 2, py: 1.5,
                    borderBottom: i < topContent.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#6B7280', width: 20 }}>{i + 1}</Typography>
                    <Avatar src={getContentUrl(content)} variant="rounded" sx={{ width: 48, height: 48, bgcolor: '#f0f0f0' }}>
                      {content.type === 'SHORT_VIDEO' ? '🎥' : '🖼️'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {content.title || 'Untitled'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>{formatNumber(content.viewCount)} views</Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>{formatNumber(content.likeCount)} likes</Typography>
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Paper>

            {/* Quick Actions */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button fullWidth variant="contained" onClick={() => router.push('/upload')} sx={{ bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 2, fontWeight: 600, py: 1.5, transition: 'all 0.2s ease', '&:hover': { bgcolor: '#553C9A', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(107, 70, 193, 0.3)' } }}>
                  Upload Content
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth variant="outlined" onClick={() => router.push('/profile/edit')} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, py: 1.5, borderColor: '#6B46C1', color: '#6B46C1', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'rgba(107, 70, 193, 0.04)', transform: 'translateY(-1px)' } }}>
                  Edit Profile
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
