'use client';

import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthAPI } from '@/lib/api/auth';
import { isApiSuccess } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await AuthAPI.forgotPassword(email);
      if (isApiSuccess(response)) {
        setStep('otp');
        setSuccess('Verification code sent to your email');
      } else {
        setError((response as any).message || 'Failed to send verification code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setStep('newPassword');
    setSuccess('');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await AuthAPI.resetPassword(email, otp, newPassword);
      if (isApiSuccess(response)) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError((response as any).message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
      <Container maxWidth="sm" sx={{ maxWidth: '428px !important', px: 3, py: 4 }}>
        <Box sx={{
          bgcolor: 'white',
          borderRadius: 4,
          p: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => step === 'email' ? router.back() : setStep('email')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
              Forgot Password
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {step === 'email' && (
            <Box component="form" onSubmit={handleSendOtp}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                Enter your email address and we'll send you a verification code to reset your password.
              </Typography>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': { background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)' },
                }}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </Box>
          )}

          {step === 'otp' && (
            <Box component="form" onSubmit={handleVerifyOtp}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                Enter the 6-digit verification code sent to {email}
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': { background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)' },
                }}
              >
                Verify Code
              </Button>
              <Button
                fullWidth
                onClick={handleSendOtp}
                disabled={loading}
                sx={{ mt: 1, textTransform: 'none', color: '#6B46C1' }}
              >
                Resend Code
              </Button>
            </Box>
          )}

          {step === 'newPassword' && (
            <Box component="form" onSubmit={handleResetPassword}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                Enter your new password
              </Typography>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': { background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)' },
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
