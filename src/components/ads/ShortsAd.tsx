'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import AdUnit from './AdUnit';

/**
 * Full-screen ad slot for shorts feed.
 * Matches the 100vh scroll-snap layout of regular shorts.
 */
export default function ShortsAd() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        bgcolor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Subtle sponsored label */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 3 }}>
        <Chip
          label="Sponsored"
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.7rem',
            backdropFilter: 'blur(10px)',
          }}
        />
      </Box>

      {/* Ad content */}
      <Box sx={{ width: '100%', maxWidth: 400, px: 2 }}>
        <AdUnit
          slot="auto"
          format="auto"
          style={{ minHeight: 250 }}
        />
      </Box>
    </Box>
  );
}
