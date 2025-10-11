'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Fab,
  Tooltip,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add,
  Home,
  Person,
  EmojiEvents,
  VideoLibrary,
  PlayCircleFilled,
  ArrowBack,
  MoreVert,
  Favorite,
  ChatBubbleOutline,
  Share,
  VolumeOff,
  VolumeUp,
  PlayArrow,
  Pause,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Content {
  id: string;
  title: string;
  description: string;
  type: string;
  creatorId: string;
  creatorHandle: string;
  thumbnailUrl: string;
  processedFile?: {
    s3Key: string;
    url: string;
    size: number;
    format: string;
  };
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  moderationStatus: string;
}

const contentCategories = [
  { name: 'All', icon: '🎯' },
  { name: 'Memes', icon: '😂' },
  { name: 'Comedy', icon: '🤣' },
  { name: 'Viral', icon: '🔥' },
  { name: 'Dance', icon: '💃' },
  { name: 'Food', icon: '🍔' },
  { name: 'Pets', icon: '🐕' },
  { name: 'Gaming', icon: '🎮' },
];

export default function FeedPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [shortsContent, setShortsContent] = useState<Content[]>([]);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'shorts'
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadShortsContent();
  }, []);

  const loadShortsContent = async () => {
    // Mock data for development
    const mockShorts: Content[] = [
      {
        id: 's1',
        title: 'Funny Cat Compilation',
        description: 'The funniest cat moments ever captured!',
        type: 'SHORT_VIDEO',
        creatorId: 'user1',
        creatorHandle: 'cat_lover_99',
        thumbnailUrl: 'https://picsum.photos/300/400?random=1',
        processedFile: {
          s3Key: 'shorts/video1.mp4',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          size: 1024000,
          format: 'mp4'
        },
        hashtags: ['cats', 'funny', 'viral'],
        likeCount: 1250,
        commentCount: 89,
        shareCount: 156,
        viewCount: 5430,
        createdAt: '2024-09-20T10:30:00Z',
        updatedAt: '2024-09-20T10:30:00Z',
        moderationStatus: 'APPROVED'
      },
      {
        id: 's2',
        title: 'Epic Dance Move',
        description: 'This dance move is taking over the internet!',
        type: 'SHORT_VIDEO',
        creatorId: 'user2',
        creatorHandle: 'dance_king_24',
        thumbnailUrl: 'https://picsum.photos/300/400?random=2',
        processedFile: {
          s3Key: 'shorts/video2.mp4',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          size: 2048000,
          format: 'mp4'
        },
        hashtags: ['dance', 'trending', 'viral'],
        likeCount: 3420,
        commentCount: 234,
        shareCount: 567,
        viewCount: 12890,
        createdAt: '2024-09-20T14:15:00Z',
        updatedAt: '2024-09-20T14:15:00Z',
        moderationStatus: 'APPROVED'
      },
      {
        id: 's3',
        title: 'Food Hack You Need',
        description: 'This cooking hack will change your life!',
        type: 'SHORT_VIDEO',
        creatorId: 'user3',
        creatorHandle: 'food_hacker',
        thumbnailUrl: 'https://picsum.photos/300/400?random=3',
        processedFile: {
          s3Key: 'shorts/video3.mp4',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          size: 1536000,
          format: 'mp4'
        },
        hashtags: ['food', 'lifehack', 'cooking'],
        likeCount: 890,
        commentCount: 67,
        shareCount: 234,
        viewCount: 3450,
        createdAt: '2024-09-20T16:45:00Z',
        updatedAt: '2024-09-20T16:45:00Z',
        moderationStatus: 'APPROVED'
      }
    ];
    setShortsContent(mockShorts);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsVideoMuted(videoRef.current.muted);
    }
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setBottomNavValue(newValue);
    switch (newValue) {
      case 0:
        setActiveTab('feed');
        break;
      case 1:
        setActiveTab('shorts');
        break;
      case 2:
        router.push('/profile');
        break;
      case 3:
        router.push('/contests');
        break;
      case 4:
        router.push('/upload');
        break;
    }
  };

  // Update bottom nav value based on active tab
  React.useEffect(() => {
    if (activeTab === 'feed') {
      setBottomNavValue(0);
    } else if (activeTab === 'shorts') {
      setBottomNavValue(1);
    }
  }, [activeTab]);

  return (
    <>
      {/* Mobile App Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          display: { xs: 'block', sm: 'none' },
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important', px: 2 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              flexGrow: 1,
              fontFamily: '"Billabong", cursive, sans-serif',
              fontSize: '1.8rem',
              color: theme.palette.text.primary
            }}
          >
            {activeTab === 'shorts' ? 'Shorts' : 'MemeToMoney'}
          </Typography>
          <IconButton
            onClick={() => router.push('/search')}
            sx={{ color: theme.palette.text.primary }}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            onClick={() => router.push('/profile')}
            sx={{ color: theme.palette.text.primary }}
          >
            <Person />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="md"
        disableGutters
        sx={{
          py: { xs: 0, sm: 1 },
          px: { xs: 0, sm: 1 },
          pb: { xs: 10, sm: 2 }, // Add bottom padding for mobile nav
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {/* Instagram-style Header with Search */}
        <Box sx={{ mb: 3, display: { xs: 'none', sm: 'block' } }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            px: 3,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(10px)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  fontFamily: '"Billabong", cursive, sans-serif',
                  fontSize: '2rem',
                  color: theme.palette.text.primary,
                  cursor: 'pointer',
                }}
                onClick={() => router.push('/feed')}
              >
                MemeToMoney
              </Typography>

              {/* Tab buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    cursor: 'pointer',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontWeight: activeTab === 'feed' ? 'bold' : 'normal',
                    color: activeTab === 'feed' ? theme.palette.primary.main : theme.palette.text.secondary,
                    bgcolor: activeTab === 'feed' ? theme.palette.primary.main + '20' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: activeTab === 'feed' ? theme.palette.primary.main + '30' : theme.palette.grey[100],
                    },
                  }}
                  onClick={() => setActiveTab('feed')}
                >
                  Feed
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    cursor: 'pointer',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontWeight: activeTab === 'shorts' ? 'bold' : 'normal',
                    color: activeTab === 'shorts' ? theme.palette.primary.main : theme.palette.text.secondary,
                    bgcolor: activeTab === 'shorts' ? theme.palette.primary.main + '20' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: activeTab === 'shorts' ? theme.palette.primary.main + '30' : theme.palette.grey[100],
                    },
                  }}
                  onClick={() => setActiveTab('shorts')}
                >
                  Shorts
                </Typography>
              </Box>
            </Box>

            {/* Desktop Search Bar */}
            <TextField
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'grey.500', fontSize: '20px' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 268,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : '#f5f5f5',
                  border: 'none',
                  fontSize: '14px',
                  height: '36px',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: `1px solid ${theme.palette.grey[400]}`,
                  },
                  '& input': {
                    color: theme.palette.text.primary,
                    padding: '8px 12px',
                  },
                  '& input::placeholder': {
                    color: theme.palette.grey[500],
                    opacity: 1,
                  },
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => router.push('/profile')}
                sx={{ color: theme.palette.text.primary }}
              >
                <Person />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Mobile Search */}
        <Box sx={{ mb: 2, display: { xs: 'block', sm: 'none' }, px: 2 }}>
          <TextField
            fullWidth
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'grey.500' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : '#f5f5f5',
                border: 'none',
                fontSize: '14px',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: `1px solid ${theme.palette.grey[400]}`,
                },
                '& input': {
                  color: theme.palette.text.primary,
                },
                '& input::placeholder': {
                  color: theme.palette.grey[500],
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Content based on active tab */}
        {activeTab === 'feed' ? (
          <>
            {/* Instagram-style Story Categories */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  pb: 1,
                  px: { xs: 2, sm: 1 },
                  '&::-webkit-scrollbar': { display: 'none' },
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                }}
              >
                {contentCategories.map((category) => (
                  <Box
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      minWidth: 'fit-content',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
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
                        mb: 0.5,
                        border: selectedCategory === category.name
                          ? `2px solid ${theme.palette.primary.main}`
                          : `2px solid ${theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300'}`,
                        bgcolor: selectedCategory === category.name
                          ? theme.palette.primary.main
                          : theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '12px',
                        fontWeight: selectedCategory === category.name ? 'bold' : 'normal',
                        color: selectedCategory === category.name
                          ? theme.palette.text.primary
                          : theme.palette.text.secondary,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {category.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Feed Content Placeholder */}
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                📱 Feed Content
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Your main feed content would appear here. Switch to Shorts tab to see the video player.
              </Typography>
            </Box>
          </>
        ) : (
          /* Full-screen Shorts View */
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'black',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Shorts Header */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1200,
              p: 2,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <IconButton
                onClick={() => setActiveTab('feed')}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  },
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Shorts
              </Typography>
              <IconButton sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <MoreVert />
              </IconButton>
            </Box>

            {/* Shorts Player */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'black'
            }}>
              {shortsContent.length > 0 ? (
                <Box sx={{
                  position: 'relative',
                  width: { xs: '100%', sm: '480px', md: '600px', lg: '720px' },
                  height: { xs: '100%', sm: '800px', md: '900px', lg: '100vh' },
                  maxHeight: '100vh',
                  maxWidth: '90vw',
                  bgcolor: 'black',
                  borderRadius: { xs: 0, sm: 2 },
                  overflow: 'hidden'
                }}>
                  <video
                    ref={videoRef}
                    src={shortsContent[0]?.processedFile?.url}
                    autoPlay
                    loop
                    muted={isVideoMuted}
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  {/* Engagement & Control Buttons - Right Side */}
                  <Box sx={{
                    position: 'absolute',
                    right: 16,
                    bottom: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    zIndex: 1000,
                    alignItems: 'center'
                  }}>
                    {/* Like Button */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IconButton
                        sx={{
                          color: 'white',
                          bgcolor: 'rgba(0,0,0,0.3)',
                          '&:hover': {
                            bgcolor: 'rgba(255,20,147,0.8)',
                            color: '#ff1493',
                          },
                          backdropFilter: 'blur(10px)',
                          mb: 0.5
                        }}
                      >
                        <Favorite />
                      </IconButton>
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
                        {shortsContent[0]?.likeCount}
                      </Typography>
                    </Box>

                    {/* Comment Button */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IconButton
                        sx={{
                          color: 'white',
                          bgcolor: 'rgba(0,0,0,0.3)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)',
                          },
                          backdropFilter: 'blur(10px)',
                          mb: 0.5
                        }}
                      >
                        <ChatBubbleOutline />
                      </IconButton>
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
                        {shortsContent[0]?.commentCount}
                      </Typography>
                    </Box>

                    {/* Share Button */}
                    <IconButton
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                        },
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Share />
                    </IconButton>
                  </Box>

                  {/* Video Control Buttons - Top Right */}
                  <Box sx={{
                    position: 'absolute',
                    right: 16,
                    top: 80,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    zIndex: 1000
                  }}>
                    <IconButton
                      onClick={toggleVideoPlay}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.5)',
                        },
                        backdropFilter: 'blur(10px)',
                        size: 'small'
                      }}
                      size="small"
                    >
                      {isVideoPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                    </IconButton>
                    <IconButton
                      onClick={toggleVideoMute}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.5)',
                        },
                        backdropFilter: 'blur(10px)',
                        size: 'small'
                      }}
                      size="small"
                    >
                      {isVideoMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
                    </IconButton>
                  </Box>

                  {/* Video Controls Overlay */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 3,
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    color: 'white'
                  }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      @{shortsContent[0]?.creatorHandle}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {shortsContent[0]?.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {shortsContent[0]?.viewCount} views
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="h6" sx={{ color: 'white' }}>
                  No shorts available
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Desktop Floating Action Button */}
        <Tooltip title="Create New Content" placement="left">
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: { xs: 80, sm: 24 },
              right: 24,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
              display: { xs: 'none', sm: 'flex' },
            }}
            onClick={() => router.push('/upload')}
          >
            <Add />
          </Fab>
        </Tooltip>
      </Container>

      {/* Mobile Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: 'block', sm: 'none' },
          zIndex: 1000,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
        elevation={3}
      >
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavChange}
          sx={{
            '& .MuiBottomNavigationAction-root': {
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <BottomNavigationAction
            label="Home"
            icon={<Home />}
          />
          <BottomNavigationAction
            label="Shorts"
            icon={<PlayCircleFilled />}
          />
          <BottomNavigationAction
            label="Profile"
            icon={<Person />}
          />
          <BottomNavigationAction
            label="Contests"
            icon={<EmojiEvents />}
          />
          <BottomNavigationAction
            label="Create"
            icon={<VideoLibrary />}
          />
        </BottomNavigation>
      </Paper>
    </>
  );
}