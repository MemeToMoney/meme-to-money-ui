'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  TrendingUp as TrendingIcon,
  Lock as LockIcon,
  Tag as TagIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  ThumbUp as LikeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserAPI, UserSummary } from '@/lib/api/user';
import { ContentAPI, Content } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';

const DEFAULT_TRENDING_HASHTAGS = [
  '#memecam', '#funny', '#viral', '#trending',
  '#comedy', '#memes', '#reaction', '#relatable',
];

function SearchPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0); // 0 = People, 1 = Content
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [contentResults, setContentResults] = useState<Content[]>([]);
  const [suggestions, setSuggestions] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followLoadingMap, setFollowLoadingMap] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(0);
  const [contentPage, setContentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [contentHasMore, setContentHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [contentTotalResults, setContentTotalResults] = useState(0);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>(DEFAULT_TRENDING_HASHTAGS);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(false);

  const { user } = useAuth();
  const router = useRouter();

  // Load suggestions and trending hashtags on mount
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;
    loadSuggestions();
    loadTrendingHashtags();
  }, []);

  // Debounced search - searches both tabs simultaneously
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setUsers([]);
      setContentResults([]);
      setPage(0);
      setContentPage(0);
      setHasMore(false);
      setContentHasMore(false);
      setTotalResults(0);
      setContentTotalResults(0);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const query = searchQuery.trim();
      // Search both people and content simultaneously
      searchUsers(query, 0);
      searchContent(query, 0);
    }, 500);

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

  const loadTrendingHashtags = async () => {
    try {
      const response = await ContentAPI.getTrendingHashtags(10);
      if (isApiSuccess(response)) {
        const tags = response.data;
        // tags may be an array of strings or objects with a 'tag' field
        if (Array.isArray(tags) && tags.length > 0) {
          const formatted = tags.map((t: any) => {
            const tagStr = typeof t === 'string' ? t : (t.tag || t.hashtag || t.name || '');
            return tagStr.startsWith('#') ? tagStr : `#${tagStr}`;
          }).filter((t: string) => t.length > 1);
          if (formatted.length > 0) {
            setTrendingHashtags(formatted);
          }
        }
      }
    } catch (err) {
      // Keep defaults if trending API fails
      console.error('Failed to load trending hashtags:', err);
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

  const searchContent = async (query: string, pageNum: number) => {
    try {
      setContentLoading(true);
      const response = await ContentAPI.searchContent(query, undefined, undefined, undefined, pageNum, 20, user?.id);
      if (isApiSuccess(response)) {
        const data = response.data;
        // Backend returns Response<Page<Content>>
        // So data is Page<Content> with: content (array), totalElements, last, etc.
        // Handle both nested and flat response shapes for robustness
        let items: Content[] = [];
        let total = 0;
        let hasNext = false;

        if (Array.isArray(data?.content)) {
          // data is Page<Content> directly
          items = data.content;
          total = data.totalElements ?? 0;
          hasNext = data.last === false;
        } else if (data?.content?.content && Array.isArray(data.content.content)) {
          // data is wrapped: { content: Page<Content> }
          items = data.content.content;
          total = data.content.totalElements ?? 0;
          hasNext = data.content.last === false;
        }

        if (pageNum === 0) {
          setContentResults(items);
        } else {
          setContentResults(prev => [...prev, ...items]);
        }
        setContentPage(pageNum);
        setContentHasMore(hasNext);
        setContentTotalResults(total);
      }
    } catch (err) {
      console.error('Content search failed:', err);
    } finally {
      setContentLoading(false);
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
    setContentResults([]);
    setPage(0);
    setContentPage(0);
    setHasMore(false);
    setContentHasMore(false);
  };

  const handleLoadMore = () => {
    if (searchQuery.trim()) {
      if (tabValue === 0) {
        searchUsers(searchQuery.trim(), page + 1);
      } else {
        searchContent(searchQuery.trim(), contentPage + 1);
      }
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleHashtagClick = (hashtag: string) => {
    // Strip # prefix for search
    const tag = hashtag.replace('#', '');
    router.push(`/hashtag/${tag}`);
  };

  const handleHashtagSearch = (hashtag: string) => {
    setSearchQuery(hashtag);
    setTabValue(1); // Switch to Content tab
  };

  const getContentUrl = (content: Content) => {
    return content.thumbnailUrl || content.processedFile?.cdnUrl || content.originalFile?.cdnUrl;
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: '#111827' }}
              noWrap
            >
              {u.displayName || u.name}
            </Typography>
            {u.isPrivateAccount && (
              <LockIcon sx={{ fontSize: 14, color: '#6B7280' }} />
            )}
          </Box>
          <Typography variant="body2" sx={{ color: '#6B46C1', fontWeight: 500 }} noWrap>
            @{u.creatorHandle || u.username || 'user'}
          </Typography>
          {!u.isPrivateAccount && u.bio && (
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

  const renderContentGrid = () => {
    const isLoadingInitial = contentLoading && contentResults.length === 0;

    if (isLoadingInitial) {
      return (
        <Box sx={{ p: 2 }}>
          <Grid container spacing={1}>
            {[...Array(9)].map((_, i) => (
              <Grid item xs={4} key={i}>
                <Skeleton
                  variant="rectangular"
                  sx={{ width: '100%', paddingTop: '100%', borderRadius: 1 }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }

    if (contentResults.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <SearchIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No content found for &quot;{searchQuery}&quot;
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Try different keywords or hashtags
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography
          variant="body2"
          sx={{ px: 3, py: 1.5, color: '#6B7280', bgcolor: 'white', borderBottom: '1px solid #E5E7EB' }}
        >
          {contentTotalResults} result{contentTotalResults !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
        </Typography>
        <Box sx={{ p: 1, bgcolor: 'white' }}>
          <Grid container spacing={1}>
            {contentResults.map((content) => (
              <Grid item xs={6} sm={4} key={content.id}>
                <Box
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                  }}
                  onClick={() => router.push(`/profile/${content.creatorId}`)}
                >
                  {/* Thumbnail */}
                  {content.type === 'TEXT_POST' ? (
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '100%',
                        bgcolor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1.5,
                          fontSize: '0.75rem',
                          color: '#374151',
                          textAlign: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        {content.description || content.title || 'Text Post'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component="img"
                        src={getContentUrl(content)}
                        alt={content.title || 'Content'}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e: any) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUNBM0FGIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                      {/* Video play icon */}
                      {content.type === 'SHORT_VIDEO' && (
                        <PlayIcon
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontSize: 22,
                            color: 'white',
                            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
                          }}
                        />
                      )}
                      {/* Overlay stats */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                          p: 0.75,
                          display: 'flex',
                          gap: 1.5,
                          alignItems: 'center',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <LikeIcon sx={{ fontSize: 12, color: 'white' }} />
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem' }}>
                            {formatCount(content.likeCount)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <ViewIcon sx={{ fontSize: 12, color: 'white' }} />
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem' }}>
                            {formatCount(content.viewCount)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  {/* Title and creator info */}
                  <Box sx={{ p: 1 }}>
                    {content.title && (
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: '#111827', fontSize: '0.8rem', lineHeight: 1.3 }}
                        noWrap
                      >
                        {content.title}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{ color: '#6B46C1', fontWeight: 500, fontSize: '0.7rem' }}
                      noWrap
                    >
                      @{content.creatorHandle || 'user'}
                    </Typography>
                    {content.hashtags && content.hashtags.length > 0 && (
                      <Typography
                        variant="caption"
                        sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.65rem' }}
                        noWrap
                      >
                        {content.hashtags.slice(0, 3).map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
        {contentHasMore && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Button
              onClick={handleLoadMore}
              disabled={contentLoading}
              sx={{
                textTransform: 'none',
                color: '#6B46C1',
                fontWeight: 600,
              }}
            >
              {contentLoading ? <CircularProgress size={20} /> : 'Load more'}
            </Button>
          </Box>
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
            pb: 0,
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
            placeholder={tabValue === 0 ? 'Search users by name, username...' : 'Search memes, videos, hashtags...'}
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

          {/* Tabs with result counts */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              mt: 1,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#6B7280',
                minHeight: 42,
                '&.Mui-selected': {
                  color: '#6B46C1',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#6B46C1',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab label={searchQuery.trim() && totalResults > 0 ? `People (${formatCount(totalResults)})` : 'People'} />
            <Tab label={searchQuery.trim() && contentTotalResults > 0 ? `Content (${formatCount(contentTotalResults)})` : 'Content'} />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ p: 0 }}>
          {searchQuery.trim() ? (
            // Search Results
            <Box>
              {tabValue === 0 ? (
                // People search results
                <>
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
                        {totalResults} result{totalResults !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
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
                        No users found for &quot;{searchQuery}&quot;
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Try a different search term
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                // Content search results
                renderContentGrid()
              )}
            </Box>
          ) : (
            // Default view (when no search query)
            <Box>
              {/* Trending Hashtags */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: 'white',
                  borderBottom: '1px solid #E5E7EB',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <TagIcon sx={{ color: '#6B46C1', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>
                    Trending Hashtags
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {trendingHashtags.map((hashtag) => (
                    <Chip
                      key={hashtag}
                      label={hashtag}
                      onClick={() => handleHashtagClick(hashtag)}
                      sx={{
                        bgcolor: 'rgba(107, 70, 193, 0.08)',
                        color: '#6B46C1',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        border: '1px solid rgba(107, 70, 193, 0.2)',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(107, 70, 193, 0.15)',
                          borderColor: '#6B46C1',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Popular Searches */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: 'white',
                  borderBottom: '1px solid #E5E7EB',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <SearchIcon sx={{ color: '#6B46C1', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>
                    Popular Searches
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['funny memes', 'reaction videos', 'trending today', 'comedy', 'relatable'].map((term) => (
                    <Chip
                      key={term}
                      label={term}
                      onClick={() => handleHashtagSearch(term)}
                      variant="outlined"
                      sx={{
                        color: '#374151',
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        borderColor: '#E5E7EB',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#F9FAFB',
                          borderColor: '#6B46C1',
                          color: '#6B46C1',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Suggestions */}
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
