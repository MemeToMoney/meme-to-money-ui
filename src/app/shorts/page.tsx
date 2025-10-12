'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Container,
  Box,
  Grid,
  Card,
  CardMedia,
  Typography,
  IconButton,
  Avatar,
  Button,
  Chip,
  Badge,
  Fab,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeOff as MuteIcon,
  VolumeUp as VolumeIcon,
  Favorite as LikeIcon,
  FavoriteBorder as UnlikeIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  Fullscreen as FullscreenIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface ShortVideo {
  id: string;
  userId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  hashtags: string[];
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
  };
}

const mockShorts: ShortVideo[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Funny Cat Compilation',
    description: 'Check out these hilarious cats! 😂 #cats #funny #viral',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '/api/placeholder/400/600',
    duration: 30,
    likes: 1234,
    comments: 89,
    shares: 45,
    views: 12500,
    isLiked: false,
    hashtags: ['cats', 'funny', 'viral'],
    createdAt: '2 hours ago',
    user: {
      id: 'user1',
      username: 'catman',
      displayName: 'Cat Lover',
      profilePicture: '/api/placeholder/50/50'
    }
  },
  {
    id: '2',
    userId: 'user2',
    title: 'Epic Dance Moves',
    description: 'New dance trend is here! 🕺 #dance #trending #moves',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: '/api/placeholder/400/600',
    duration: 25,
    likes: 2156,
    comments: 156,
    shares: 78,
    views: 25600,
    isLiked: true,
    hashtags: ['dance', 'trending', 'moves'],
    createdAt: '4 hours ago',
    user: {
      id: 'user2',
      username: 'dancequeen',
      displayName: 'Dance Queen',
      profilePicture: '/api/placeholder/50/50'
    }
  },
  {
    id: '3',
    userId: 'user3',
    title: 'Cooking Hack',
    description: 'This will change how you cook forever! 👨‍🍳 #cooking #hack #food',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '/api/placeholder/400/600',
    duration: 45,
    likes: 3456,
    comments: 234,
    shares: 123,
    views: 45000,
    isLiked: false,
    hashtags: ['cooking', 'hack', 'food'],
    createdAt: '6 hours ago',
    user: {
      id: 'user3',
      username: 'chefmaster',
      displayName: 'Chef Master',
      profilePicture: '/api/placeholder/50/50'
    }
  },
  {
    id: '4',
    userId: 'user4',
    title: 'Travel Vibes',
    description: 'Beautiful sunset at the beach 🌅 #travel #sunset #beach',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: '/api/placeholder/400/600',
    duration: 35,
    likes: 987,
    comments: 67,
    shares: 34,
    views: 8900,
    isLiked: true,
    hashtags: ['travel', 'sunset', 'beach'],
    createdAt: '8 hours ago',
    user: {
      id: 'user4',
      username: 'traveler',
      displayName: 'World Traveler',
      profilePicture: '/api/placeholder/50/50'
    }
  }
];

interface VideoPlayerProps {
  video: ShortVideo;
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

function VideoPlayer({
  video,
  isPlaying,
  isMuted,
  onPlayPause,
  onMuteToggle,
  onLike,
  onComment,
  onShare
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <Card sx={{
      position: 'relative',
      aspectRatio: '9/16',
      borderRadius: 3,
      overflow: 'hidden',
      cursor: 'pointer',
      '&:hover .video-overlay': {
        opacity: 1
      }
    }}>
      <video
        ref={videoRef}
        src={video.videoUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        loop
        playsInline
        onClick={onPlayPause}
      />

      {/* Play/Pause Overlay */}
      <Box
        className="video-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }}
        onClick={onPlayPause}
      >
        <IconButton
          sx={{
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
          }}
        >
          {isPlaying ? <PauseIcon sx={{ fontSize: 40 }} /> : <PlayIcon sx={{ fontSize: 40 }} />}
        </IconButton>
      </Box>

      {/* Video Controls */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <IconButton
          onClick={onMuteToggle}
          sx={{
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            width: 40,
            height: 40,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
          }}
        >
          {isMuted ? <MuteIcon /> : <VolumeIcon />}
        </IconButton>
        <IconButton
          sx={{
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            width: 40,
            height: 40,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
          }}
        >
          <FullscreenIcon />
        </IconButton>
      </Box>

      {/* Creator Info Overlay */}
      <Box sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 80,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar
            src={video.user.profilePicture}
            sx={{ width: 32, height: 32 }}
          >
            {video.user.displayName.charAt(0)}
          </Avatar>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            @{video.user.username}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{
              color: 'white',
              borderColor: 'white',
              textTransform: 'none',
              fontSize: '0.7rem',
              py: 0.5,
              px: 1,
              '&:hover': {
                borderColor: '#4FC3F7',
                color: '#4FC3F7'
              }
            }}
          >
            Follow
          </Button>
        </Box>

        <Typography variant="body2" sx={{
          mb: 1,
          fontSize: '0.85rem',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
          {video.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {video.hashtags.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              size="small"
              sx={{
                bgcolor: 'rgba(79, 195, 247, 0.8)',
                color: 'white',
                fontSize: '0.7rem',
                height: 20
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Engagement Actions */}
      <Box sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={onLike}
            sx={{
              color: video.isLiked ? '#ff4444' : 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            {video.isLiked ? <LikeIcon /> : <UnlikeIcon />}
          </IconButton>
          <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
            {video.likes}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={onComment}
            sx={{
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <CommentIcon />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
            {video.comments}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={onShare}
            sx={{
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <ShareIcon />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
            {video.shares}
          </Typography>
        </Box>
      </Box>

      {/* View Count */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        left: 16
      }}>
        <Chip
          label={`${video.views.toLocaleString()} views`}
          size="small"
          sx={{
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '0.7rem'
          }}
        />
      </Box>
    </Card>
  );
}

function ShortsPageContent() {
  const [shorts, setShorts] = useState<ShortVideo[]>(mockShorts);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const handlePlayPause = (videoId: string) => {
    setPlayingVideo(prev => prev === videoId ? null : videoId);
  };

  const handleMuteToggle = (videoId: string) => {
    setMutedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleLike = (videoId: string) => {
    setShorts(prev => prev.map(video =>
      video.id === videoId
        ? {
            ...video,
            isLiked: !video.isLiked,
            likes: video.isLiked ? video.likes - 1 : video.likes + 1
          }
        : video
    ));
  };

  const handleComment = (videoId: string) => {
    console.log('Comment on video:', videoId);
  };

  const handleShare = (videoId: string) => {
    console.log('Share video:', videoId);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      py: 3
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Shorts
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Discover trending short videos
            </Typography>
          </Box>
          <Fab
            color="primary"
            sx={{
              bgcolor: '#4FC3F7',
              '&:hover': { bgcolor: '#29B6F6' }
            }}
            onClick={() => console.log('Create new short')}
          >
            <AddIcon />
          </Fab>
        </Box>

        {/* Category Filters */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['All', 'Funny', 'Dance', 'Cooking', 'Travel', 'Music', 'Comedy', 'Trending'].map((category) => (
              <Chip
                key={category}
                label={category}
                variant={category === 'All' ? 'filled' : 'outlined'}
                color={category === 'All' ? 'primary' : 'default'}
                clickable
                sx={{
                  borderRadius: 20,
                  fontWeight: category === 'All' ? 'bold' : 'normal'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Shorts Grid */}
        <Grid container spacing={3}>
          {shorts.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
              <VideoPlayer
                video={video}
                isPlaying={playingVideo === video.id}
                isMuted={mutedVideos.has(video.id)}
                onPlayPause={() => handlePlayPause(video.id)}
                onMuteToggle={() => handleMuteToggle(video.id)}
                onLike={() => handleLike(video.id)}
                onComment={() => handleComment(video.id)}
                onShare={() => handleShare(video.id)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Load More */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 20,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Load More Shorts
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default function ShortsPage() {
  return (
    <ProtectedRoute>
      <ShortsPageContent />
    </ProtectedRoute>
  );
}