'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  MonetizationOn as MonetizationIcon,
  Add as AddIcon,
  Tag as TagIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI, UploadUrlRequest, ContentCreationRequest } from '@/lib/api/content';
import { isApiSuccess, TokenManager } from '@/lib/api/client';
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

  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);

    if (!file) {
      console.log('No file selected');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      showSnackbar('File size must be less than 50MB', 'error');
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

    console.log('Setting file state:', { name: file.name, type: file.type, contentType: type });

    setSelectedFile(file);
    setContentType(type);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('Preview URL created:', !!result);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);

    // Auto-advance to next step
    setCurrentStep(1);
  };

  const handleUpload = async () => {
    console.log('Upload attempt starting:', {
      hasSelectedFile: !!selectedFile,
      selectedFileName: selectedFile?.name,
      userId: user?.id,
      contentType,
      title: formData.title.trim(),
      currentStep
    });

    // More robust validation with detailed logging
    if (!selectedFile) {
      console.error('Upload validation failed: No file selected');
      showSnackbar('Please select a file first', 'error');
      return;
    }

    if (!user?.id) {
      console.error('Upload validation failed: User not authenticated');
      showSnackbar('User not authenticated', 'error');
      return;
    }

    if (!contentType) {
      console.error('Upload validation failed: Content type not determined');
      showSnackbar('Content type not determined', 'error');
      return;
    }

    if (!formData.title.trim()) {
      console.error('Upload validation failed: No caption provided');
      showSnackbar('Please add a caption for your content', 'error');
      return;
    }

    console.log('All validations passed, starting upload process...');

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Step 1: Upload file to server (Server-Side Upload)
      // We use server-side upload to bypass GCS CORS issues with private buckets
      const uploadResponse = await ContentAPI.uploadFile(selectedFile);

      if (!isApiSuccess(uploadResponse)) {
        throw new Error(uploadResponse.message || 'Failed to upload file');
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

      const contentRequest: ContentCreationRequest = {
        title: formData.title,
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
        durationSeconds: contentType === 'SHORT_VIDEO' ? await getVideoDuration(selectedFile) : undefined
      };

      const contentResponse = await ContentAPI.createContent(
        contentId,
        contentRequest,
        user.id
      );

      if (!isApiSuccess(contentResponse)) {
        throw new Error(contentResponse.message || 'Failed to create content');
      }

      setUploadProgress(100);
      showSnackbar('Content uploaded successfully! 🎉', 'success');

      // Advance to final step
      setCurrentStep(2);

      // Navigate back to feed after delay
      setTimeout(() => {
        router.push('/feed');
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
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setContentType(null);
    setCurrentStep(0);
    setUploadProgress(0);
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

            <Typography variant="body2" color="text.secondary">
              Maximum file size: 50MB
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
            </Box>

            {/* Upload Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={!selectedFile || !formData.title.trim() || isUploading}
              startIcon={isUploading ? null : <UploadIcon />}
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
              {isUploading ? 'Uploading...' : 'Share Post'}
            </Button>
          </Box>
        )}

        {/* Step 3: Success */}
        {currentStep === 2 && (
          <Box sx={{ p: 3, textAlign: 'center', mt: 8 }}>
            <CheckIcon sx={{ fontSize: 80, color: '#10B981', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              Posted Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Your content is now live and ready to earn!
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

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadPageContent />
    </ProtectedRoute>
  );
}