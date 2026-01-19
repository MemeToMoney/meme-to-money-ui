'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Avatar
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleJoinNow = () => {
    router.push('/auth/register');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container
        maxWidth="sm"
        sx={{
          maxWidth: '428px !important',
          px: 3,
          py: 4
        }}
      >
        <Box sx={{
          textAlign: 'center',
          bgcolor: 'white',
          borderRadius: 4,
          p: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>

          {/* App Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              color: '#2c3e50',
              fontSize: '1.8rem'
            }}
          >
            Meme to Money Platform
          </Typography>

          {/* Character Illustration Area */}
          <Box sx={{
            mb: 4,
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            position: 'relative'
          }}>
            {/* Character Avatar */}
            <Box sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#6B46C1',
                  fontSize: '3rem',
                  mb: 2,
                  border: '4px solid #E5E7EB'
                }}
              >
                👨‍💻
              </Avatar>

              {/* Coin elements */}
              <Box sx={{
                position: 'absolute',
                top: -10,
                right: -20,
                width: 40,
                height: 40,
                bgcolor: '#FFD700',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
              }}>
                💰
              </Box>

              <Box sx={{
                position: 'absolute',
                bottom: 20,
                left: -25,
                width: 30,
                height: 30,
                bgcolor: '#FFD700',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
              }}>
                🪙
              </Box>
            </Box>
          </Box>

          {/* Tagline */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: '#374151',
              fontSize: '1.3rem'
            }}
          >
            Share Your Fun
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#6B7280',
              mb: 4,
              lineHeight: 1.6,
              px: 2
            }}
          >
            Join a vibrant community to upload memes, earn rewards, and engage with others.
          </Typography>

          {/* Primary CTA Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleJoinNow}
            sx={{
              background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
              color: 'white',
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              mb: 3,
              boxShadow: '0 4px 16px rgba(107, 70, 193, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)',
                boxShadow: '0 6px 20px rgba(107, 70, 193, 0.5)',
              },
            }}
          >
            Join Now
          </Button>

          {/* Secondary Link */}
          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
              fontSize: '0.95rem'
            }}
          >
            Already a member?{' '}
            <Button
              variant="text"
              onClick={handleLogin}
              sx={{
                color: '#6B46C1',
                fontWeight: 'bold',
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                fontSize: '0.95rem',
                textDecoration: 'underline',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#553C9A',
                  textDecoration: 'underline',
                },
              }}
            >
              Log in
            </Button>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}