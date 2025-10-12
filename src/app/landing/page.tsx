'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Paper,
  Grid
} from '@mui/material';
import {
  Add as CreateIcon,
  TrendingUp as ViralIcon,
  AttachMoney as EarnIcon,
  Login as LoginIcon,
  PersonAdd as SignUpIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  const handleExplore = () => {
    router.push('/auth/login');
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            background: 'linear-gradient(45deg, #8B5FBF, #6A4C93)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '3rem', md: '4.5rem' }
          }}
        >
          Meme to Money
        </Typography>

        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: '#666',
            fontWeight: 500,
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          Create • Compete • Earn
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 6,
            color: '#777',
            lineHeight: 1.6,
            maxWidth: 600,
            mx: 'auto',
            fontSize: { xs: '1.1rem', md: '1.3rem' }
          }}
        >
          Turn your memes and videos into real earnings. Join the community of
          creators making money from their content.
        </Typography>

        {/* Primary Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 6, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSignUp}
            startIcon={<SignUpIcon />}
            sx={{
              background: 'linear-gradient(45deg, #2196F3, #1976D2)',
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              minWidth: 200,
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2, #1565C0)',
              },
            }}
          >
            Get Started Free
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleLogin}
            startIcon={<LoginIcon />}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              minWidth: 200,
              borderColor: '#8B5FBF',
              color: '#8B5FBF',
              '&:hover': {
                borderColor: '#6A4C93',
                color: '#6A4C93',
                backgroundColor: 'rgba(139, 95, 191, 0.04)',
              },
            }}
          >
            Sign In
          </Button>
        </Stack>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', height: '100%' }}>
            <CreateIcon sx={{ fontSize: 60, color: '#2196F3', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Create & Share
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Upload your best memes and short videos to share with the community
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', height: '100%' }}>
            <ViralIcon sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Go Viral
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Compete in contests and challenges to get your content noticed
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', height: '100%' }}>
            <EarnIcon sx={{ fontSize: 60, color: '#FF9800', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Earn Money
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Get tips and prizes from your viral content and engaged audience
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Call to Action Section */}
      <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'rgba(139, 95, 191, 0.05)', borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Ready to Start Earning?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, color: '#666' }}>
          Join thousands of creators already making money from their memes
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSignUp}
            sx={{
              background: 'linear-gradient(45deg, #8B5FBF, #6A4C93)',
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(45deg, #6A4C93, #5A3D7A)',
              },
            }}
          >
            Create Account
          </Button>

          <Button
            variant="text"
            size="large"
            onClick={handleExplore}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              color: '#8B5FBF',
              '&:hover': {
                backgroundColor: 'rgba(139, 95, 191, 0.1)',
              },
            }}
          >
            Explore Content
          </Button>
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 8, py: 4, borderTop: '1px solid #eee' }}>
        <Typography variant="body2" color="textSecondary">
          Already have an account?{' '}
          <Button
            variant="text"
            onClick={handleLogin}
            sx={{
              color: '#8B5FBF',
              fontWeight: 'bold',
              textTransform: 'none',
              p: 0,
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#6A4C93',
              },
            }}
          >
            Sign In Here
          </Button>
        </Typography>
      </Box>
    </Container>
  );
}