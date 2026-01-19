'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  Chip
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
  PersonAdd as FollowIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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
    <Box sx={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      bgcolor: 'black',
      overflow: 'hidden'
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

      {/* Play/Pause Center Icon */}
      {!isPlaying && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}
        >
          <IconButton
            onClick={onPlayPause}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              width: 80,
              height: 80,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <PlayIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>
      )}

      {/* Top Controls */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 3
      }}>
        <IconButton
          onClick={onMuteToggle}
          sx={{
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            mb: 1
          }}
        >
          {isMuted ? <MuteIcon /> : <VolumeIcon />}
        </IconButton>
      </Box>

      {/* Creator Info */}
      <Box sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 80,
        color: 'white',
        zIndex: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            src={video.user.profilePicture}
            sx={{ width: 40, height: 40, border: '2px solid white' }}
          >
            {video.user.displayName.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              @{video.user.username}
            </Typography>
            <Typography variant="caption" sx={{
              color: 'rgba(255,255,255,0.8)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              {video.createdAt}
            </Typography>
          </Box>
          <Button
            startIcon={<FollowIcon />}
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#6B46C1',
              color: 'white',
              textTransform: 'none',
              borderRadius: 20,
              px: 2,
              py: 0.5,
              '&:hover': {
                bgcolor: '#553C9A'
              }
            }}
          >
            Follow
          </Button>
        </Box>

        <Typography variant="body1" sx={{
          mb: 1.5,
          lineHeight: 1.4,
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
                bgcolor: 'rgba(107, 70, 193, 0.8)',
                color: 'white',
                fontSize: '0.75rem',
                height: 24,
                borderRadius: 12,
                backdropFilter: 'blur(10px)'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Right Side Actions */}
      <Box sx={{
        position: 'absolute',
        bottom: 100,
        right: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        alignItems: 'center',
        zIndex: 3
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={onLike}
            sx={{
              color: video.isLiked ? '#ff4444' : 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
                transform: 'scale(1.1)'
              }
            }}
          >
            {video.isLiked ? <LikeIcon sx={{ fontSize: 28 }} /> : <UnlikeIcon sx={{ fontSize: 28 }} />}
          </IconButton>
          <Typography variant="caption" sx={{
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            mt: 0.5,
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            {video.likes > 999 ? `${(video.likes / 1000).toFixed(1)}K` : video.likes}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={onComment}
            sx={{
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <CommentIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <Typography variant="caption" sx={{
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            mt: 0.5,
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            {video.comments}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={onShare}
            sx={{
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <ShareIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <Typography variant="caption" sx={{
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            mt: 0.5,
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            {video.shares}
          </Typography>
        </Box>
      </Box>

      {/* View Count Badge */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 3
      }}>
        <Chip
          label={`${video.views.toLocaleString()} views`}
          size="small"
          sx={{
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '0.75rem',
            backdropFilter: 'blur(10px)'
          }}
        />
      </Box>
    </Box>
  );
}

function ShortsPageContent() {
  const [shorts, setShorts] = useState<ShortVideo[]>(mockShorts);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(mockShorts[0]?.id || null);
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
    // TODO: Implement comment modal
  };

  const handleShare = (videoId: string) => {
    // TODO: Implement share functionality
  };

  // Auto-play current video
  useEffect(() => {
    if (shorts[currentVideoIndex]) {
      setPlayingVideo(shorts[currentVideoIndex].id);
    }
  }, [currentVideoIndex, shorts]);

  // Handle scroll to detect current video
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      const viewportHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / viewportHeight);
      if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < shorts.length) {
        setCurrentVideoIndex(newIndex);
      }
    }
  };

  return (
    <Container maxWidth={false} sx={{ p: 0, height: '100vh', overflow: 'hidden' }}>
      {/* Vertical scroll container */}
      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          height: '100vh',
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none'
        }}
      >
        {shorts.map((video, index) => (
          <Box
            key={video.id}
            sx={{
              height: '100vh',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always'
            }}
          >
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
          </Box>
        ))}
      </Box>

      {/* Page Indicator */}
      <Box sx={{
        position: 'fixed',
        right: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 10
      }}>
        {shorts.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 4,
              height: currentVideoIndex === index ? 20 : 8,
              bgcolor: currentVideoIndex === index ? 'white' : 'rgba(255,255,255,0.5)',
              borderRadius: 2,
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </Box>

      {/* Header - Shorts title */}
      <Box sx={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}>
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            bgcolor: 'rgba(0,0,0,0.3)',
            px: 2,
            py: 0.5,
            borderRadius: 20
          }}
        >
          Shorts
        </Typography>
      </Box>
    </Container>
  );
}

export default function ShortsPage() {
  return (
    <ProtectedRoute>
      <ShortsPageContent />
    </ProtectedRoute>
  );
}