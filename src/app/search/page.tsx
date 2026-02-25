'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Container,
  IconButton,
  Avatar,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserAPI, UserSummary } from '@/lib/api/user';
import { isApiSuccess } from '@/lib/api/client';

function SearchPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [suggestions, setSuggestions] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followLoadingMap, setFollowLoadingMap] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setUsers([]);
      setPage(0);
      setHasMore(false);
      setTotalResults(0);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchUsers(searchQuery.trim(), 0);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const loadSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      const response = await UserAPI.getSuggestions(15);
      if (isApiSuccess(response)) {
        setSuggestions(response.data);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const searchUsers = async (query: string, pageNum: number) => {
    try {
      setLoading(true);
      const response = await UserAPI.searchUsers(query, pageNum, 20);
      if (isApiSuccess(response)) {
        const data = response.data;
        if (pageNum === 0) {
          setUsers(data.users);
        } else {
          setUsers(prev => [...prev, ...data.users]);
        }
        setPage(pageNum);
        setHasMore(data.hasNext);
        setTotalResults(data.totalElements);

        // Check follow status for new users
        checkFollowStatuses(data.users);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatuses = async (userList: UserSummary[]) => {
    for (const u of userList) {
      if (u.id === user?.id) continue;
      try {
        const res = await UserAPI.getFollowStatus(u.id);
        if (isApiSuccess(res)) {
          setFollowingMap(prev => ({ ...prev, [u.id]: res.data.following }));
        }
      } catch {
        // ignore individual failures
      }
    }
  };

  const handleFollow = async (userId: string) => {
    setFollowLoadingMap(prev => ({ ...prev, [userId]: true }));
    try {
      const isFollowing = followingMap[userId];
      const response = isFollowing
        ? await UserAPI.unfollowUser(userId)
        : await UserAPI.followUser(userId);

      if (isApiSuccess(response)) {
        setFollowingMap(prev => ({ ...prev, [userId]: !isFollowing }));
      }
    } catch (err) {
      console.error('Follow action failed:', err);
    } finally {
      setFollowLoadingMap(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setUsers([]);
    setPage(0);
    setHasMore(false);
  };

  const handleLoadMore = () => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery.trim(), page + 1);
    }
  };

  const renderUserCard = (u: UserSummary) => {
    const isCurrentUser = u.id === user?.id;
    const isFollowing = followingMap[u.id] || false;
    const isLoadingFollow = followLoadingMap[u.id] || false;

    return (
      <Box
        key={u.id}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: 3,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': { bgcolor: '#F9FAFB' },
        }}
        onClick={() => {
          if (isCurrentUser) {
            router.push('/profile');
          } else {
            router.push(`/profile/${u.id}`);
          }
        }}
      >
        <Avatar
          src={u.profilePicture}
          sx={{
            width: 52,
            height: 52,
            bgcolor: '#6B46C1',
            fontWeight: 700,
          }}
        >
          {u.name?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: '#111827' }}
            noWrap
          >
            {u.displayName || u.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B46C1', fontWeight: 500 }} noWrap>
            @{u.username || u.creatorHandle || 'user'}
          </Typography>
          {u.bio && (
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }} noWrap>
              {u.bio}
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            {u.followerCount || 0} followers
          </Typography>
        </Box>

        {!isCurrentUser && (
          <Button
            variant={isFollowing ? 'outlined' : 'contained'}
            size="small"
            disabled={isLoadingFollow}
            onClick={(e) => {
              e.stopPropagation();
              handleFollow(u.id);
            }}
            startIcon={
              isLoadingFollow ? (
                <CircularProgress size={14} />
              ) : isFollowing ? (
                <CheckIcon />
              ) : (
                <PersonAddIcon />
              )
            }
            sx={{
              minWidth: 110,
              textTransform: 'none',
              borderRadius: 3,
              fontWeight: 600,
              fontSize: '0.8rem',
              ...(isFollowing
                ? {
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#EF4444',
                      color: '#EF4444',
                      bgcolor: 'rgba(239,68,68,0.04)',
                    },
                  }
                : {
                    bgcolor: '#6B46C1',
                    '&:hover': { bgcolor: '#553C9A' },
                  }),
            }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      <Container maxWidth={false} sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            bgcolor: 'white',
            zIndex: 1,
            p: 2,
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: '#6B46C1', mb: 2 }}
          >
            Explore
          </Typography>

          {/* Search Input */}
          <TextField
            fullWidth
            placeholder="Search users by name, username..."
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
                '& fieldset': { border: '1px solid #E5E7EB' },
                '&:hover fieldset': { border: '1px solid #6B46C1' },
                '&.Mui-focused fieldset': { border: '2px solid #6B46C1' },
              },
            }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ p: 0 }}>
          {searchQuery.trim() ? (
            // Search Results
            <Box>
              {loading && users.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, p: 2 }}>
                      <Skeleton variant="circular" width={52} height={52} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="40%" height={20} />
                        <Skeleton width="30%" height={16} />
                        <Skeleton width="20%" height={14} />
                      </Box>
                      <Skeleton variant="rounded" width={100} height={32} />
                    </Box>
                  ))}
                </Box>
              ) : users.length > 0 ? (
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ px: 3, py: 1.5, color: '#6B7280', bgcolor: 'white', borderBottom: '1px solid #E5E7EB' }}
                  >
                    {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
                  </Typography>
                  <Box sx={{ bgcolor: 'white' }}>
                    {users.map(renderUserCard)}
                  </Box>
                  {hasMore && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Button
                        onClick={handleLoadMore}
                        disabled={loading}
                        sx={{
                          textTransform: 'none',
                          color: '#6B46C1',
                          fontWeight: 600,
                        }}
                      >
                        {loading ? <CircularProgress size={20} /> : 'Load more'}
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                  <SearchIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No users found for "{searchQuery}"
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Try a different search term
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            // Suggestions (when no search query)
            <Box>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'white',
                  borderBottom: '1px solid #E5E7EB',
                }}
              >
                <TrendingIcon sx={{ color: '#6B46C1', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>
                  Suggested for you
                </Typography>
              </Box>

              {suggestionsLoading ? (
                <Box sx={{ p: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, p: 2 }}>
                      <Skeleton variant="circular" width={52} height={52} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="40%" height={20} />
                        <Skeleton width="30%" height={16} />
                      </Box>
                      <Skeleton variant="rounded" width={100} height={32} />
                    </Box>
                  ))}
                </Box>
              ) : suggestions.length > 0 ? (
                <Box sx={{ bgcolor: 'white' }}>
                  {suggestions.map(renderUserCard)}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                  <SearchIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Start exploring
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Search for creators, meme pages, and friends
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <SearchPageContent />
    </ProtectedRoute>
  );
}
