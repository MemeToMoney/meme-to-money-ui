'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  Divider,
  IconButton
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthAPI } from '@/lib/api/auth';
import { isApiSuccess } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuth } from '@/lib/google-auth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrMobile: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(formData.emailOrMobile, formData.password);

      if (success) {
        console.log('Login successful - redirecting to feed');
        router.push('/feed');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Initialize Google Auth
      await GoogleAuth.initialize();

      // Get Google authentication response
      const googleResponse = await GoogleAuth.signIn();

      // Call your Google auth API
      const response = await AuthAPI.googleAuth({
        idToken: googleResponse.idToken
      });

      if (isApiSuccess(response)) {
        console.log('Google login successful:', response.data);
        router.push('/feed');
      } else {
        setError('Google login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            MemeToMoney
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Sign In
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email or Mobile"
            name="emailOrMobile"
            type="text"
            value={formData.emailOrMobile}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>
              OR
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          {/* Google Login Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            sx={{
              mb: 3,
              py: 1.5,
              borderColor: '#dadce0',
              color: '#3c4043',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#f8f9fa',
                borderColor: '#dadce0',
              },
            }}
            startIcon={
              <GoogleIcon sx={{
                color: '#4285f4',
                width: 20,
                height: 20
              }} />
            }
          >
            Continue with Google
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              type="button"
              onClick={() => router.push('/auth/register')}
              sx={{ textDecoration: 'none' }}
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}