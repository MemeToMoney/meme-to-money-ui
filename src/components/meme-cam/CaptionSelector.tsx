'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface CaptionSelectorProps {
  onSelectCaption: (topText: string, bottomText: string) => void;
  onSkip: () => void;
}

const themes = ['funny', 'sarcastic', 'wholesome', 'relatable', 'savage', 'motivational', 'cringe', 'reaction'];

export default function CaptionSelector({ onSelectCaption, onSkip }: CaptionSelectorProps) {
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('funny');
  const [source, setSource] = useState<'ai' | 'offline'>('offline');
  const [showCustom, setShowCustom] = useState(false);
  const [customTop, setCustomTop] = useState('');
  const [customBottom, setCustomBottom] = useState('');

  const fetchCaptions = async (theme: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/meme/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      setCaptions(data.captions || []);
      setSource(data.source || 'offline');
    } catch {
      setCaptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptions(selectedTheme);
  }, []);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    fetchCaptions(theme);
  };

  const handleSelectCaption = (caption: string) => {
    // Split into top/bottom if caption is long, otherwise put all on bottom
    const words = caption.split(' ');
    if (words.length > 6) {
      const mid = Math.ceil(words.length / 2);
      const top = words.slice(0, mid).join(' ');
      const bottom = words.slice(mid).join(' ');
      onSelectCaption(top, bottom);
    } else {
      onSelectCaption('', caption);
    }
  };

  const handleCustomSubmit = () => {
    if (customTop.trim() || customBottom.trim()) {
      onSelectCaption(customTop.trim(), customBottom.trim());
    }
  };

  if (showCustom) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
          Write your own caption
        </Typography>

        <TextField
          fullWidth
          placeholder="Top text (optional)"
          value={customTop}
          onChange={(e) => setCustomTop(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <TextField
          fullWidth
          placeholder="Bottom text"
          value={customBottom}
          onChange={(e) => setCustomBottom(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowCustom(false)}
            sx={{
              flex: 1,
              borderColor: '#d1d5db',
              color: '#4B5563',
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Back to AI
          </Button>
          <Button
            variant="contained"
            onClick={handleCustomSubmit}
            disabled={!customTop.trim() && !customBottom.trim()}
            sx={{
              flex: 1,
              bgcolor: '#6B46C1',
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { bgcolor: '#553C9A' },
            }}
          >
            Use This
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            AI Captions
          </Typography>
          {source === 'ai' && (
            <Chip label="AI" size="small" sx={{ bgcolor: '#EDE9FE', color: '#6B46C1', height: 20, fontSize: '0.65rem' }} />
          )}
        </Box>
        <Button
          size="small"
          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
          onClick={() => setShowCustom(true)}
          sx={{ textTransform: 'none', color: '#6B46C1', fontSize: '0.8rem' }}
        >
          Write my own
        </Button>
      </Box>

      {/* Theme chips */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          mb: 2,
          pb: 0.5,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {themes.map((theme) => (
          <Chip
            key={theme}
            label={theme}
            size="small"
            onClick={() => handleThemeChange(theme)}
            sx={{
              flexShrink: 0,
              bgcolor: selectedTheme === theme ? '#6B46C1' : '#F3F4F6',
              color: selectedTheme === theme ? 'white' : '#4B5563',
              fontWeight: selectedTheme === theme ? 700 : 400,
              textTransform: 'capitalize',
              '&:hover': {
                bgcolor: selectedTheme === theme ? '#553C9A' : '#E5E7EB',
              },
            }}
          />
        ))}
      </Box>

      {/* Caption cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#6B46C1' }} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {captions.map((caption, index) => (
            <Card
              key={index}
              onClick={() => handleSelectCaption(caption)}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                bgcolor: 'white',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#8B5CF6',
                  bgcolor: '#FAF5FF',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(107, 70, 193, 0.15)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#1a1a1a', fontWeight: 500, lineHeight: 1.5 }}
              >
                {caption}
              </Typography>
            </Card>
          ))}
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchCaptions(selectedTheme)}
          disabled={loading}
          sx={{
            flex: 1,
            borderColor: '#d1d5db',
            color: '#4B5563',
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          Regenerate
        </Button>
        <Button
          variant="text"
          onClick={onSkip}
          sx={{
            color: '#9CA3AF',
            textTransform: 'none',
          }}
        >
          Skip
        </Button>
      </Box>
    </Box>
  );
}
