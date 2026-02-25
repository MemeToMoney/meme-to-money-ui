'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Share as ShareNativeIcon,
  WhatsApp as WhatsAppIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Telegram as TelegramIcon,
} from '@mui/icons-material';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  contentId: string;
  title?: string;
}

export default function ShareDialog({ open, onClose, contentId, title }: ShareDialogProps) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/post/${contentId}`
    : '';
  const shareText = title || 'Check out this meme on MemeToMoney!';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSnackbar({ open: true, message: 'Link copied!' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to copy link' });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl });
        onClose();
      } catch {
        // User cancelled or error
      }
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    onClose();
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    onClose();
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    onClose();
  };

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    onClose();
  };

  const shareOptions = [
    { label: 'Copy Link', icon: <CopyIcon />, color: '#6B7280', onClick: handleCopyLink },
    ...(typeof navigator !== 'undefined' && 'share' in navigator
      ? [{ label: 'More', icon: <ShareNativeIcon />, color: '#6B46C1', onClick: handleNativeShare }]
      : []),
    { label: 'WhatsApp', icon: <WhatsAppIcon />, color: '#25D366', onClick: handleWhatsApp },
    { label: 'Twitter', icon: <TwitterIcon />, color: '#1DA1F2', onClick: handleTwitter },
    { label: 'Facebook', icon: <FacebookIcon />, color: '#1877F2', onClick: handleFacebook },
    { label: 'Telegram', icon: <TelegramIcon />, color: '#0088CC', onClick: handleTelegram },
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: isMobile ? '16px 16px 0 0' : 3,
            position: isMobile ? 'fixed' : 'relative',
            bottom: isMobile ? 0 : 'auto',
            m: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Share</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: 2, py: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {shareOptions.map((option) => (
              <Box
                key={option.label}
                onClick={option.onClick}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  p: 1.5,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#F3F4F6' },
                }}
              >
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: `${option.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: option.color,
                }}>
                  {option.icon}
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151' }}>
                  {option.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
