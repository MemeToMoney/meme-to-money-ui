'use client';

import React, { useState } from 'react';
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
  FiberManualRecord as OnlineIcon
} from '@mui/icons-material';

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

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f8f9fa',
      pt: 3
    }}>
      <Container maxWidth="lg">
        {/* Main Profile Section */}
        <Box sx={{
          display: 'flex',
          gap: 3,
          mb: 3
        }}>
          {/* Left Side - Profile Info */}
          <Box sx={{ flex: 1 }}>
            {/* Profile Header */}
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 3,
              mb: 3
            }}>
              {/* Avatar */}
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#4FC3F7',
                    fontSize: '3rem',
                    fontWeight: 'bold'
                  }}
                >
                  C
                </Avatar>
                <OnlineIcon sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  color: '#4CAF50',
                  bgcolor: 'white',
                  borderRadius: '50%',
                  fontSize: 20
                }} />
              </Box>

              {/* Profile Info */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Current User
                  </Typography>
                  <IconButton>
                    <MoreIcon />
                  </IconButton>
                </Box>

                <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                  @currentuser
                </Typography>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      3.2K
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Followers
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      156
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
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      0
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Views
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
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
                    startIcon={<SettingsIcon />}
                    sx={{
                      borderColor: '#666',
                      color: '#666',
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 'bold',
                      '&:hover': {
                        borderColor: '#333',
                        color: '#333',
                      },
                    }}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<BarChartIcon />}
                    sx={{
                      borderColor: '#666',
                      color: '#666',
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 'bold',
                      '&:hover': {
                        borderColor: '#333',
                        color: '#333',
                      },
                    }}
                  >
                    Analytics
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Side - Earnings Widget */}
          <Card sx={{
            width: 280,
            bgcolor: '#263238',
            color: 'white',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    bgcolor: '#FFD700',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>$</Typography>
                  </Box>
                </Box>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                $0.00
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                Total Earnings
              </Typography>

              <Button
                variant="contained"
                startIcon={<WalletIcon />}
                fullWidth
                sx={{
                  bgcolor: '#4CAF50',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#388E3C',
                  },
                }}
              >
                Wallet
              </Button>
            </CardContent>
          </Card>
        </Box>

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
                label="Content"
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
              <Typography variant="body1" sx={{ color: '#999', mb: 4 }}>
                No content yet
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#2196F3',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#1976D2',
                  },
                }}
              >
                + Create Your First Post
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
                Liked Content
              </Typography>
              <Typography variant="body1" sx={{ color: '#999' }}>
                Content you've liked will appear here
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
                Saved Content
              </Typography>
              <Typography variant="body1" sx={{ color: '#999' }}>
                Content you've saved will appear here
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