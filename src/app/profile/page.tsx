'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  CardMedia,
} from '@mui/material';
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
  BarChart as BarChartIcon,
  MoreVert as MoreIcon,
  AccountBalanceWallet as WalletIcon,
  FiberManualRecord as OnlineIcon,
  Add as CreateIcon,
  Logout as LogoutIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Tag as TagIcon,
  CurrencyRupee as RupeeIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PayoutIcon,
  CardGiftcard as GiftIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthAPI, ReferralInfo } from '@/lib/api/auth';
import { ContentAPI, Content, PageResponse } from '@/lib/api/content';
import { MonetizationAPI, WalletResponse, EarningsSummary } from '@/lib/api/monetization';
import { isApiSuccess } from '@/lib/api/client';
import { FeedPostCard } from '@/components/FeedPostCard';
import { PostDetailModal } from '@/components/PostDetailModal';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ProfilePageContent() {
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [userContent, setUserContent] = useState<Content[]>([]);
  const [likedContent, setLikedContent] = useState<Content[]>([]);
  const [savedContent, setSavedContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedPost, setSelectedPost] = useState<Content | null>(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    creatorHandle: '',
    username: ''
  });

  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's content when component mounts or tab changes
  useEffect(() => {
    if (user?.id) {
      if (tabValue === 0) {
        loadUserContent();
      } else if (tabValue === 1) {
        loadLikedContent();
      } else if (tabValue === 2) {
        loadSavedContent();
      }
    }
  }, [user?.id, tabValue]);

  // Load wallet and earnings data
  useEffect(() => {
    if (user?.id) {
      MonetizationAPI.getWallet().then(res => {
        if (isApiSuccess(res)) setWalletData(res.data);
      }).catch(() => {});
      MonetizationAPI.getEarningsSummary().then(res => {
        if (isApiSuccess(res)) setEarningsSummary(res.data);
      }).catch(() => {});
      AuthAPI.getReferralInfo().then(res => {
        if (isApiSuccess(res)) setReferralInfo(res.data);
      }).catch(() => {});
    }
  }, [user?.id]);

  // Initialize edit form when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || user.name || '',
        bio: user.bio || '',
        creatorHandle: user.creatorHandle || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const loadUserContent = async () => {
    if (!user?.id) return;

    try {
      setContentLoading(true);
      const response = await ContentAPI.getUserContent(user.id, 0, 20, user.id);
      if (isApiSuccess(response)) {
        setUserContent(response.data.content || []);
      } else {
        setError('Failed to load your content');
      }
    } catch (err: any) {
      console.error('Load user content error:', err);
      setError('Failed to load your content');
      setUserContent([]); // Ensure it's an array on error
    } finally {
      setContentLoading(false);
    }
  };

  const loadLikedContent = async () => {
    if (!user?.id) return;

    try {
      setContentLoading(true);
      const response = await ContentAPI.getUserLikedContent(user.id, 0, 20, user.id);
      if (isApiSuccess(response)) {
        setLikedContent(response.data.content.content || []);
      } else {
        setError('Failed to load liked content');
      }
    } catch (err: any) {
      console.error('Load liked content error:', err);
      setError('Failed to load liked content');
      setLikedContent([]); // Ensure it's an array on error
    } finally {
      setContentLoading(false);
    }
  };

  const loadSavedContent = async () => {
    if (!user?.id) return;
    try {
      setContentLoading(true);
      const response = await ContentAPI.getSavedPosts(user.id, 0, 30);
      if (isApiSuccess(response)) {
        setSavedContent(response.data.content || []);
      } else {
        setSavedContent([]);
      }
    } catch (err: any) {
      console.error('Load saved content error:', err);
      setSavedContent([]);
    } finally {
      setContentLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    router.push('/landing');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleUploadImage = () => {
    setPhotoDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showSnackbar('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile || !user?.id) return;

    try {
      setLoading(true);

      const response = await AuthAPI.uploadProfilePicture(selectedFile);

      if (isApiSuccess(response)) {
        // Refresh user data to get updated profile picture URL
        const userResponse = await AuthAPI.getCurrentUser();
        if (isApiSuccess(userResponse)) {
          // Add a small delay to ensure the image is processed
          setTimeout(() => {
            updateUser(userResponse.data);
          }, 500);

          showSnackbar('Profile photo updated successfully!');
          setPhotoDialogOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
        }
      } else {
        showSnackbar((response as any).message || 'Failed to upload photo');
      }
    } catch (err: any) {
      console.error('Photo upload error:', err);
      showSnackbar('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await AuthAPI.updateProfile({
        displayName: editForm.displayName,
        bio: editForm.bio,
        creatorHandle: editForm.creatorHandle,
        username: editForm.username
      });

      if (isApiSuccess(response)) {
        updateUser(response.data);
        showSnackbar('Profile updated successfully!');
        setEditDialogOpen(false);
      } else {
        showSnackbar((response as any).message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      showSnackbar('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (content: Content) => {
    setSelectedPost(content);
    setPostDialogOpen(true);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const getContentUrl = (content: Content) => {
    return content.processedFile?.cdnUrl || content.originalFile?.cdnUrl || content.thumbnailUrl;
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  // Construct profile picture URL with proper service URL and cache busting
  const getProfilePictureUrl = (profilePicture?: string) => {
    if (!profilePicture) return undefined;

    // If it's already a full URL, use it as is
    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
      // Add cache busting parameter with current timestamp
      const separator = profilePicture.includes('?') ? '&' : '?';
      return `${profilePicture}${separator}t=${Date.now()}`;
    }

    // If it's a relative path, construct full URL
    const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8080';
    const baseUrl = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;
    return `${USER_SERVICE_URL}${baseUrl}?t=${Date.now()}`;
  };

  const profilePictureUrl = getProfilePictureUrl(user.profilePicture);

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f8f9fa',
      pb: 10
    }}>
      <Container maxWidth={false} sx={{ p: 0 }}>
        {/* Mobile Header */}
        <Box sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'white',
          zIndex: 1,
          p: 2,
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#6B46C1'
            }}
          >
            Profile
          </Typography>
          <IconButton onClick={() => router.push('/settings')}>
            <SettingsIcon sx={{ color: '#6B7280' }} />
          </IconButton>
        </Box>

        {/* Profile Header */}
        <Box sx={{
          bgcolor: 'white',
          pb: 2,
          borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}>
          {/* Cover Image Placeholder (Optional, can be added later) */}
          <Box sx={{
            height: 120,
            background: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
            opacity: 0.3
          }} />

          <Container maxWidth="md" sx={{ mt: -6, px: 3 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              {/* Avatar */}
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  src={profilePictureUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#6B46C1',
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <IconButton
                  onClick={handleUploadImage}
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    bgcolor: '#6B46C1',
                    color: 'white',
                    width: 32,
                    height: 32,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    '&:hover': { bgcolor: '#553C9A' }
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              {/* User Info */}
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}>
                {user.displayName || user.name}
              </Typography>

              <Typography variant="body1" sx={{ color: '#6B46C1', fontWeight: 600, mb: 1.5 }}>
                @{user.username || 'username'}
              </Typography>

              {user.bio && (
                <Typography variant="body2" sx={{ color: '#4B5563', mb: 1, maxWidth: 400, lineHeight: 1.6 }}>
                  {user.bio}
                </Typography>
              )}

              {user.website && (
                <Typography
                  variant="body2"
                  component="a"
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#6B46C1', fontWeight: 600, mb: 1, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {user.website.replace(/^https?:\/\//, '')}
                </Typography>
              )}

              {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  {Object.entries(user.socialLinks).map(([platform, url]) => url && (
                    <Typography
                      key={platform}
                      variant="caption"
                      component="a"
                      href={String(url).startsWith('http') ? String(url) : `https://${String(url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#6B7280', textDecoration: 'none', textTransform: 'capitalize', '&:hover': { color: '#6B46C1' } }}
                    >
                      {platform}
                    </Typography>
                  ))}
                </Box>
              )}

              {/* Stats Row */}
              <Box sx={{
                display: 'flex',
                gap: { xs: 3, sm: 4, md: 6 },
                mb: 4,
                p: 2,
                bgcolor: '#F9FAFB',
                borderRadius: 4
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
                    {userContent?.length || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Posts
                  </Typography>
                </Box>
                <Box
                  sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
                  onClick={() => router.push(`/profile/${user.id}/followers`)}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
                    {user.followerCount || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Followers
                  </Typography>
                </Box>
                <Box
                  sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
                  onClick={() => router.push(`/profile/${user.id}/following`)}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
                    {user.followingCount || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Following
                  </Typography>
                </Box>
              </Box>

              {/* Wallet & Monetization Section */}
              <Box sx={{
                width: '100%',
                maxWidth: 400,
                mb: 3,
                p: 2,
                bgcolor: 'linear-gradient(135deg, #F5F3FF 0%, #FDF4FF 100%)',
                background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF4FF 100%)',
                borderRadius: 3,
                border: '1px solid #E9D5FF'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WalletIcon sx={{ color: '#6B46C1', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151' }}>
                      My Wallet
                    </Typography>
                  </Box>
                  <Chip
                    icon={<RupeeIcon sx={{ fontSize: 14, color: '#6B46C1 !important' }} />}
                    label={`${walletData?.coinBalance ?? 0} coins`}
                    size="small"
                    sx={{
                      bgcolor: '#EDE9FE',
                      color: '#6B46C1',
                      fontWeight: 700,
                      fontSize: '0.8rem'
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Total Earned</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                      {walletData?.totalEarned ?? 0}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>This Week</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#6B46C1' }}>
                      {earningsSummary?.thisWeekCoins ?? 0}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TrophyIcon sx={{ fontSize: 16 }} />}
                    onClick={() => router.push('/leaderboard')}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      borderColor: '#D1D5DB',
                      color: '#374151',
                      fontWeight: 600,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      '&:hover': { borderColor: '#6B46C1', color: '#6B46C1' }
                    }}
                  >
                    Leaderboard
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                    onClick={() => router.push('/dashboard')}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      borderColor: '#D1D5DB',
                      color: '#374151',
                      fontWeight: 600,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      '&:hover': { borderColor: '#6B46C1', color: '#6B46C1' }
                    }}
                  >
                    Earnings
                  </Button>
                </Box>
              </Box>

              {/* Refer & Earn Section */}
              {referralInfo?.referralCode && (
                <Box sx={{
                  width: '100%',
                  maxWidth: 400,
                  mb: 3,
                  p: 2,
                  background: 'linear-gradient(135deg, #FEF9C3 0%, #FFF7ED 100%)',
                  borderRadius: 3,
                  border: '1px solid #FDE68A'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GiftIcon sx={{ color: '#D97706', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151' }}>
                        Refer & Earn
                      </Typography>
                    </Box>
                    <Chip
                      label={`${referralInfo.referralCount || 0} referred`}
                      size="small"
                      sx={{
                        bgcolor: '#FEF3C7',
                        color: '#D97706',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        border: '1px solid #FDE68A'
                      }}
                    />
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    mb: 1.5,
                    bgcolor: 'white',
                    borderRadius: 2,
                    border: '1px dashed #D1D5DB'
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: '#6B46C1',
                        letterSpacing: '0.1em',
                        fontFamily: 'monospace',
                        flex: 1,
                        textAlign: 'center'
                      }}
                    >
                      {referralInfo.referralCode}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(referralInfo.referralCode);
                          setReferralCopied(true);
                          setTimeout(() => setReferralCopied(false), 2000);
                        } catch {}
                      }}
                      sx={{ color: referralCopied ? '#10B981' : '#6B7280' }}
                    >
                      <CopyIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    startIcon={<GiftIcon sx={{ fontSize: 16 }} />}
                    onClick={() => router.push('/invite')}
                    sx={{
                      textTransform: 'none',
                      bgcolor: '#D97706',
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: 2,
                      fontSize: '0.8rem',
                      py: 0.8,
                      '&:hover': { bgcolor: '#B45309' }
                    }}
                  >
                    Invite Friends
                  </Button>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 400 }}>
                <Button
                  variant="outlined"
                  onClick={handleEditProfile}
                  fullWidth
                  sx={{
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    textTransform: 'none',
                    borderRadius: 3,
                    fontWeight: 600,
                    py: 1,
                    '&:hover': {
                      borderColor: '#D1D5DB',
                      bgcolor: '#F9FAFB'
                    }
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push('/upload')}
                  fullWidth
                  sx={{
                    bgcolor: '#6B46C1',
                    textTransform: 'none',
                    borderRadius: 3,
                    fontWeight: 600,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(107, 70, 193, 0.2)',
                    '&:hover': {
                      bgcolor: '#553C9A',
                      boxShadow: '0 6px 16px rgba(107, 70, 193, 0.3)'
                    }
                  }}
                >
                  Create Post
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Content Tabs */}
        <Container maxWidth="md" sx={{ mt: 2 }}>
          <Box sx={{ borderBottom: '1px solid #E5E7EB', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: '#6B7280',
                  minWidth: 100,
                  '&.Mui-selected': {
                    color: '#6B46C1',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#6B46C1',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
              }}
            >
              <Tab label="Posts" />
              <Tab label="Liked" />
              <Tab label="Saved" />
            </Tabs>
          </Box>

          {/* Content Grid */}
          <Box sx={{ minHeight: 400 }}>
            <TabPanel value={tabValue} index={0}>
              {contentLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#6B46C1' }} />
                </Box>
              ) : userContent.length > 0 ? (
                <Grid container spacing={{ xs: 0.5, sm: 1, md: 2 }}>
                  {userContent.map((content) => {
                    const contentUrl = getContentUrl(content);
                    return (
                      <Grid item xs={4} sm={4} md={4} key={content.id} sx={{ minWidth: 0 }}>
                        <Card sx={{
                          borderRadius: { xs: 1, sm: 2, md: 3 },
                          overflow: 'hidden',
                          aspectRatio: '1',
                          cursor: 'pointer',
                          boxShadow: 'none',
                          position: 'relative',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            opacity: 0.9,
                            transform: 'scale(1.03)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                          }
                        }}
                          onClick={() => handlePostClick(content)}
                        >
                          {content.type === 'SHORT_VIDEO' ? (
                            <Box sx={{ position: 'relative', height: '100%' }}>
                              <CardMedia
                                component="img"
                                image={content.thumbnailUrl || contentUrl}
                                alt={content.title}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                              <PlayIcon
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  fontSize: 32,
                                  color: 'white',
                                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }}
                              />
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 1,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <PlayIcon sx={{ fontSize: 14, color: 'white' }} />
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                                  {content.viewCount || 0}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <CardMedia
                              component="img"
                              image={contentUrl}
                              alt={content.title}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{
                    width: 64,
                    height: 64,
                    bgcolor: '#F3F4F6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <PhotoCameraIcon sx={{ fontSize: 32, color: '#9CA3AF' }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    No posts yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Share your first meme or video with the world!
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/upload')}
                    sx={{
                      bgcolor: '#6B46C1',
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#553C9A' }
                    }}
                  >
                    Create Post
                  </Button>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {contentLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#6B46C1' }} />
                </Box>
              ) : likedContent.length > 0 ? (
                <Grid container spacing={{ xs: 0.5, sm: 1, md: 2 }}>
                  {likedContent.map((content) => {
                    const contentUrl = getContentUrl(content);
                    return (
                      <Grid item xs={4} sm={4} md={4} key={content.id} sx={{ minWidth: 0 }}>
                        <Card sx={{
                          borderRadius: { xs: 1, sm: 2, md: 3 },
                          overflow: 'hidden',
                          aspectRatio: '1',
                          cursor: 'pointer',
                          boxShadow: 'none',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            opacity: 0.9,
                            transform: 'scale(1.03)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                          }
                        }}
                          onClick={() => handlePostClick(content)}
                        >
                          <CardMedia
                            component="img"
                            image={contentUrl}
                            alt={content.title}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{
                    width: 64,
                    height: 64,
                    bgcolor: '#F3F4F6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <FavoriteIcon sx={{ fontSize: 32, color: '#9CA3AF' }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    No liked posts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posts you like will appear here
                  </Typography>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {contentLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#6B46C1' }} />
                </Box>
              ) : savedContent.length > 0 ? (
                <Grid container spacing={{ xs: 0.5, sm: 1, md: 2 }}>
                  {savedContent.map((content) => {
                    const contentUrl = getContentUrl(content);
                    return (
                      <Grid item xs={4} sm={4} md={4} key={content.id} sx={{ minWidth: 0 }}>
                        <Card sx={{
                          borderRadius: { xs: 1, sm: 2, md: 3 },
                          overflow: 'hidden',
                          aspectRatio: '1',
                          cursor: 'pointer',
                          boxShadow: 'none',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            opacity: 0.9,
                            transform: 'scale(1.03)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                          }
                        }}
                          onClick={() => handlePostClick(content)}
                        >
                          <CardMedia
                            component="img"
                            image={contentUrl}
                            alt={content.title}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{
                    width: 64,
                    height: 64,
                    bgcolor: '#F3F4F6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <BookmarkIcon sx={{ fontSize: 32, color: '#9CA3AF' }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    No saved posts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posts you save will appear here
                  </Typography>
                </Box>
              )}
            </TabPanel>
          </Box>
        </Container>

        {/* Edit Profile Modal */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Edit Profile
            <IconButton onClick={() => setEditDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Display Name"
              value={editForm.displayName}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Username"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              margin="normal"
              variant="outlined"
              helperText="This will be your unique identifier"
            />
            <TextField
              fullWidth
              label="Creator Handle"
              value={editForm.creatorHandle}
              onChange={(e) => setEditForm({ ...editForm, creatorHandle: e.target.value })}
              margin="normal"
              variant="outlined"
              helperText="Your public creator handle (e.g., @yourname)"
            />
            <TextField
              fullWidth
              label="Bio"
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
              helperText="Tell people about yourself"
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setEditDialogOpen(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProfileUpdate}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              sx={{
                bgcolor: '#6B46C1',
                textTransform: 'none',
                '&:hover': { bgcolor: '#553C9A' }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Photo Upload Modal */}
        <Dialog
          open={photoDialogOpen}
          onClose={() => setPhotoDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Update Profile Photo
            <IconButton onClick={() => setPhotoDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {previewUrl ? (
                <Avatar
                  src={previewUrl}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                />
              ) : (
                <Avatar
                  src={getProfilePictureUrl(user.profilePicture)}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: '#6B46C1' }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />

              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<UploadIcon />}
                sx={{
                  borderColor: '#6B46C1',
                  color: '#6B46C1',
                  textTransform: 'none',
                  mb: 2
                }}
              >
                Choose Photo
              </Button>

              <Typography variant="body2" color="text.secondary">
                JPG, PNG or GIF up to 5MB
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => {
                setPhotoDialogOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePhotoUpload}
              variant="contained"
              disabled={!selectedFile || loading}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              sx={{
                bgcolor: '#6B46C1',
                textTransform: 'none',
                '&:hover': { bgcolor: '#553C9A' }
              }}
            >
              Upload Photo
            </Button>
          </DialogActions>
        </Dialog>

        {/* Post Detail Modal */}
        <PostDetailModal
          open={postDialogOpen}
          onClose={() => setPostDialogOpen(false)}
          post={selectedPost}
          onLike={(contentId, isLiked) => {
            // Update local state if needed
            // For now, we rely on the modal's internal state + optimistic updates
            // In a real app, we'd update the userContent/likedContent lists here
          }}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="info"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}