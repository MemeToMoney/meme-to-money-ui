'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  useTheme,
  Paper,
  Tabs,
  Tab,
  Grid,
  CardMedia,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person,
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  BookmarkBorder,
  MoreVert,
  PlayArrow,
  VolumeOff,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI, Content, UIFeedResponse, UserEngagementStatus } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';

// Category data matching your design
const categories = [
  { name: 'All', emoji: '🎯', active: true },
  { name: 'Memes', emoji: '😂', active: false },
  { name: 'Comedy', emoji: '🤣', active: false },
  { name: 'Viral', emoji: '🔥', active: false },
  { name: 'Dance', emoji: '💃', active: false },
  { name: 'Food', emoji: '🍔', active: false },
  { name: 'Pets', emoji: '🐕', active: false },
  { name: 'Gaming', emoji: '🎮', active: false },
];



function FeedPageContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedData, setFeedData] = useState<Content[]>([]);
  const [engagements, setEngagements] = useState<{ [contentId: string]: UserEngagementStatus }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();

  // Load feed data on component mount and tab changes
  useEffect(() => {
    loadFeedData(true);
  }, [activeTab]);

  const loadFeedData = async (resetFeed = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = resetFeed ? 0 : page;
      let response;

      // Choose API endpoint based on active tab
      switch (activeTab) {
        case 0: // For You
          response = await ContentAPI.getHomeFeed(currentPage, 10, user?.id);
          break;
        case 1: // Trending
          response = await ContentAPI.getTrendingFeed(currentPage, 10, 24, user?.id);
          break;
        case 2: // Fresh
          response = await ContentAPI.getFreshFeed(currentPage, 10, 6, user?.id);
          break;
        default:
          response = await ContentAPI.getHomeFeed(currentPage, 10, user?.id);
      }

      if (isApiSuccess(response)) {
        const newContent = response.data.content.content;
        const newEngagements = response.data.userEngagements;

        if (resetFeed) {
          setFeedData(newContent);
          setPage(1);
        } else {
          setFeedData(prev => [...prev, ...newContent]);
          setPage(prev => prev + 1);
        }

        setEngagements(prev => ({ ...prev, ...newEngagements }));
        setHasMore(!response.data.content.last);
      } else {
        setError((response as any).message || 'Failed to load feed');
      }
    } catch (err: any) {
      console.error('Feed loading error:', err);
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
    setFeedData([]);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    // TODO: Implement category filtering when API supports it
  };

  const handleLike = async (contentId: string) => {
    if (!user?.id) return;

    try {
      const isCurrentlyLiked = engagements[contentId]?.liked || false;
      const action = isCurrentlyLiked ? 'UNLIKE' : 'LIKE';

      // Optimistically update UI
      setEngagements(prev => ({
        ...prev,
        [contentId]: {
          ...prev[contentId],
          liked: !isCurrentlyLiked,
          contentId,
          userId: user.id
        }
      }));

      setFeedData(prev => prev.map(post =>
        post.id === contentId
          ? { ...post, likeCount: post.likeCount + (isCurrentlyLiked ? -1 : 1) }
          : post
      ));

      // Make API call
      const response = await ContentAPI.recordEngagement(
        contentId,
        { action },
        user.id,
        user.username
      );

      if (!isApiSuccess(response)) {
        // Revert on failure
        setEngagements(prev => ({
          ...prev,
          [contentId]: {
            ...prev[contentId],
            liked: isCurrentlyLiked
          }
        }));

        setFeedData(prev => prev.map(post =>
          post.id === contentId
            ? { ...post, likeCount: post.likeCount + (isCurrentlyLiked ? 1 : -1) }
            : post
        ));
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleShare = async (contentId: string) => {
    if (!user?.id) return;

    try {
      await ContentAPI.recordEngagement(
        contentId,
        { action: 'SHARE' },
        user.id,
        user.username
      );

      // Update share count
      setFeedData(prev => prev.map(post =>
        post.id === contentId
          ? { ...post, shareCount: post.shareCount + 1 }
          : post
      ));

      // TODO: Implement actual sharing functionality
      console.log('Share post:', contentId);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSave = (contentId: string) => {
    // TODO: Implement bookmark functionality when API supports it
    console.log('Save post:', contentId);
  };

  const handleComment = (contentId: string) => {
    // TODO: Open comment modal or navigate to post detail
    console.log('Comment on post:', contentId);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  const getContentUrl = (content: Content) => {
    return content.processedFile?.cdnUrl || content.originalFile?.cdnUrl || content.thumbnailUrl;
  };

  const getContentAlt = (content: Content) => {
    return content.title || content.description || 'Content';
  };

  return (
    <Box sx={{
      bgcolor: '#f8f9fa',
      minHeight: '100vh',
      pb: 10
    }}>
      <Container maxWidth="sm" sx={{ p: 0 }}>
        {/* Header (Mobile & Desktop) */}
        <Box sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'white',
          zIndex: 1,
          p: 2,
          borderBottom: '1px solid #E5E7EB',
          mb: 2
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'cursive',
                fontWeight: 'bold',
                color: '#6B46C1',
                background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer'
              }}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              MemeToMoney
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => router.push('/search')}
                sx={{ color: '#6B7280' }}
              >
                <SearchIcon />
              </IconButton>
              <IconButton
                onClick={() => router.push('/messages')}
                sx={{
                  color: '#6B7280',
                  position: 'relative'
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  bgcolor: '#EF4444',
                  borderRadius: '50%',
                  border: '1px solid white',
                  display: 'none' // Show this if there are unread messages
                }} />
                <ChatBubbleOutline />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Category Filter */}
        <Box sx={{ mb: 3, px: 2 }}>
          <Box sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none'
          }}>
            {categories.map((category) => (
              <Box
                key={category.name}
                onClick={() => handleCategorySelect(category.name)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  minWidth: 'fit-content',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    mb: 1,
                    bgcolor: selectedCategory === category.name ? '#6B46C1' : '#f5f5f5',
                    border: selectedCategory === category.name ? '2px solid #6B46C1' : '2px solid #e0e0e0',
                    transition: 'all 0.2s',
                  }}
                >
                  {category.emoji}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 12,
                    fontWeight: selectedCategory === category.name ? 'bold' : 'normal',
                    color: selectedCategory === category.name ? '#6B46C1' : '#666',
                  }}
                >
                  {category.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>


        {/* Feed Tabs */}
        <Box sx={{ mb: 3, px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                color: '#6B7280',
                '&.Mui-selected': {
                  color: '#6B46C1',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#6B46C1',
              },
            }}
          >
            <Tab label="For You" />
            <Tab label="Trending" />
            <Tab label="Fresh" />
          </Tabs>
        </Box>

        {/* Loading State */}
        {loading && feedData.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box sx={{ px: 2, mb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
              <Button
                onClick={() => loadFeedData(true)}
                sx={{ ml: 2, color: 'inherit' }}
              >
                Retry
              </Button>
            </Alert>
          </Box>
        )}

        {/* Instagram-style Feed Posts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 1 }}>
          {feedData.map((post) => {
            const engagement = engagements[post.id];
            const isLiked = engagement?.liked || false;
            const contentUrl = getContentUrl(post);

            return (
              <Card key={post.id} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {/* Post Header */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#6B46C1' }}>
                      {post.creatorHandle ? post.creatorHandle.charAt(1)?.toUpperCase() : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {post.creatorHandle || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {formatTimeAgo(post.publishedAt || post.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </Box>

                {/* Post Content */}
                {contentUrl && (
                  <Box sx={{ position: 'relative' }}>
                    {post.type === 'SHORT_VIDEO' ? (
                      <Box
                        component="video"
                        src={contentUrl}
                        poster={post.thumbnailUrl}
                        controls
                        sx={{
                          width: '100%',
                          maxHeight: 500, // Increased max height for better visibility
                          objectFit: 'contain', // Changed to contain to prevent cropping
                          backgroundColor: '#000'
                        }}
                        onPlay={() => {
                          if (user?.id) {
                            ContentAPI.recordView(post.id, user.id);
                          }
                        }}
                      />
                    ) : (
                      <CardMedia
                        component="img"
                        image={contentUrl}
                        alt={getContentAlt(post)}
                        sx={{
                          width: '100%',
                          maxHeight: 500, // Increased max height
                          objectFit: 'contain', // Changed to contain
                          bgcolor: '#f0f0f0',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (user?.id) {
                            ContentAPI.recordView(post.id, user.id);
                          }
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* Post Actions */}
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <IconButton onClick={() => handleLike(post.id)} sx={{ p: 0 }}>
                        {isLiked ? (
                          <Favorite sx={{ color: '#E91E63' }} />
                        ) : (
                          <FavoriteBorder />
                        )}
                      </IconButton>
                      <IconButton onClick={() => handleComment(post.id)} sx={{ p: 0 }}>
                        <ChatBubbleOutline />
                      </IconButton>
                      <IconButton onClick={() => handleShare(post.id)} sx={{ p: 0 }}>
                        <Share />
                      </IconButton>
                    </Box>
                    <IconButton onClick={() => handleSave(post.id)} sx={{ p: 0 }}>
                      <BookmarkBorder />
                    </IconButton>
                  </Box>

                  {/* Like Count */}
                  {post.likeCount > 0 && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {post.likeCount.toLocaleString()} likes
                    </Typography>
                  )}

                  {/* Caption */}
                  {(post.title || post.description) && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <span style={{ fontWeight: 'bold' }}>{post.creatorHandle}</span>{' '}
                      {post.title || post.description}
                    </Typography>
                  )}

                  {/* View Comments */}
                  {post.commentCount > 0 && (
                    <Typography
                      variant="body2"
                      sx={{ color: '#666', cursor: 'pointer', mb: 1 }}
                      onClick={() => handleComment(post.id)}
                    >
                      View all {post.commentCount} comments
                    </Typography>
                  )}

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <Typography variant="body2" sx={{ color: '#6B46C1' }}>
                      {post.hashtags.map(tag => `#${tag}`).join(' ')}
                    </Typography>
                  )}

                  {/* Views and Shares */}
                  {(post.viewCount > 0 || post.shareCount > 0) && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid #f0f0f0' }}>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {post.viewCount.toLocaleString()} views
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {post.shareCount.toLocaleString()} shares
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>

        {/* Load More Button */}
        {hasMore && !loading && feedData.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, px: 2 }}>
            <Button
              variant="outlined"
              onClick={() => loadFeedData(false)}
              sx={{
                borderColor: '#6B46C1',
                color: '#6B46C1',
                '&:hover': {
                  borderColor: '#553C9A',
                  bgcolor: 'rgba(107, 70, 193, 0.04)'
                }
              }}
            >
              Load More
            </Button>
          </Box>
        )}

        {/* Empty State */}
        {!loading && feedData.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No content found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to share something amazing!
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/upload')}
              sx={{
                mt: 2,
                bgcolor: '#6B46C1',
                '&:hover': { bgcolor: '#553C9A' }
              }}
            >
              Create Content
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedPageContent />
    </ProtectedRoute>
  );
}