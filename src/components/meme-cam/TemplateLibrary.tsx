'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
} from '@mui/icons-material';
import memeTemplates, { MemeTemplate } from '@/data/meme-templates';

interface TemplateLibraryProps {
  onSelectTemplate: (template: MemeTemplate) => void;
  onUseCamera: () => void;
  onPickGallery: () => void;
}

const categories = [
  { key: 'all', label: 'All' },
  { key: 'classic', label: 'Classic' },
  { key: 'format', label: 'Formats' },
  { key: 'reaction', label: 'Reaction' },
  { key: 'blank', label: 'Blank' },
];

export default function TemplateLibrary({ onSelectTemplate, onUseCamera, onPickGallery }: TemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTemplates = selectedCategory === 'all'
    ? memeTemplates
    : memeTemplates.filter(t => t.category === selectedCategory);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 0.5 }}>
          Create a Meme
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Pick a template or use your own photo
        </Typography>
      </Box>

      {/* Camera & Gallery buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, p: 2 }}>
        <Button
          variant="contained"
          startIcon={<CameraIcon />}
          onClick={onUseCamera}
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
            textTransform: 'none',
            borderRadius: 2,
            py: 1.5,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(107, 70, 193, 0.3)',
            '&:hover': { background: 'linear-gradient(135deg, #553C9A 0%, #7C3AED 100%)' },
          }}
        >
          Camera
        </Button>
        <Button
          variant="outlined"
          startIcon={<GalleryIcon />}
          onClick={onPickGallery}
          sx={{
            flex: 1,
            borderColor: '#6B46C1',
            color: '#6B46C1',
            textTransform: 'none',
            borderRadius: 2,
            py: 1.5,
            fontWeight: 700,
            '&:hover': { borderColor: '#553C9A', bgcolor: '#FAF5FF' },
          }}
        >
          Gallery
        </Button>
      </Box>

      {/* Divider */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 1 }}>
        <Box sx={{ flex: 1, height: 1, bgcolor: '#E5E7EB' }} />
        <Typography variant="caption" sx={{ px: 2, color: '#9CA3AF', fontWeight: 600 }}>
          OR PICK A TEMPLATE
        </Typography>
        <Box sx={{ flex: 1, height: 1, bgcolor: '#E5E7EB' }} />
      </Box>

      {/* Category filter */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          px: 2,
          pb: 1.5,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {categories.map((cat) => (
          <Chip
            key={cat.key}
            label={cat.label}
            size="small"
            onClick={() => setSelectedCategory(cat.key)}
            sx={{
              flexShrink: 0,
              bgcolor: selectedCategory === cat.key ? '#6B46C1' : '#F3F4F6',
              color: selectedCategory === cat.key ? 'white' : '#4B5563',
              fontWeight: selectedCategory === cat.key ? 700 : 500,
              '&:hover': { bgcolor: selectedCategory === cat.key ? '#553C9A' : '#E5E7EB' },
            }}
          />
        ))}
      </Box>

      {/* Template grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
          px: 2,
          pb: 4,
        }}
      >
        {filteredTemplates.map((template) => (
          <Box
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            sx={{
              aspectRatio: '1',
              borderRadius: 2,
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative',
              background: template.bgGradient,
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: '0 4px 16px rgba(107, 70, 193, 0.25)',
              },
              '&:active': { transform: 'scale(0.97)' },
            }}
          >
            {/* Preview text areas */}
            {template.textAreas.map((area) => (
              <Typography
                key={area.id}
                sx={{
                  position: 'absolute',
                  top: `${area.yPercent}%`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'white',
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  width: '90%',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                  letterSpacing: 0.5,
                }}
              >
                {area.defaultText || area.label}
              </Typography>
            ))}

            {/* Template name badge */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                p: 1,
                pt: 3,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              >
                {template.name}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
