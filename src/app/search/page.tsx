'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Container,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <Container maxWidth={false} sx={{ p: 0, height: '100%' }}>
      {/* Header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        bgcolor: 'white',
        zIndex: 1,
        p: 2,
        borderBottom: '1px solid #E5E7EB'
      }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: '#374151',
            mb: 2
          }}
        >
          Search
        </Typography>

        {/* Search Input */}
        <TextField
          fullWidth
          placeholder="Search memes, users, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6B7280' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={handleClear} size="small">
                  <ClearIcon sx={{ color: '#6B7280' }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#F9FAFB',
              '& fieldset': {
                border: '1px solid #E5E7EB',
              },
              '&:hover fieldset': {
                border: '1px solid #6B46C1',
              },
              '&.Mui-focused fieldset': {
                border: '2px solid #6B46C1',
              },
            }
          }}
        />
      </Box>

      {/* Search Results/Content */}
      <Box sx={{ p: 2, flex: 1 }}>
        {searchQuery ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Searching for "{searchQuery}"...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Search functionality coming soon!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <SearchIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Start searching
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find memes, creators, and trending content
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}