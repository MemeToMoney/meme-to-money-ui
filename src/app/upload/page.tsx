'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Card,
  CardMedia,
  Avatar,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogContent,
  LinearProgress,
  Alert,
  Snackbar,
  Fab,
  Slide,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as UploadIcon,
  PhotoCamera as PhotoIcon,
  Videocam as VideoIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Public as PublicIcon,
  CurrencyRupee as MonetizationIcon,
  Add as AddIcon,
  Tag as TagIcon,
  Schedule as ScheduleIcon,
  AutoFixHigh as TemplateIcon,
  Loop as RemixIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI, Content, UploadUrlRequest, ContentCreationRequest } from '@/lib/api/content';
import { UserAPI } from '@/lib/api/user';
import { isApiSuccess, TokenManager, formatCreatorHandle } from '@/lib/api/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface UploadStep {
  label: string;
  completed: boolean;
}

function UploadPageContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'MEME' | 'SHORT_VIDEO' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hashtags: '',
    monetizationEnabled: true
  });

  const [steps] = useState<UploadStep[]>([
    { label: 'Choose Content', completed: false },
    { label: 'Add Details', completed: false },
    { label: 'Upload & Share', completed: false },
  ]);

  // Remix state
  const [remixOfId, setRemixOfId] = useState<string | null>(null);
  const [remixOriginal, setRemixOriginal] = useState<Content | null>(null);

  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load remix original content if remix param is present
  useEffect(() => {
    const remixId = searchParams.get('remix');
    if (remixId) {
      setRemixOfId(remixId);
      ContentAPI.getContent(remixId).then(res => {
        if (isApiSuccess(res) && res.data) {
          setRemixOriginal(res.data);
        }
      }).catch(() => {});
    }
  }, [searchParams]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      showSnackbar('File size must be less than 100MB', 'error');
      return;
    }

    // Determine content type
    let type: 'MEME' | 'SHORT_VIDEO';
    if (file.type.startsWith('image/')) {
      type = 'MEME';
    } else if (file.type.startsWith('video/')) {
      type = 'SHORT_VIDEO';
    } else {
      showSnackbar('Only images and videos are supported', 'error');
      return;
    }

    setSelectedFile(file);
    setContentType(type);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);

    // Auto-advance to next step
    setCurrentStep(1);
  };

  const handleUpload = async () => {
    // Validation
    if (!selectedFile) {
      showSnackbar('Please select a file first', 'error');
      return;
    }

    if (!user?.id) {
      showSnackbar('User not authenticated', 'error');
      return;
    }

    if (!contentType) {
      showSnackbar('Content type not determined', 'error');
      return;
    }

    // Validate schedule time if scheduling
    if (isScheduled) {
      if (!scheduledAt) {
        showSnackbar('Please select a date and time for scheduling', 'error');
        return;
      }
      const scheduleDate = new Date(scheduledAt);
      if (scheduleDate <= new Date()) {
        showSnackbar('Scheduled time must be in the future', 'error');
        return;
      }
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Step 1: Upload file to server (Server-Side Upload)
      // We use server-side upload to bypass GCS CORS issues with private buckets
      const uploadResponse = await ContentAPI.uploadFile(selectedFile);

      if (!isApiSuccess(uploadResponse)) {
        throw new Error((uploadResponse as any).message || 'Failed to upload file');
      }

      const proxyUrl = uploadResponse.data;
      // Extract filename from proxy URL: /api/images/view?fileName=...
      const s3Key = proxyUrl.split('fileName=')[1];

      if (!s3Key) {
        throw new Error('Failed to get file key from upload response');
      }

      setUploadProgress(100);

      // Step 2: Create content record
      // We need a contentId first, so we generate one or let the backend handle it.
      // The createContent API expects a contentId in the URL params usually, 
      // but here we are creating NEW content.
      // Let's generate a UUID for contentId
      const contentId = crypto.randomUUID();

      const contentRequest: ContentCreationRequest & { scheduledAt?: string } = {
        title: formData.title.trim() || `My ${contentType === 'SHORT_VIDEO' ? 'Short' : 'Meme'} ${new Date().toLocaleDateString()}`,
        description: formData.description || undefined,
        type: contentType,
        hashtags: formData.hashtags
          ? formData.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          : [],
        monetizationEnabled: formData.monetizationEnabled,
        s3Key: s3Key,
        originalFileName: selectedFile.name,
        contentType: selectedFile.type,
        fileSize: selectedFile.size,
        durationSeconds: contentType === 'SHORT_VIDEO' ? await getVideoDuration(selectedFile) : undefined,
        ...(isScheduled && scheduledAt ? { scheduledAt: new Date(scheduledAt).toISOString() } : {}),
        ...(remixOfId ? { remixOfId } : {}),
      };

      const contentResponse = await ContentAPI.createContent(
        contentId,
        contentRequest,
        user.id,
        user.creatorHandle || user.displayName || user.name || user.username
      );

      if (!isApiSuccess(contentResponse)) {
        throw new Error((contentResponse as any).message || 'Failed to create content');
      }

      setUploadProgress(100);

      // Update posting streak (fire and forget - don't block on failure)
      if (!isScheduled) {
        UserAPI.updateStreak().catch((err) => {
          console.error('Failed to update streak:', err);
        });
      }

      showSnackbar(isScheduled ? 'Post scheduled successfully!' : 'Content uploaded successfully!', 'success');

      // Advance to final step
      setCurrentStep(2);

      // Navigate after delay
      setTimeout(() => {
        router.push(isScheduled ? '/scheduled' : '/feed');
      }, 2000);

    } catch (error: any) {
      console.error('Upload failed:', error);
      showSnackbar(error.message || 'Upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        resolve(0);
      }, 10000);

      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        const duration = video.duration;
        URL.revokeObjectURL(objectUrl);
        resolve(isFinite(duration) ? duration : 0);
      };
      video.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
        resolve(0);
      };
      video.src = objectUrl;
    });
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setContentType(null);
    setCurrentStep(0);
    setUploadProgress(0);
    setIsScheduled(false);
    setScheduledAt('');
    setFormData({
      title: '',
      description: '',
      hashtags: '',
      monetizationEnabled: true
    });
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ bgcolor: 'white', color: '#333' }} elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6B46C1' }}>
            Create Post
          </Typography>

          {selectedFile && (
            <Button
              onClick={resetUpload}
              sx={{ color: '#6B46C1', textTransform: 'none' }}
            >
              Reset
            </Button>
          )}
        </Toolbar>

        {/* Progress Steps */}
        <Box sx={{ px: 2, pb: 1 }}>
          <Stepper activeStep={currentStep} sx={{ mb: 2 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.75rem',
                      color: index <= currentStep ? '#6B46C1' : '#6B7280'
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </AppBar>

      {/* Remix badge */}
      {remixOriginal && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Chip
            icon={<RemixIcon sx={{ fontSize: 18 }} />}
            label={`Remixing ${formatCreatorHandle(remixOriginal.creatorHandle)}'s meme`}
            sx={{
              bgcolor: '#F3F4F6',
              color: '#6B46C1',
              fontWeight: 600,
              fontSize: '0.85rem',
              py: 0.5,
            }}
          />
        </Box>
      )}

      {/* Content */}
      <Container maxWidth={false} sx={{ flex: 1, p: 0 }}>
        {/* Step 1: File Selection */}
        {currentStep === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
              What would you like to share?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Choose photos or videos to create your post
            </Typography>

            {/* Upload Options */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
              <Card
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 4,
                  minWidth: 120,
                  cursor: 'pointer',
                  borderRadius: 3,
                  border: '2px dashed #6B46C1',
                  bgcolor: 'rgba(107, 70, 193, 0.04)',
                  '&:hover': { bgcolor: 'rgba(107, 70, 193, 0.08)' }
                }}
              >
                <PhotoIcon sx={{ fontSize: 48, color: '#6B46C1', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Photo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG, GIF
                </Typography>
              </Card>

              <Card
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 4,
                  minWidth: 120,
                  cursor: 'pointer',
                  borderRadius: 3,
                  border: '2px dashed #6B46C1',
                  bgcolor: 'rgba(107, 70, 193, 0.04)',
                  '&:hover': { bgcolor: 'rgba(107, 70, 193, 0.08)' }
                }}
              >
                <VideoIcon sx={{ fontSize: 48, color: '#6B46C1', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Video
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  MP4, WebM
                </Typography>
              </Card>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Maximum file size: 100MB
            </Typography>

            {/* Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, px: 2 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: '#E5E7EB' }} />
              <Typography variant="caption" sx={{ px: 2, color: '#9CA3AF', fontWeight: 600 }}>
                OR
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: '#E5E7EB' }} />
            </Box>

            {/* Use Template button */}
            <Button
              variant="outlined"
              startIcon={<TemplateIcon />}
              onClick={() => router.push('/meme-cam')}
              sx={{
                borderColor: '#6B46C1',
                color: '#6B46C1',
                textTransform: 'none',
                borderRadius: 3,
                py: 1.5,
                px: 4,
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': {
                  borderColor: '#553C9A',
                  bgcolor: '#FAF5FF',
                },
              }}
            >
              Use Meme Template
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Create memes with templates, stickers, sounds & more
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </Box>
        )}

        {/* Step 2: Content Details */}
        {currentStep === 1 && selectedFile && (
          <Box sx={{ p: 3 }}>
            {/* File Preview */}
            <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
              {contentType === 'MEME' ? (
                <CardMedia
                  component="img"
                  image={previewUrl || ''}
                  alt="Preview"
                  sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', bgcolor: '#000' }}
                />
              ) : (
                <Box sx={{ position: 'relative', bgcolor: '#000' }}>
                  <video
                    ref={videoRef}
                    src={previewUrl || ''}
                    controls
                    style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
                  />
                </Box>
              )}

              <Box sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="caption" color="text.secondary">
                  {selectedFile.name} • {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            </Card>

            {/* Form Fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                placeholder="Write a caption..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3
                  }
                }}
              />

              <TextField
                fullWidth
                placeholder="Add hashtags (comma separated)"
                value={formData.hashtags}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                variant="outlined"
                InputProps={{
                  startAdornment: <TagIcon sx={{ mr: 1, color: '#6B7280' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3
                  }
                }}
                helperText="Example: funny, viral, trending"
              />

              {/* Monetization Toggle */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #E5E7EB'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MonetizationIcon sx={{ color: '#6B46C1' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Enable Tips
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Allow viewers to tip you
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={formData.monetizationEnabled ? 'ON' : 'OFF'}
                  color={formData.monetizationEnabled ? 'success' : 'default'}
                  onClick={() => setFormData({ ...formData, monetizationEnabled: !formData.monetizationEnabled })}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>

              {/* Schedule Toggle */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #E5E7EB'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ScheduleIcon sx={{ color: '#6B46C1' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Schedule Post
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Publish at a later date & time
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={isScheduled ? 'ON' : 'OFF'}
                  color={isScheduled ? 'success' : 'default'}
                  onClick={() => {
                    setIsScheduled(!isScheduled);
                    if (isScheduled) setScheduledAt('');
                  }}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>

              {/* Date/Time Picker (shown when schedule is ON) */}
              {isScheduled && (
                <TextField
                  fullWidth
                  label="Schedule Date & Time"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: new Date(Date.now() + 60000).toISOString().slice(0, 16),
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3
                    }
                  }}
                  helperText="Select a future date and time for your post to go live"
                />
              )}
            </Box>

            {/* Upload / Schedule Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || (isScheduled && !scheduledAt)}
              startIcon={isUploading ? null : (isScheduled ? <ScheduleIcon /> : <UploadIcon />)}
              sx={{
                mt: 3,
                py: 2,
                bgcolor: '#6B46C1',
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#553C9A' },
                '&.Mui-disabled': {
                  bgcolor: '#E5E7EB',
                  color: '#6B7280'
                }
              }}
            >
              {isUploading ? (isScheduled ? 'Scheduling...' : 'Uploading...') : (isScheduled ? 'Schedule Post' : 'Share Post')}
            </Button>
          </Box>
        )}

        {/* Step 3: Success */}
        {currentStep === 2 && (
          <Box sx={{ p: 3, textAlign: 'center', mt: 8 }}>
            {isScheduled ? (
              <ScheduleIcon sx={{ fontSize: 80, color: '#10B981', mb: 2 }} />
            ) : (
              <CheckIcon sx={{ fontSize: 80, color: '#10B981', mb: 2 }} />
            )}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              {isScheduled ? 'Scheduled Successfully!' : 'Posted Successfully!'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {isScheduled ? 'Your post will go live at the scheduled time.' : 'Your content is now live and ready to earn!'}
            </Typography>

            <Button
              variant="outlined"
              onClick={() => router.push('/profile')}
              sx={{
                borderColor: '#6B46C1',
                color: '#6B46C1',
                textTransform: 'none',
                borderRadius: 3,
                mr: 2
              }}
            >
              View Profile
            </Button>

            <Button
              variant="contained"
              onClick={() => router.push('/feed')}
              sx={{
                bgcolor: '#6B46C1',
                textTransform: 'none',
                borderRadius: 3,
                '&:hover': { bgcolor: '#553C9A' }
              }}
            >
              Back to Feed
            </Button>
          </Box>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <Box sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'white',
            p: 3,
            borderTop: '1px solid #E5E7EB',
            zIndex: 1000
          }}>
            <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
              Uploading... {Math.round(uploadProgress)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#6B46C1'
                }
              }}
            />
          </Box>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function UploadPageInner() {
  return (
    <ProtectedRoute>
      <UploadPageContent />
    </ProtectedRoute>
  );
}

export default function UploadPage() {
  return (
    <Suspense>
      <UploadPageInner />
    </Suspense>
  );
}