'use client';

import React, { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Konva from 'konva';
import {
  Box,
  Typography,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  CloudUpload as PostIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI, ContentCreationRequest } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import filterPresets, { FilterPreset } from '@/data/filter-presets';
import { MemeTemplate } from '@/data/meme-templates';

// Loading spinner for dynamic imports
function DynamicLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
      <CircularProgress sx={{ color: '#8B5CF6' }} />
    </Box>
  );
}

// Lazy-load heavy components
const TemplateLibrary = dynamic(() => import('@/components/meme-cam/TemplateLibrary'), {
  ssr: false,
  loading: () => <DynamicLoader />,
});
const CameraCapture = dynamic(() => import('@/components/meme-cam/CameraCapture'), {
  ssr: false,
  loading: () => <DynamicLoader />,
});
const FilterStrip = dynamic(() => import('@/components/meme-cam/FilterStrip'), { ssr: false });
const CaptionSelector = dynamic(() => import('@/components/meme-cam/CaptionSelector'), {
  ssr: false,
  loading: () => <DynamicLoader />,
});
const MemeEditor = dynamic(() => import('@/components/meme-cam/MemeEditor'), {
  ssr: false,
  loading: () => <DynamicLoader />,
});

type Step = 'TEMPLATES' | 'CAMERA' | 'FILTER' | 'CAPTION' | 'EDITOR' | 'PREVIEW';

const stepLabels: Record<Step, string> = {
  TEMPLATES: 'Create',
  CAMERA: 'Capture',
  FILTER: 'Filter',
  CAPTION: 'Caption',
  EDITOR: 'Edit',
  PREVIEW: 'Post',
};

const stepOrder: Step[] = ['TEMPLATES', 'CAMERA', 'FILTER', 'CAPTION', 'EDITOR', 'PREVIEW'];

// Generate a template image as base64 from gradient
function generateTemplateImage(template: MemeTemplate): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;

    // Draw gradient background
    if (template.bgGradient.includes('linear-gradient')) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 800);
      // Simple parsing - extract colors from gradient
      const colors = template.bgGradient.match(/#[a-fA-F0-9]{6}/g) || [template.bgColor, '#000000'];
      colors.forEach((color, i) => {
        gradient.addColorStop(i / Math.max(colors.length - 1, 1), color);
      });
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = template.bgColor;
    }
    ctx.fillRect(0, 0, 800, 800);

    // Draw split line if needed
    if (template.splitLayout) {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(0, 400);
      ctx.lineTo(800, 400);
      ctx.stroke();
    }

    resolve(canvas.toDataURL('image/jpeg', 0.9));
  });
}

function MemeCamContent() {
  const [step, setStep] = useState<Step>('TEMPLATES');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>(filterPresets[0]);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });

  const stageRef = useRef<Konva.Stage>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Template selection handler
  const handleSelectTemplate = useCallback(async (template: MemeTemplate) => {
    const img = await generateTemplateImage(template);
    setImageSrc(img);
    // Pre-fill text from template
    const topArea = template.textAreas.find(a => a.position === 'top');
    const bottomArea = template.textAreas.find(a => a.position === 'bottom');
    setTopText(topArea?.defaultText || '');
    setBottomText(bottomArea?.defaultText || '');
    // Skip filter for templates, go straight to caption
    setStep('CAPTION');
  }, []);

  const handleUseCamera = useCallback(() => {
    setStep('CAMERA');
  }, []);

  const handlePickGallery = useCallback(() => {
    galleryInputRef.current?.click();
  }, []);

  const handleGalleryFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageSrc(result);
        setStep('FILTER');
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // Step handlers
  const handleCapture = useCallback((src: string) => {
    setImageSrc(src);
    setStep('FILTER');
  }, []);

  const handleFilterSelect = useCallback((filter: FilterPreset) => {
    setSelectedFilter(filter);
  }, []);

  const handleFilterNext = () => setStep('CAPTION');
  const handleCaptionSelect = (top: string, bottom: string) => { setTopText(top); setBottomText(bottom); setStep('EDITOR'); };
  const handleCaptionSkip = () => setStep('EDITOR');
  const handleEditorDone = () => setStep('PREVIEW');

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex <= 0) {
      router.back();
    } else {
      // From CAPTION with template, go back to TEMPLATES
      if (step === 'CAPTION' && !imageSrc.startsWith('data:image/jpeg')) {
        setStep('TEMPLATES');
      } else {
        setStep(stepOrder[currentIndex - 1]);
      }
    }
  };

  // Export helpers
  const getBlob = async (): Promise<Blob | null> => {
    if (!stageRef.current) return null;
    return new Promise((resolve) => {
      stageRef.current!.toBlob({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2,
        callback: (blob: Blob | null) => resolve(blob),
      });
    });
  };

  const handleDownload = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meme-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
    showSnackbar('Meme saved to device!', 'success');
  };

  const handleShare = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], 'meme.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Check out my meme!', text: topText || bottomText || 'Made with MemeToMoney' });
      } catch (err: any) {
        if (err.name !== 'AbortError') showSnackbar('Share failed', 'error');
      }
    } else {
      handleDownload();
    }
  };

  const handlePostToFeed = async () => {
    if (!user?.id) { showSnackbar('Please log in first', 'error'); return; }
    try {
      setIsPosting(true); setUploadProgress(10);
      const blob = await getBlob();
      if (!blob) throw new Error('Failed to export meme');
      const file = new File([blob], `meme-${Date.now()}.png`, { type: 'image/png' });
      setUploadProgress(30);
      const uploadResponse = await ContentAPI.uploadFile(file);
      if (!isApiSuccess(uploadResponse)) throw new Error((uploadResponse as any).message || 'Upload failed');
      const proxyUrl = uploadResponse.data;
      const s3Key = proxyUrl.split('fileName=')[1];
      if (!s3Key) throw new Error('Failed to get file key');
      setUploadProgress(70);
      const caption = [topText, bottomText].filter(Boolean).join(' ');
      const contentId = crypto.randomUUID();
      const contentRequest: ContentCreationRequest = {
        title: caption || 'Meme Cam Creation',
        type: 'MEME',
        hashtags: ['memecam', 'meme'],
        monetizationEnabled: true,
        s3Key, originalFileName: file.name, contentType: file.type, fileSize: file.size,
      };
      const contentResponse = await ContentAPI.createContent(contentId, contentRequest, user.id, user.creatorHandle || user.displayName || user.name || user.username);
      if (!isApiSuccess(contentResponse)) throw new Error((contentResponse as any).message || 'Failed to create content');
      setUploadProgress(100);
      showSnackbar('Posted to feed!', 'success');
      setTimeout(() => router.push('/feed'), 1500);
    } catch (error: any) {
      console.error('Post failed:', error);
      showSnackbar(error.message || 'Post failed. Try again.', 'error');
    } finally { setIsPosting(false); }
  };

  const currentStepIndex = stepOrder.indexOf(step);
  const progress = ((currentStepIndex + 1) / stepOrder.length) * 100;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: step === 'CAMERA' ? '#000' : '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      {/* Hidden gallery input */}
      <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleGalleryFile} style={{ display: 'none' }} />

      {/* TEMPLATES - entry point */}
      {step === 'TEMPLATES' && (
        <>
          <AppBar position="sticky" sx={{ bgcolor: 'white', color: '#333' }} elevation={1}>
            <Toolbar sx={{ justifyContent: 'space-between', px: 1, minHeight: '48px !important' }}>
              <IconButton onClick={() => router.back()} size="small"><BackIcon /></IconButton>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B46C1' }}>Meme Cam</Typography>
              <Box sx={{ width: 40 }} />
            </Toolbar>
          </AppBar>
          <TemplateLibrary
            onSelectTemplate={handleSelectTemplate}
            onUseCamera={handleUseCamera}
            onPickGallery={handlePickGallery}
          />
        </>
      )}

      {/* CAMERA */}
      {step === 'CAMERA' && (
        <CameraCapture onCapture={handleCapture} onClose={() => setStep('TEMPLATES')} />
      )}

      {/* All other steps */}
      {!['TEMPLATES', 'CAMERA'].includes(step) && (
        <>
          <AppBar position="sticky" sx={{ bgcolor: 'white', color: '#333' }} elevation={1}>
            <Toolbar sx={{ justifyContent: 'space-between', px: 1, minHeight: '48px !important' }}>
              <IconButton onClick={handleBack} size="small"><BackIcon /></IconButton>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B46C1' }}>{stepLabels[step]}</Typography>
              <Box sx={{ width: 40 }} />
            </Toolbar>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 3, '& .MuiLinearProgress-bar': { bgcolor: '#8B5CF6' }, bgcolor: '#F3E8FF' }} />
          </AppBar>

          <Box sx={{ flex: 1, maxWidth: 428, mx: 'auto', width: '100%' }}>
            {/* FILTER */}
            {step === 'FILTER' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                  <Box sx={{ width: '100%', maxWidth: 380, aspectRatio: '1', borderRadius: 3, overflow: 'hidden', bgcolor: '#000' }}>
                    <img src={imageSrc} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css, transition: 'filter 0.3s ease' }} />
                  </Box>
                </Box>
                <Box sx={{ bgcolor: 'white', borderTop: '1px solid #E5E7EB', pb: 2 }}>
                  <FilterStrip imageSrc={imageSrc} selectedFilter={selectedFilter.name} onSelectFilter={handleFilterSelect} />
                  <Box sx={{ px: 2, mt: 1 }}>
                    <Button fullWidth variant="contained" onClick={handleFilterNext} sx={{ bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 2, py: 1.5, fontWeight: 700, '&:hover': { bgcolor: '#553C9A' } }}>
                      Next: Add Caption
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

            {/* CAPTION */}
            {step === 'CAPTION' && (
              <Box sx={{ bgcolor: 'white', minHeight: '80vh' }}>
                <Box sx={{ p: 2, pb: 0 }}>
                  <Box sx={{ width: 120, height: 120, borderRadius: 2, overflow: 'hidden', mx: 'auto', mb: 2 }}>
                    <img src={imageSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
                  </Box>
                </Box>
                <CaptionSelector onSelectCaption={handleCaptionSelect} onSkip={handleCaptionSkip} />
              </Box>
            )}

            {/* EDITOR */}
            {step === 'EDITOR' && (
              <Box sx={{ bgcolor: 'white', p: 2, minHeight: '80vh' }}>
                <MemeEditor imageSrc={imageSrc} filterCss={selectedFilter.css} topText={topText} bottomText={bottomText} onTopTextChange={setTopText} onBottomTextChange={setBottomText} stageRef={stageRef} />
                <Button fullWidth variant="contained" onClick={handleEditorDone} sx={{ mt: 2, bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 2, py: 1.5, fontWeight: 700, '&:hover': { bgcolor: '#553C9A' } }}>
                  Preview & Post
                </Button>
              </Box>
            )}

            {/* PREVIEW */}
            {step === 'PREVIEW' && (
              <Box sx={{ bgcolor: 'white', p: 2, minHeight: '80vh' }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Your meme is ready!
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Preview your creation before posting
                  </Typography>
                </Box>
                {/* Read-only canvas preview */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <MemeEditor imageSrc={imageSrc} filterCss={selectedFilter.css} topText={topText} bottomText={bottomText} onTopTextChange={setTopText} onBottomTextChange={setBottomText} stageRef={stageRef} />
                </Box>
                {/* Back to editor link */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Button size="small" onClick={() => setStep('EDITOR')} sx={{ textTransform: 'none', color: '#6B46C1', fontSize: '0.8rem' }}>
                    Back to editor
                  </Button>
                </Box>
                {isPosting ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CircularProgress size={32} sx={{ color: '#6B46C1', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>Posting... {uploadProgress}%</Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1, height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: '#8B5CF6' } }} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button fullWidth variant="contained" startIcon={<PostIcon />} onClick={handlePostToFeed} sx={{ bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: '1rem', '&:hover': { bgcolor: '#553C9A' } }}>
                      Post to Feed
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button fullWidth variant="outlined" startIcon={<ShareIcon />} onClick={handleShare} sx={{ borderColor: '#6B46C1', color: '#6B46C1', textTransform: 'none', borderRadius: 2, py: 1, fontWeight: 600, '&:hover': { borderColor: '#553C9A', bgcolor: '#FAF5FF' } }}>
                        Share
                      </Button>
                      <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload} sx={{ borderColor: '#d1d5db', color: '#4B5563', textTransform: 'none', borderRadius: 2, py: 1, fontWeight: 600, '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>
                        Download
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default function MemeCamPage() {
  return (
    <ProtectedRoute>
      <MemeCamContent />
    </ProtectedRoute>
  );
}
