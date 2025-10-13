'use client';

import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthAPI } from '@/lib/api/auth';
import { isApiSuccess } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

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
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0); // 0 = Login, 1 = Signup

  // Login form state
  const [loginData, setLoginData] = useState({
    emailOrMobile: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(''); // Clear errors when switching tabs
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(loginData.emailOrMobile, loginData.password);

      if (success) {
        router.push('/onboarding');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await AuthAPI.register({
        name: signupData.name,
        email: signupData.email,
        mobileNumber: 0, // Will be updated later
        password: signupData.password
      });

      if (isApiSuccess(response)) {
        console.log('Registration successful, attempting auto-login...');
        // Auto-login after successful registration
        const loginSuccess = await login(signupData.email, signupData.password);
        if (loginSuccess) {
          console.log('Auto-login successful, redirecting to onboarding...');
          // Add a small delay to ensure auth context is updated
          setTimeout(() => {
            router.push('/onboarding');
          }, 100);
        } else {
          setError('Registration successful but login failed. Please login manually.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      // Initialize Google Auth
      const { GoogleAuth } = await import('@/lib/google-auth');
      await GoogleAuth.initialize();

      // Get Google authentication response
      const googleResponse = await GoogleAuth.signIn();

      // Call your Google auth API
      const response = await AuthAPI.googleAuth({
        idToken: googleResponse.idToken
      });

      if (isApiSuccess(response)) {
        console.log('Google login successful:', response.data);
        router.push('/onboarding');
      } else {
        setError('Google authentication failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
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
          bgcolor: 'white',
          borderRadius: 4,
          p: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>

          {/* Header with Avatar */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: '#6B46C1',
                mx: 'auto',
                mb: 2,
                fontSize: '1.8rem'
              }}
            >
              📱
            </Avatar>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#2c3e50',
                mb: 1
              }}
            >
              Meme to Money
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                fontSize: '0.9rem'
              }}
            >
              Turn Memes into Money
            </Typography>
          </Box>

          {/* Welcome Message */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#374151',
                fontWeight: 600,
                mb: 1
              }}
            >
              Welcome back
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280'
              }}
            >
              Sign in to continue to app
            </Typography>
          </Box>

          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  flex: 1
                },
                '& .Mui-selected': {
                  color: '#6B46C1 !important'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#6B46C1'
                }
              }}
            >
              <Tab label="Login" />
              <Tab label="Sign Up" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.85rem' }}>
              {error}
            </Alert>
          )}

          {/* Google Continue Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleAuth}
            disabled={loading}
            sx={{
              mb: 3,
              py: 1.8,
              borderColor: '#E5E7EB',
              color: '#374151',
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              borderRadius: 2,
              background: '#4285F4',
              color: 'white',
              border: 'none',
              '&:hover': {
                background: '#3367D6',
                border: 'none'
              },
            }}
            startIcon={<GoogleIcon sx={{ color: 'white' }} />}
          >
            Continue with Google
          </Button>

          {/* Login Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box component="form" onSubmit={handleLogin}>
              <Typography
                variant="body2"
                sx={{
                  color: '#374151',
                  mb: 1,
                  fontWeight: 500
                }}
              >
                Email
              </Typography>
              <TextField
                fullWidth
                name="emailOrMobile"
                type="email"
                value={loginData.emailOrMobile}
                onChange={handleLoginChange}
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.95rem'
                  }
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: '#374151',
                  mb: 1,
                  fontWeight: 500
                }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.95rem'
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)',
                    boxShadow: 'none'
                  },
                }}
              >
                {loading ? 'Signing In...' : 'Login'}
              </Button>
            </Box>
          </TabPanel>

          {/* Signup Tab */}
          <TabPanel value={activeTab} index={1}>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                mb: 2,
                textAlign: 'center'
              }}
            >
              Create your account
            </Typography>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleAuth}
              disabled={loading}
              sx={{
                mb: 3,
                py: 1.8,
                borderColor: '#E5E7EB',
                color: '#374151',
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                borderRadius: 2,
                background: '#4285F4',
                color: 'white',
                border: 'none',
                '&:hover': {
                  background: '#3367D6',
                  border: 'none'
                },
              }}
              startIcon={<GoogleIcon sx={{ color: 'white' }} />}
            >
              Sign up with Google
            </Button>

            <Box component="form" onSubmit={handleSignup}>
              <Typography
                variant="body2"
                sx={{
                  color: '#374151',
                  mb: 1,
                  fontWeight: 500
                }}
              >
                Name
              </Typography>
              <TextField
                fullWidth
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.95rem'
                  }
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: '#374151',
                  mb: 1,
                  fontWeight: 500
                }}
              >
                Username
              </Typography>
              <TextField
                fullWidth
                name="username"
                value={signupData.username}
                onChange={handleSignupChange}
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.95rem'
                  }
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: '#374151',
                  mb: 1,
                  fontWeight: 500
                }}
              >
                Email
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                value={signupData.email}
                onChange={handleSignupChange}
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.95rem'
                  }
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: '#374151',
                  mb: 1,
                  fontWeight: 500
                }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                name="password"
                type="password"
                value={signupData.password}
                onChange={handleSignupChange}
                required
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.95rem'
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
                    boxShadow: 'none'
                  },
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>
          </TabPanel>
        </Box>
      </Container>
    </Box>
  );
}