'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PhotoCamera as CameraIcon,
  Language as WebIcon,
  Link as LinkIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthAPI } from '@/lib/api/auth';
import { isApiSuccess } from '@/lib/api/client';
import { UserAPI } from '@/lib/api/user';

const BIO_MAX = 150;
const NAME_MAX = 50;
const HANDLE_MAX = 30;
const HANDLE_MIN = 3;
const HANDLE_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const DEBOUNCE_MS = 500;

function EditProfileContent() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Handle availability state
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [handleError, setHandleError] = useState('');
  const handleCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const [form, setForm] = useState({
    displayName: '',
    username: '',
    bio: '',
    mobileNumber: '',
    creatorHandle: '',
    website: '',
    isContentCreator: false,
    isPrivateAccount: false,
    socialLinks: { instagram: '', twitter: '', youtube: '' } as { [key: string]: string },
  });

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName || user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        mobileNumber: user.mobileNumber ? String(user.mobileNumber) : '',
        creatorHandle: user.creatorHandle || '',
        website: user.website || '',
        isContentCreator: user.isContentCreator || false,
        isPrivateAccount: user.isPrivateAccount || false,
        socialLinks: {
          instagram: user.socialLinks?.instagram || '',
          twitter: user.socialLinks?.twitter || '',
          youtube: user.socialLinks?.youtube || '',
        },
      });
    }
  }, [user]);

  // Debounced handle availability check
  const checkHandleAvailability = useCallback((handle: string) => {
    // Clear any pending check
    if (handleCheckTimeout.current) {
      clearTimeout(handleCheckTimeout.current);
    }

    // If handle is the same as the current user's handle, it's fine
    if (handle === user?.creatorHandle) {
      setHandleStatus('idle');
      setHandleError('');
      return;
    }

    // If handle is empty, reset
    if (!handle.trim()) {
      setHandleStatus('idle');
      setHandleError('');
      return;
    }

    // Client-side validation first
    if (handle.length < HANDLE_MIN) {
      setHandleStatus('invalid');
      setHandleError('Handle must be at least 3 characters');
      return;
    }

    if (handle.length > HANDLE_MAX) {
      setHandleStatus('invalid');
      setHandleError('Handle must be at most 30 characters');
      return;
    }

    if (!HANDLE_REGEX.test(handle)) {
      setHandleStatus('invalid');
      setHandleError('Only letters, numbers, and underscores allowed');
      return;
    }

    // Set checking state and debounce the API call
    setHandleStatus('checking');
    setHandleError('');

    handleCheckTimeout.current = setTimeout(async () => {
      try {
        const response = await UserAPI.checkHandleAvailability(handle);
        if (isApiSuccess(response)) {
          const { available, valid, reason } = response.data;
          if (!valid) {
            setHandleStatus('invalid');
            setHandleError(reason || 'Invalid handle format');
          } else if (available) {
            setHandleStatus('available');
            setHandleError('');
          } else {
            setHandleStatus('taken');
            setHandleError(reason || 'This handle is already taken');
          }
        } else {
          setHandleStatus('idle');
          setHandleError('');
        }
      } catch {
        setHandleStatus('idle');
        setHandleError('');
      }
    }, DEBOUNCE_MS);
  }, [user?.creatorHandle]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (handleCheckTimeout.current) {
        clearTimeout(handleCheckTimeout.current);
      }
    };
  }, []);

  const handleCreatorHandleChange = (value: string) => {
    // Only allow valid characters: letters, numbers, underscores
    const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, HANDLE_MAX);
    setForm({ ...form, creatorHandle: sanitized });
    checkHandleAvailability(sanitized);
  };

  const getHandleHelperText = () => {
    if (handleStatus === 'checking') return 'Checking availability...';
    if (handleStatus === 'available') return 'This handle is available!';
    if (handleStatus === 'taken') return handleError;
    if (handleStatus === 'invalid') return handleError;
    return `Your unique handle (${form.creatorHandle.length}/${HANDLE_MAX}). Letters, numbers, and underscores only.`;
  };

  const getHandleColor = (): 'success' | 'error' | undefined => {
    if (handleStatus === 'available') return 'success';
    if (handleStatus === 'taken' || handleStatus === 'invalid') return 'error';
    return undefined;
  };

  const getHandleEndAdornment = () => {
    if (handleStatus === 'checking') {
      return (
        <InputAdornment position="end">
          <CircularProgress size={18} sx={{ color: '#9CA3AF' }} />
        </InputAdornment>
      );
    }
    if (handleStatus === 'available') {
      return (
        <InputAdornment position="end">
          <CheckIcon sx={{ color: '#16A34A', fontSize: 20 }} />
        </InputAdornment>
      );
    }
    if (handleStatus === 'taken' || handleStatus === 'invalid') {
      return (
        <InputAdornment position="end">
          <CancelIcon sx={{ color: '#DC2626', fontSize: 20 }} />
        </InputAdornment>
      );
    }
    return null;
  };

  const handleSave = async () => {
    if (!user?.id) return;

    // Prevent save if handle is taken or invalid
    if (handleStatus === 'taken' || handleStatus === 'invalid') {
      setSnackbar({ open: true, message: 'Please fix the handle before saving', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Filter out empty social links
      const socialLinks: { [key: string]: string } = {};
      Object.entries(form.socialLinks).forEach(([k, v]) => {
        if (v.trim()) socialLinks[k] = v.trim();
      });

      const response = await AuthAPI.updateProfile({
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        bio: form.bio.trim(),
        mobileNumber: form.mobileNumber.trim() ? Number(form.mobileNumber.trim()) : undefined,
        creatorHandle: form.creatorHandle.trim() || undefined,
        website: form.website.trim(),
        isContentCreator: form.isContentCreator,
        isPrivateAccount: form.isPrivateAccount,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      });

      if (isApiSuccess(response)) {
        updateUser(response.data);
        setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
        setTimeout(() => router.back(), 800);
      } else {
        setSnackbar({ open: true, message: (response as any).message || 'Failed to update', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      setSnackbar({ open: true, message: 'Please select an image file', severity: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'Max file size is 5MB', severity: 'error' });
      return;
    }

    setUploading(true);
    try {
      const response = await AuthAPI.uploadProfilePicture(file);
      if (isApiSuccess(response)) {
        const userResponse = await AuthAPI.getCurrentUser();
        if (isApiSuccess(userResponse)) {
          updateUser(userResponse.data);
          setSnackbar({ open: true, message: 'Photo updated!', severity: 'success' });
        }
      } else {
        setSnackbar({ open: true, message: 'Upload failed', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Upload failed', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const getProfilePictureUrl = (pic?: string) => {
    if (!pic) return undefined;
    if (pic.startsWith('http')) return `${pic}${pic.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const base = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8080';
    return `${base}${pic.startsWith('/') ? pic : `/${pic}`}?t=${Date.now()}`;
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#6B46C1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      {/* Header */}
      <Box sx={{
        position: 'sticky', top: 0, bgcolor: 'white', zIndex: 10,
        p: 2, borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => router.back()}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Profile</Typography>
        </Box>
        <Button
          onClick={handleSave}
          disabled={loading || handleStatus === 'taken' || handleStatus === 'invalid' || handleStatus === 'checking'}
          variant="contained"
          sx={{
            bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 2,
            fontWeight: 600, px: 3,
            '&:hover': { bgcolor: '#553C9A' },
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save'}
        </Button>
      </Box>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {/* Profile Picture */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative', mb: 1 }}>
            <Avatar
              src={getProfilePictureUrl(user.profilePicture)}
              sx={{
                width: 100, height: 100, bgcolor: '#6B46C1', fontSize: '2.5rem',
                border: '3px solid white', boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }}
            >
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            {uploading && (
              <Box sx={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '50%',
              }}>
                <CircularProgress size={32} sx={{ color: 'white' }} />
              </Box>
            )}
          </Box>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} />
          <Button
            onClick={() => fileInputRef.current?.click()}
            startIcon={<CameraIcon />}
            disabled={uploading}
            sx={{ textTransform: 'none', color: '#6B46C1', fontWeight: 600 }}
          >
            Change Photo
          </Button>
        </Box>

        {/* Basic Info */}
        <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 3, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#374151' }}>Basic Info</Typography>

          <TextField
            fullWidth
            label="Display Name"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value.slice(0, NAME_MAX) })}
            margin="dense"
            helperText={`${form.displayName.length}/${NAME_MAX}`}
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.replace(/[^a-zA-Z0-9._]/g, '').slice(0, HANDLE_MAX) })}
            margin="dense"
            helperText="Letters, numbers, dots and underscores only"
            InputProps={{ startAdornment: <Typography sx={{ color: '#9CA3AF', mr: 0.5 }}>@</Typography> }}
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, BIO_MAX) })}
            margin="dense"
            multiline
            rows={3}
            helperText={`${form.bio.length}/${BIO_MAX}`}
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Mobile Number"
            value={form.mobileNumber}
            onChange={(e) => setForm({ ...form, mobileNumber: e.target.value.replace(/[^0-9]/g, '').slice(0, 15) })}
            margin="dense"
            type="tel"
            placeholder="Enter your mobile number"
            helperText="Your mobile number (optional)"
          />
        </Box>

        {/* Privacy Settings */}
        <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 3, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#374151' }}>Privacy</Typography>

          <FormControlLabel
            control={
              <Switch
                checked={form.isPrivateAccount}
                onChange={(e) => setForm({ ...form, isPrivateAccount: e.target.checked })}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#6B46C1' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6B46C1' } }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Private Account</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>Only approved followers can see your posts</Typography>
              </Box>
            }
          />
        </Box>

        {/* Handle */}
        <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 3, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#374151' }}>Handle</Typography>
          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 2 }}>
            Your unique handle is auto-generated on signup. You can customize it below.
          </Typography>

          <TextField
            fullWidth
            label="Handle"
            value={form.creatorHandle}
            onChange={(e) => handleCreatorHandleChange(e.target.value)}
            margin="dense"
            color={getHandleColor()}
            focused={handleStatus === 'available' || handleStatus === 'taken' || handleStatus === 'invalid'}
            error={handleStatus === 'taken' || handleStatus === 'invalid'}
            helperText={getHandleHelperText()}
            FormHelperTextProps={{
              sx: {
                color: handleStatus === 'available' ? '#16A34A' :
                       handleStatus === 'taken' || handleStatus === 'invalid' ? '#DC2626' :
                       undefined,
              }
            }}
            InputProps={{
              startAdornment: <Typography sx={{ color: '#9CA3AF', mr: 0.5 }}>@</Typography>,
              endAdornment: getHandleEndAdornment(),
            }}
          />
        </Box>

        {/* Links */}
        <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 3, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#374151' }}>Links</Typography>

          <TextField
            fullWidth
            label="Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            margin="dense"
            placeholder="https://yourwebsite.com"
            InputProps={{ startAdornment: <WebIcon sx={{ color: '#9CA3AF', mr: 1 }} /> }}
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Instagram"
            value={form.socialLinks.instagram}
            onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })}
            margin="dense"
            placeholder="https://instagram.com/yourhandle"
            InputProps={{ startAdornment: <LinkIcon sx={{ color: '#E4405F', mr: 1 }} /> }}
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Twitter / X"
            value={form.socialLinks.twitter}
            onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })}
            margin="dense"
            placeholder="https://twitter.com/yourhandle"
            InputProps={{ startAdornment: <LinkIcon sx={{ color: '#1DA1F2', mr: 1 }} /> }}
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="YouTube"
            value={form.socialLinks.youtube}
            onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, youtube: e.target.value } })}
            margin="dense"
            placeholder="https://youtube.com/@yourchannel"
            InputProps={{ startAdornment: <LinkIcon sx={{ color: '#FF0000', mr: 1 }} /> }}
          />
        </Box>

        {/* Creator Settings */}
        <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 3, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#374151' }}>Creator Settings</Typography>

          <FormControlLabel
            control={
              <Switch
                checked={form.isContentCreator}
                onChange={(e) => setForm({ ...form, isContentCreator: e.target.checked })}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#6B46C1' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6B46C1' } }}
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>I am a content creator</Typography>}
          />
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfileContent />
    </ProtectedRoute>
  );
}
