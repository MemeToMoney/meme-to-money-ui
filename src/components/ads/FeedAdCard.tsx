'use client';

import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import AdUnit from './AdUnit';

/**
 * Native ad card that blends with the feed post cards.
 * Uses the same Card styling as regular feed posts with a subtle "Sponsored" label.
 */
export default function FeedAdCard() {
  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Typography
          variant="caption"
          sx={{ color: '#9CA3AF', fontSize: '0.65rem', letterSpacing: '0.05em' }}
        >
          Sponsored
        </Typography>
      </Box>
      <Box sx={{ px: 1, pb: 1.5 }}>
        <AdUnit
          slot="auto"
          format="fluid"
          layout="in-article"
          style={{ textAlign: 'center' }}
        />
      </Box>
    </Card>
  );
}
