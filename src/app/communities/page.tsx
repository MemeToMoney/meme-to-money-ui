'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Groups as GroupsIcon,
  People as PeopleIcon,
  Article as PostIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CommunityAPI, Community } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

function CommunitiesContent() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const router = useRouter();
  const { user } = useAuth();

  const myCommunitySlugs = new Set(myCommunities.map(c => c.slug));

  const loadCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CommunityAPI.getAllCommunities(searchQuery || undefined);
      if (isApiSuccess(res)) {
        setCommunities(res.data);
      }
    } catch (e) {
      console.error('Failed to load communities', e);
    }
    setLoading(false);
  }, [searchQuery]);

  const loadMyCommunities = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await CommunityAPI.getMyCommunities(user.id);
      if (isApiSuccess(res)) {
        setMyCommunities(res.data);
      }
    } catch (e) {
      console.error('Failed to load my communities', e);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCommunities();
    loadMyCommunities();
  }, [loadCommunities, loadMyCommunities]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCommunities();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, loadCommunities]);

  const handleJoinLeave = async (slug: string, isMember: boolean) => {
    if (!user?.id) return;
    setJoiningSlug(slug);
    try {
      const res = isMember
        ? await CommunityAPI.leaveCommunity(slug, user.id)
        : await CommunityAPI.joinCommunity(slug, user.id);

      if (isApiSuccess(res)) {
        setSnackbar({ open: true, message: isMember ? 'Left community' : 'Joined community!', severity: 'success' });
        // Update local state
        if (isMember) {
          setMyCommunities(prev => prev.filter(c => c.slug !== slug));
        } else {
          const joined = communities.find(c => c.slug === slug);
          if (joined) setMyCommunities(prev => [...prev, { ...joined, memberCount: joined.memberCount + 1 }]);
        }
        // Update community member count in list
        setCommunities(prev => prev.map(c => {
          if (c.slug === slug) {
            return { ...c, memberCount: isMember ? c.memberCount - 1 : c.memberCount + 1 };
          }
          return c;
        }));
      } else {
        setSnackbar({ open: true, message: (res as any).message || 'Action failed', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Something went wrong', severity: 'error' });
    }
    setJoiningSlug(null);
  };

  const CommunityCard = ({ community, isMember }: { community: Community; isMember: boolean }) => (
    <Card
      sx={{
        bgcolor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#6B46C1',
          boxShadow: '0 4px 16px rgba(107, 70, 193, 0.1)',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={() => router.push(`/communities/${community.slug}`)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: '#F3F0FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              {community.iconEmoji}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '1rem', lineHeight: 1.3 }}>
                {community.name}
              </Typography>
              <Chip
                label={community.category}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: '#F3F0FF',
                  color: '#6B46C1',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
        </Box>

        <Typography sx={{ color: '#6B7280', fontSize: '0.85rem', mb: 2, lineHeight: 1.5, minHeight: 40 }}>
          {community.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon sx={{ fontSize: 16, color: '#6B7280' }} />
            <Typography sx={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
              {community.memberCount} members
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PostIcon sx={{ fontSize: 16, color: '#6B7280' }} />
            <Typography sx={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
              {community.postCount} posts
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {community.tags.slice(0, 4).map(tag => (
            <Chip
              key={tag}
              label={`#${tag}`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                bgcolor: '#F8F9FA',
                color: '#6B7280',
                border: '1px solid #E5E7EB',
              }}
            />
          ))}
          {community.tags.length > 4 && (
            <Chip
              label={`+${community.tags.length - 4}`}
              size="small"
              sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#F8F9FA', color: '#6B7280' }}
            />
          )}
        </Box>

        <Button
          fullWidth
          variant={isMember ? 'outlined' : 'contained'}
          size="small"
          disabled={joiningSlug === community.slug}
          onClick={(e) => {
            e.stopPropagation();
            handleJoinLeave(community.slug, isMember);
          }}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            py: 0.8,
            ...(isMember
              ? {
                  borderColor: '#E5E7EB',
                  color: '#6B7280',
                  '&:hover': { borderColor: '#EF4444', color: '#EF4444', bgcolor: 'rgba(239,68,68,0.04)' },
                }
              : {
                  bgcolor: '#6B46C1',
                  '&:hover': { bgcolor: '#553C9A' },
                }),
          }}
        >
          {joiningSlug === community.slug ? (
            <CircularProgress size={18} sx={{ color: isMember ? '#6B7280' : 'white' }} />
          ) : isMember ? (
            'Leave'
          ) : (
            'Join Community'
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pl: { xs: 0, md: '280px' }, py: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <GroupsIcon sx={{ fontSize: 32, color: '#6B46C1' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#374151' }}>
              Communities
            </Typography>
          </Box>
          <Typography sx={{ color: '#6B7280', fontSize: '1rem' }}>
            Join tag-based communities and discover memes you love
          </Typography>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6B7280' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              borderRadius: 3,
              '& fieldset': { borderColor: '#E5E7EB' },
              '&:hover fieldset': { borderColor: '#6B46C1' },
              '&.Mui-focused fieldset': { borderColor: '#6B46C1' },
            },
          }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : (
          <>
            {/* My Communities */}
            {myCommunities.length > 0 && !searchQuery && (
              <Box sx={{ mb: 5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#374151', mb: 2 }}>
                  My Communities
                </Typography>
                <Grid container spacing={2.5}>
                  {myCommunities.map((community) => (
                    <Grid item xs={12} sm={6} md={4} key={community.id}>
                      <CommunityCard community={community} isMember={true} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* All / Search Results */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#374151', mb: 2 }}>
                {searchQuery ? 'Search Results' : 'Explore Communities'}
              </Typography>
              {communities.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <GroupsIcon sx={{ fontSize: 56, color: '#D1D5DB', mb: 2 }} />
                  <Typography sx={{ color: '#6B7280', fontSize: '1.1rem' }}>
                    {searchQuery ? 'No communities found' : 'No communities yet'}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2.5}>
                  {communities
                    .filter(c => searchQuery || !myCommunitySlugs.has(c.slug))
                    .map((community) => (
                      <Grid item xs={12} sm={6} md={4} key={community.id}>
                        <CommunityCard community={community} isMember={myCommunitySlugs.has(community.slug)} />
                      </Grid>
                    ))}
                </Grid>
              )}
            </Box>
          </>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
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
