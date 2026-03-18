'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Groups as GroupsIcon, RocketLaunch as RocketIcon } from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function CommunitiesContent() {
  const upcomingCommunities = [
    { emoji: '💼', name: 'Startup Memes' },
    { emoji: '🏢', name: 'Office Memes' },
    { emoji: '👨‍👩‍👧', name: 'Indian Parents' },
    { emoji: '⚙️', name: 'Engineering Memes' },
    { emoji: '💪', name: 'Gym Memes' },
    { emoji: '🚇', name: 'Delhi Metro' },
    { emoji: '🚗', name: 'Bangalore Traffic' },
    { emoji: '🏏', name: 'Cricket Memes' },
  ];

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pl: { xs: 0, md: '280px' }, py: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1 }}>
            <GroupsIcon sx={{ fontSize: 32, color: '#6B46C1' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#374151' }}>
              Communities
            </Typography>
          </Box>
        </Box>

        {/* Coming Soon Card */}
        <Box
          sx={{
            bgcolor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            mt: 4,
          }}
        >
          <RocketIcon sx={{ fontSize: 64, color: '#6B46C1', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#374151', mb: 1 }}>
            Coming Soon
          </Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '1.05rem', mb: 4, maxWidth: 500, mx: 'auto' }}>
            Join tag-based meme communities, share with your tribe, and discover content you love. We&apos;re building something awesome!
          </Typography>

          {/* Preview of upcoming communities */}
          <Typography sx={{ color: '#374151', fontWeight: 700, fontSize: '0.9rem', mb: 2 }}>
            Upcoming Communities
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
            {upcomingCommunities.map((c) => (
              <Chip
                key={c.name}
                label={`${c.emoji} ${c.name}`}
                sx={{
                  bgcolor: '#F3F0FF',
                  color: '#6B46C1',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  py: 2.5,
                  px: 0.5,
                  borderRadius: 2,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function CommunitiesPage() {
  return (
    <ProtectedRoute>
      <CommunitiesContent />
    </ProtectedRoute>
  );
}
