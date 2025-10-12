'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewsIcon,
  AttachMoney as MoneyIcon,
  ThumbUp as LikesIcon,
  Share as ShareIcon,
  Comment as CommentIcon
} from '@mui/icons-material';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d');

  const dashboardData = {
    totalViews: 45230,
    totalLikes: 3421,
    totalShares: 892,
    totalComments: 567,
    totalEarnings: 234.56,
    avgEngagement: 7.8,
    topContent: [
      { id: 1, title: 'Funny Cat Meme #42', views: 12450, likes: 845, earnings: 45.80, type: 'image' },
      { id: 2, title: 'Dancing Dog Video', views: 9820, likes: 623, earnings: 38.25, type: 'video' },
      { id: 3, title: 'Relatable Work Meme', views: 8930, likes: 567, earnings: 32.10, type: 'image' },
      { id: 4, title: 'Cooking Fail Compilation', views: 7650, likes: 445, earnings: 28.90, type: 'video' },
      { id: 5, title: 'Weekend Mood Meme', views: 6210, likes: 389, earnings: 24.15, type: 'image' }
    ],
    recentActivity: [
      { type: 'tip', message: 'Received $5.00 tip from user123', time: '2 hours ago' },
      { type: 'like', message: 'Your content got 50 new likes', time: '4 hours ago' },
      { type: 'view', message: 'Your content reached 1000 views milestone', time: '6 hours ago' },
      { type: 'upload', message: 'Successfully uploaded "New Meme Content"', time: '1 day ago' },
      { type: 'earnings', message: 'Monthly earnings goal 80% complete', time: '2 days ago' }
    ]
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tip': return '💰';
      case 'like': return '👍';
      case 'view': return '👁️';
      case 'upload': return '📤';
      case 'earnings': return '💸';
      default: return '📊';
    }
  };

  const timeRanges = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon /> Creator Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'contained' : 'outlined'}
              onClick={() => setTimeRange(range.value)}
              size="small"
            >
              {range.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary.main">
                    {dashboardData.totalViews.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Views</Typography>
                </Box>
                <ViewsIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    ${dashboardData.totalEarnings}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Earnings</Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="info.main">
                    {dashboardData.totalLikes.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Likes</Typography>
                </Box>
                <LikesIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {dashboardData.avgEngagement}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Avg Engagement</Typography>
                </Box>
                <TrendingIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Content Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Top Performing Content</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Content</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Likes</TableCell>
                    <TableCell align="right">Earnings</TableCell>
                    <TableCell align="right">Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.topContent.map((content) => (
                    <TableRow key={content.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.200' }}>
                            {content.type === 'video' ? '🎥' : '🖼️'}
                          </Avatar>
                          <Typography variant="body2">{content.title}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {content.views.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {content.likes.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          ${content.earnings}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={content.type}
                          size="small"
                          color={content.type === 'video' ? 'secondary' : 'primary'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {dashboardData.recentActivity.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ fontSize: '20px' }}>
                    {getActivityIcon(activity.type)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" gutterBottom>
                      {activity.message}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Goals & Progress */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Monthly Goals</Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Earnings Goal</Typography>
                <Typography variant="body2">$234.56 / $300.00</Typography>
              </Box>
              <LinearProgress variant="determinate" value={78} />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Views Goal</Typography>
                <Typography variant="body2">45.2k / 50k</Typography>
              </Box>
              <LinearProgress variant="determinate" value={90} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Content Goal</Typography>
                <Typography variant="body2">18 / 25 posts</Typography>
              </Box>
              <LinearProgress variant="determinate" value={72} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  href="/upload"
                  sx={{ mb: 2 }}
                >
                  Upload New Content
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  href="/profile"
                >
                  Edit Profile
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  href="/wallet"
                >
                  View Wallet
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}