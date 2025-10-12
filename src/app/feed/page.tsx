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
import { ContentAPI } from '@/lib/api/content';
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

// Mock data for shorts (will be replaced with API)
const shortsData = [
  {
    id: 1,
    username: '@cat_lover_99',
    title: 'Funny Cat Compilation',
    hashtags: '#cats #funny #viral',
    likes: '1.3K',
    comments: '234',
    shares: '67',
    thumbnail: 'https://picsum.photos/300/400?random=1',
  },
  {
    id: 2,
    username: '@dance_king_24',
    title: 'Epic Dance Move',
    hashtags: '#dance #trending #viral',
    likes: '3.4K',
    comments: '234',
    shares: '67',
    thumbnail: 'https://picsum.photos/300/400?random=2',
  },
  {
    id: 3,
    username: '@food_hacker',
    title: 'Food Hack You Need',
    hashtags: '#food #lifehack #cooking',
    likes: '890',
    comments: '67',
    shares: '234',
    thumbnail: 'https://picsum.photos/300/400?random=3',
  },
];

// Mock data for feed posts (will be replaced with API)
const feedPosts = [
  {
    id: 1,
    username: '@handle_1',
    timeAgo: 'now',
    caption: 'When your code finally runs 💻 #1',
    hashtags: '#foodie #yum #stressed',
    image: 'https://picsum.photos/500/400?random=10',
    likes: 1500,
    isLiked: false,
    views: 979,
    shares: 178,
    comments: 338,
  },
  {
    id: 2,
    username: '@handle_2',
    timeAgo: 'now',
    caption: 'Beautiful mountain view 🏔️',
    hashtags: '#nature #mountains #photography',
    image: 'https://picsum.photos/500/400?random=11',
    likes: 2300,
    isLiked: true,
    views: 1200,
    shares: 245,
    comments: 456,
  },
];

function FeedPageContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    // TODO: Call API to filter content by category
  };

  const handleLike = (postId: number) => {
    // TODO: Call API to like/unlike post
    console.log('Like post:', postId);
  };

  const handleShare = (postId: number) => {
    // TODO: Call API to share post
    console.log('Share post:', postId);
  };

  const handleSave = (postId: number) => {
    // TODO: Call API to save post
    console.log('Save post:', postId);
  };

  const handleComment = (postId: number) => {
    // TODO: Open comment modal or navigate to post detail
    console.log('Comment on post:', postId);
  };

  return (
    <Box sx={{
      bgcolor: '#f8f9fa',
      minHeight: '100vh',
      pt: 2,
      pb: 4
    }}>
      <Container maxWidth="md" sx={{ px: 3 }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'cursive',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            MemeToMoney
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={activeTab === 0 ? 'contained' : 'text'}
              onClick={() => setActiveTab(0)}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Feed
            </Button>
            <Button
              variant={activeTab === 1 ? 'contained' : 'text'}
              onClick={() => setActiveTab(1)}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Shorts
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Search..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'grey.500', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                },
              }}
            />
            <IconButton onClick={() => router.push('/profile')}>
              <Person />
            </IconButton>
          </Box>
        </Box>

        {/* Category Filter */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { display: 'none' }
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
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    mb: 1,
                    bgcolor: selectedCategory === category.name ? '#2196F3' : '#f5f5f5',
                    border: selectedCategory === category.name ? '2px solid #2196F3' : '2px solid #e0e0e0',
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
                    color: selectedCategory === category.name ? '#2196F3' : '#666',
                  }}
                >
                  {category.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Shorts Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              📱 Shorts
            </Typography>
            <Button
              variant="text"
              sx={{ color: '#2196F3', textTransform: 'none', fontWeight: 'bold' }}
              onClick={() => setActiveTab(1)}
            >
              View All
            </Button>
          </Box>

          <Grid container spacing={2}>
            {shortsData.map((short) => (
              <Grid item xs={4} key={short.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    aspectRatio: '9/16',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.02)' },
                    transition: 'transform 0.2s'
                  }}
                >
                  <CardMedia
                    component="img"
                    image={short.thumbnail}
                    alt={short.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  {/* Overlay Controls */}
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1
                  }}>
                    <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}>
                      <VolumeOff fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Bottom Info */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: 'white',
                    p: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Favorite fontSize="small" />
                        <Typography variant="caption">{short.likes}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChatBubbleOutline fontSize="small" />
                        <Typography variant="caption">{short.comments}</Typography>
                      </Box>
                      <Share fontSize="small" />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar sx={{ width: 20, height: 20 }}>
                        {short.username.charAt(1).toUpperCase()}
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {short.username}
                      </Typography>
                      <Button size="small" variant="outlined" sx={{
                        minWidth: 'auto',
                        px: 1,
                        py: 0,
                        fontSize: 10,
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}>
                        Follow
                      </Button>
                    </Box>

                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      {short.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#ccc' }}>
                      {short.hashtags}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Watch All Shorts Button */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#FF6B35',
                color: 'white',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#E55A2B' }
              }}
              onClick={() => setActiveTab(1)}
            >
              ▶ WATCH ALL SHORTS
            </Button>
          </Box>
        </Box>

        {/* Feed Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
              },
            }}
          >
            <Tab label="For You" />
            <Tab label="Trending" />
            <Tab label="Fresh" />
          </Tabs>
        </Box>

        {/* Instagram-style Feed Posts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {feedPosts.map((post) => (
            <Card key={post.id} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {/* Post Header */}
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196F3' }}>
                    {post.username.charAt(1).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {post.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {post.timeAgo}
                    </Typography>
                  </Box>
                </Box>
                <IconButton>
                  <MoreVert />
                </IconButton>
              </Box>

              {/* Post Image */}
              <CardMedia
                component="img"
                image={post.image}
                alt="Post content"
                sx={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
              />

              {/* Post Actions */}
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton onClick={() => handleLike(post.id)} sx={{ p: 0 }}>
                      {post.isLiked ? (
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
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {post.likes.toLocaleString()} likes
                </Typography>

                {/* Caption */}
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <span style={{ fontWeight: 'bold' }}>{post.username}</span>{' '}
                  {post.caption}
                </Typography>

                {/* View Comments */}
                <Typography
                  variant="body2"
                  sx={{ color: '#666', cursor: 'pointer', mb: 1 }}
                  onClick={() => handleComment(post.id)}
                >
                  View all {post.comments} comments
                </Typography>

                {/* Hashtags */}
                <Typography variant="body2" sx={{ color: '#2196F3' }}>
                  {post.hashtags}
                </Typography>

                {/* Views and Shares */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid #f0f0f0' }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {post.views} views
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {post.shares} shares
                  </Typography>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
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