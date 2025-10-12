'use client';

import React, { useState } from 'react';
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
  Chip
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
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    router.push('/landing');
  };

  const handleEditProfile = () => {
    // TODO: Open edit profile modal or navigate to edit page
    console.log('Edit profile clicked');
  };

  const handleUploadImage = () => {
    // TODO: Open image upload modal
    console.log('Upload image clicked');
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  // Construct profile picture URL
  const profilePictureUrl = user.profilePicture
    ? `http://localhost:8080${user.profilePicture}`
    : undefined;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Profile Header Card */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              {/* Left: Avatar and User Info */}
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={profilePictureUrl}
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#4FC3F7',
                        fontSize: '2.5rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <IconButton
                      onClick={handleUploadImage}
                      sx={{
                        position: 'absolute',
                        bottom: -5,
                        right: -5,
                        bgcolor: '#2196F3',
                        color: 'white',
                        width: 32,
                        height: 32,
                        '&:hover': { bgcolor: '#1976D2' }
                      }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {user.displayName || user.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
                      {user.email}
                    </Typography>
                    {user.bio && (
                      <Typography variant="body2" sx={{ color: '#777', mb: 2 }}>
                        {user.bio}
                      </Typography>
                    )}


                    {/* User Stats */}
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {user.followerCount}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Followers
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {user.followingCount}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Following
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          0
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Posts
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Right: Action Buttons */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEditProfile}
                    sx={{
                      bgcolor: '#2196F3',
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: '#1976D2',
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CreateIcon />}
                    sx={{
                      borderColor: '#4CAF50',
                      color: '#4CAF50',
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 'bold',
                      '&:hover': {
                        borderColor: '#388E3C',
                        color: '#388E3C',
                        backgroundColor: 'rgba(76, 175, 80, 0.04)',
                      },
                    }}
                  >
                    Create Content
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Earnings Card */}
        <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  Total Earnings
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  ₹{user.totalEarnings.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  +₹{user.weeklyEarnings.toLocaleString()} this week
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <WalletIcon sx={{ fontSize: 60, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  🪙 {user.coinBalance} coins
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* User Details Card */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Account Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Mobile Number</Typography>
                <Typography variant="body1">{user.mobileNumber || 'Not provided'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Country</Typography>
                <Typography variant="body1">{user.country || 'Not provided'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Content Creator</Typography>
                <Chip
                  label={user.isContentCreator ? 'Yes' : 'No'}
                  color={user.isContentCreator ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#666' }}>Auth Provider</Typography>
                <Typography variant="body1">{user.authProvider || 'Email'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  minWidth: 120,
                },
              }}
            >
              <Tab
                icon={<PlayIcon />}
                label="My Content"
                iconPosition="start"
                sx={{ gap: 1 }}
              />
              <Tab
                icon={<FavoriteIcon />}
                label="Liked"
                iconPosition="start"
                sx={{ gap: 1 }}
              />
              <Tab
                icon={<BookmarkIcon />}
                label="Saved"
                iconPosition="start"
                sx={{ gap: 1 }}
              />
              <Tab
                icon={<BarChartIcon />}
                label="Analytics"
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
                Your Content
              </Typography>
              <Typography variant="body1" sx={{ color: '#999' }}>
                No content yet. Start creating to see your posts here!
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
                Liked Content
              </Typography>
              <Typography variant="body1" sx={{ color: '#999' }}>
                Content you&apos;ve liked will appear here
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
                Saved Content
              </Typography>
              <Typography variant="body1" sx={{ color: '#999' }}>
                Content you&apos;ve saved will appear here
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
                Analytics
              </Typography>
              <Typography variant="body1" sx={{ color: '#999' }}>
                Your performance analytics will appear here
              </Typography>
            </Box>
          </TabPanel>
        </Card>
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