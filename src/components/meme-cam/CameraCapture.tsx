'use client';

import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import {
  Box,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import {
  CameraAlt as CaptureIcon,
  Cameraswitch as SwitchCameraIcon,
  PhotoLibrary as GalleryIcon,
  Close as CloseIcon,
  AddPhotoAlternate as PickPhotoIcon,
} from '@mui/icons-material';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleGalleryPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) onCapture(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraError = () => {
    setCameraError(true);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: '#000',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          pt: 'calc(env(safe-area-inset-top) + 12px)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}>
          <CloseIcon />
        </IconButton>
        <Typography
          variant="subtitle1"
          sx={{ color: 'white', fontWeight: 700, letterSpacing: 1 }}
        >
          MEME CAM
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      {/* Camera view or fallback */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!cameraError ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            videoConstraints={{
              facingMode,
              width: { ideal: 1080 },
              height: { ideal: 1080 },
            }}
            onUserMedia={() => setCameraReady(true)}
            onUserMediaError={handleCameraError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            mirrored={facingMode === 'user'}
          />
        ) : (
          /* Camera not available - show full-screen gallery picker */
          <Box
            sx={{
              textAlign: 'center',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <PickPhotoIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>

            <Box>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                Pick a Photo
              </Typography>
              <Typography variant="body1" sx={{ color: '#9CA3AF', mb: 1 }}>
                Camera not available on this device.
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                Choose a photo from your gallery to create a meme!
              </Typography>
            </Box>

            {/* Big Gallery Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<GalleryIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                color: 'white',
                px: 5,
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1.1rem',
                boxShadow: '0 8px 24px rgba(107, 70, 193, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)',
                },
              }}
            >
              Choose from Gallery
            </Button>

            <Typography variant="caption" sx={{ color: '#6B7280', mt: 1 }}>
              Supports JPG, PNG, GIF, WebP
            </Typography>
          </Box>
        )}
      </Box>

      {/* Bottom controls - shown when camera is available */}
      {!cameraError && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            p: 3,
            pb: 'calc(env(safe-area-inset-bottom) + 24px)',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          }}
        >
          {/* Gallery button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.15)',
                width: 48,
                height: 48,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              <GalleryIcon />
            </IconButton>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem' }}>
              Gallery
            </Typography>
          </Box>

          {/* Capture button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              onClick={capture}
              sx={{
                width: 76,
                height: 76,
                background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                border: '4px solid rgba(255,255,255,0.4)',
                boxShadow: '0 8px 24px rgba(107, 70, 193, 0.5)',
                transition: 'all 0.15s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)',
                },
                '&:active': {
                  transform: 'scale(0.9)',
                },
              }}
            >
              <CaptureIcon sx={{ color: 'white', fontSize: 36 }} />
            </IconButton>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem' }}>
              Capture
            </Typography>
          </Box>

          {/* Switch camera button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              onClick={toggleCamera}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.15)',
                width: 48,
                height: 48,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              <SwitchCameraIcon />
            </IconButton>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem' }}>
              Flip
            </Typography>
          </Box>
        </Box>
      )}

      {/* Hidden file input for gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryPick}
        style={{ display: 'none' }}
      />
    </Box>
  );
}
