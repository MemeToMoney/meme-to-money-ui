'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  IconButton
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const contentTypes = [
  { id: 'memes', label: 'Memes', emoji: '😂' },
  { id: 'videos', label: 'Videos', emoji: '🎬' },
  { id: 'funny', label: 'Funny', emoji: '🤣' },
  { id: 'trending', label: 'Trending', emoji: '🔥' },
  { id: 'challenges', label: 'Challenges', emoji: '🏆' },
  { id: 'comedy', label: 'Comedy', emoji: '🎭' },
  { id: 'rewards', label: 'Rewards', emoji: '🎁' },
  { id: 'community', label: 'Community', emoji: '👥' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'lifestyle', label: 'Lifestyle', emoji: '✨' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'explore', label: 'Explore', emoji: '🌟' },
  { id: 'finance', label: 'Finance', emoji: '💰' }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSkip = async () => {
    try {
      // Mark onboarding as completed even when skipped
      if (user) {
        await updateProfile({ onboardingCompleted: true });
      }
      router.push('/feed');
    } catch (error) {
      console.error('Failed to mark onboarding as completed:', error);
      // Still redirect to prevent user from being stuck
      router.push('/feed');
    }
  };

  const handleNext = async () => {
    try {
      // Save preferences to user profile and mark onboarding as completed
      if (user && selectedTypes.length > 0) {
        // TODO: Save content preferences to API when backend supports it
        // For now, mark onboarding as completed
        await updateProfile({ onboardingCompleted: true });
      }

      // Redirect to main app
      router.push('/feed');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still redirect to prevent user from being stuck
      router.push('/feed');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #6B46C1 0%, #9333EA 100%)',
      color: 'white'
    }}>
      <Container
        maxWidth="sm"
        sx={{
          maxWidth: '428px !important',
          px: 3,
          py: 4,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ color: 'white', mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', flex: 1 }}
          >
            Meme to Money
          </Typography>
          <Button
            onClick={handleSkip}
            sx={{
              color: 'white',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Skip
          </Button>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              mb: 4,
              textAlign: 'center'
            }}
          >
            Choose your content type:
          </Typography>

          {/* Content Type Grid */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {contentTypes.map((type) => (
              <Grid item xs={4} key={type.id}>
                <Chip
                  label={
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      py: 1
                    }}>
                      <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>
                        {type.emoji}
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {type.label}
                      </Typography>
                    </Box>
                  }
                  clickable
                  onClick={() => handleTypeToggle(type.id)}
                  sx={{
                    width: '100%',
                    height: 80,
                    bgcolor: selectedTypes.includes(type.id)
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: selectedTypes.includes(type.id)
                      ? '2px solid rgba(255, 255, 255, 0.8)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                    },
                    '& .MuiChip-label': {
                      width: '100%',
                      padding: 0
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>

          {/* Upgrade Plan Button */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                px: 4,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              UPGRADE PLAN
            </Button>
          </Box>

          {/* Bottom Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Next Button */}
          <Button
            onClick={handleNext}
            disabled={selectedTypes.length === 0}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: '#6B46C1',
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              width: '100%',
              '&:hover': {
                bgcolor: 'white',
              },
              '&:disabled': {
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                color: 'rgba(107, 70, 193, 0.5)',
              }
            }}
          >
            Next
          </Button>
        </Box>
      </Container>
    </Box>
  );
}