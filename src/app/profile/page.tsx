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
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AuthAPI } from '@/lib/api/auth';
import { ContentAPI, Content } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';

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
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      }
    }
  }, [user?.id, tabValue]);

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
        setUserContent(response.data.content.content);
      } else {
        setError('Failed to load your content');
      }
    } catch (err: any) {
      console.error('Load user content error:', err);
      setError('Failed to load your content');
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
        setLikedContent(response.data.content.content);
      } else {
        setError('Failed to load liked content');
      }
    } catch (err: any) {
      console.error('Load liked content error:', err);
      setError('Failed to load liked content');
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
    setEditDialogOpen(true);
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
      console.log('Starting profile photo upload...');

      const response = await AuthAPI.uploadProfilePicture(selectedFile);

      if (isApiSuccess(response)) {
        console.log('Profile photo upload successful, refreshing user data...');

        // Refresh user data to get updated profile picture URL
        const userResponse = await AuthAPI.getCurrentUser();
        if (isApiSuccess(userResponse)) {
          // Add a small delay to ensure the image is processed
          setTimeout(() => {
            updateUser(userResponse.data);
            console.log('User data updated with new profile picture:', userResponse.data.profilePicture);
          }, 500);

          showSnackbar('Profile photo updated successfully!');
          setPhotoDialogOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
        }
      } else {
        console.error('Profile photo upload failed:', response.message);
        showSnackbar(response.message || 'Failed to upload photo');
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
        showSnackbar(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      showSnackbar('Failed to update profile');
    } finally {
      setLoading(false);
    }
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
        <Box sx={{ p: 3, bgcolor: 'white', borderBottom: '8px solid #f8f9fa' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profilePictureUrl}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#6B46C1',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <IconButton
                onClick={handleUploadImage}
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  bgcolor: '#6B46C1',
                  color: 'white',
                  width: 28,
                  height: 28,
                  '&:hover': { bgcolor: '#553C9A' }
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>

            {/* User Info */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {user.displayName || user.name}
              </Typography>

              {user.creatorHandle && (
                <Typography variant="body2" sx={{ color: '#6B46C1', mb: 1 }}>
                  {user.creatorHandle}
                </Typography>
              )}

              {user.bio && (
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                  {user.bio}
                </Typography>
              )}

              {/* Stats Row */}
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {userContent.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    Posts
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {user.followerCount || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    Followers
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {user.followingCount || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    Following
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleEditProfile}
              sx={{
                flex: 1,
                borderColor: '#6B46C1',
                color: '#6B46C1',
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#553C9A',
                  bgcolor: 'rgba(107, 70, 193, 0.04)'
                }
              }}
            >
              Edit Profile
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push('/upload')}
              sx={{
                flex: 1,
                bgcolor: '#6B46C1',
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#553C9A'
                }
              }}
            >
              Create
            </Button>
          </Box>
        </Box>

        {/* Content Tabs */}
        <Box sx={{ bgcolor: 'white' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: '1px solid #E5E7EB',
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
            <Tab label="Posts" />
            <Tab label="Liked" />
            <Tab label="Saved" />
          </Tabs>
        </Box>

        {/* Content Grid */}
        <Box sx={{ p: 1 }}>
          <TabPanel value={tabValue} index={0}>
            {contentLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#6B46C1' }} />
              </Box>
            ) : userContent.length > 0 ? (
              <Grid container spacing={1}>
                {userContent.map((content) => {
                  const contentUrl = getContentUrl(content);
                  return (
                    <Grid item xs={4} key={content.id}>
                      <Card sx={{
                        borderRadius: 1,
                        overflow: 'hidden',
                        aspectRatio: '1',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                      }}>
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
                                fontSize: 24,
                                color: 'white',
                                bgcolor: 'rgba(0,0,0,0.6)',
                                borderRadius: '50%',
                                p: 0.5
                              }}
                            />
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
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No posts yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start creating content to see your posts here
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/upload')}
                  sx={{
                    bgcolor: '#6B46C1',
                    '&:hover': { bgcolor: '#553C9A' }
                  }}
                >
                  Create Your First Post
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {contentLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#6B46C1' }} />
              </Box>
            ) : likedContent.length > 0 ? (
              <Grid container spacing={1}>
                {likedContent.map((content) => {
                  const contentUrl = getContentUrl(content);
                  return (
                    <Grid item xs={4} key={content.id}>
                      <Card sx={{
                        borderRadius: 1,
                        overflow: 'hidden',
                        aspectRatio: '1',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                      }}>
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
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No liked content yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Content you like will appear here
                </Typography>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No saved content yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Content you save will appear here
              </Typography>
            </Box>
          </TabPanel>
        </Box>

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