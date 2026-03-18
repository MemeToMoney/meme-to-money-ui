'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { RocketLaunch as RocketIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function CommunityDetailContent() {
  const router = useRouter();

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pl: { xs: 0, md: '280px' }, py: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'center', mt: 8 }}>
        <RocketIcon sx={{ fontSize: 64, color: '#6B46C1', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#374151', mb: 1 }}>
          Communities Coming Soon
        </Typography>
        <Typography sx={{ color: '#6B7280', fontSize: '1rem', mb: 4 }}>
          This feature is under development. Stay tuned!
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/communities')}
          sx={{ bgcolor: '#6B46C1', '&:hover': { bgcolor: '#553C9A' }, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Back to Communities
        </Button>
      </Box>
    </Box>
  );
}

export default function CommunityDetailPage() {
  return (
    <ProtectedRoute>
      <CommunityDetailContent />
    </ProtectedRoute>
  );
}
