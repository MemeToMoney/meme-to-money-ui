'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Stack
} from '@mui/material';
import {
  Add as CreateIcon,
  TrendingUp as ViralIcon,
  AttachMoney as EarnIcon,
  Explore as ExploreIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth/register');
  };

  const handleExplore = () => {
    router.push('/feed');
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
        {/* Header */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            background: 'linear-gradient(45deg, #8B5FBF, #6A4C93)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}
        >
          Meme to Money
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            color: '#666',
            fontWeight: 500,
            fontSize: { xs: '1.2rem', md: '1.5rem' }
          }}
        >
          Create • Compete • Earn
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            mb: 5,
            color: '#777',
            lineHeight: 1.6,
            fontSize: { xs: '1rem', md: '1.1rem' }
          }}
        >
          Turn your memes and videos into real earnings. Join the community of
          creators making money from their content.
        </Typography>

        {/* Action Buttons */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          {/* Create & Share */}
          <Button
            variant="contained"
            size="large"
            startIcon={<CreateIcon />}
            onClick={handleGetStarted}
            sx={{
              background: 'linear-gradient(45deg, #2196F3, #1976D2)',
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2, #1565C0)',
              },
            }}
          >
            Create & Share
            <Typography variant="body2" sx={{ ml: 1, opacity: 0.9, fontWeight: 'normal' }}>
              Upload memes and short videos
            </Typography>
          </Button>

          {/* Go Viral */}
          <Button
            variant="contained"
            size="large"
            startIcon={<ViralIcon />}
            onClick={handleGetStarted}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50, #388E3C)',
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(45deg, #388E3C, #2E7D32)',
              },
            }}
          >
            Go Viral
            <Typography variant="body2" sx={{ ml: 1, opacity: 0.9, fontWeight: 'normal' }}>
              Compete in contests and challenges
            </Typography>
          </Button>

          {/* Earn Money */}
          <Button
            variant="contained"
            size="large"
            startIcon={<EarnIcon />}
            onClick={handleGetStarted}
            sx={{
              background: 'linear-gradient(45deg, #FF9800, #F57C00)',
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(45deg, #F57C00, #EF6C00)',
              },
            }}
          >
            Earn Money
            <Typography variant="body2" sx={{ ml: 1, opacity: 0.9, fontWeight: 'normal' }}>
              Get tips and prizes from your content
            </Typography>
          </Button>

          {/* Get Started */}
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              background: 'linear-gradient(45deg, #2196F3, #1976D2)',
              py: 2.5,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              mt: 2,
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2, #1565C0)',
              },
            }}
          >
            Get Started - It&apos;s FREE
          </Button>

          {/* Explore Content */}
          <Button
            variant="outlined"
            size="large"
            startIcon={<ExploreIcon />}
            onClick={handleExplore}
            sx={{
              py: 2,
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              borderColor: '#8B5FBF',
              color: '#8B5FBF',
              '&:hover': {
                borderColor: '#6A4C93',
                color: '#6A4C93',
                backgroundColor: 'rgba(139, 95, 191, 0.04)',
              },
            }}
          >
            Explore Content
          </Button>
        </Stack>

        {/* Sign In Link */}
        <Typography variant="body2" sx={{ color: '#666' }}>
          Already have an account?{' '}
          <Button
            variant="text"
            onClick={handleSignIn}
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
            Sign In
          </Button>
        </Typography>
      </Box>
    </Container>
  );
}