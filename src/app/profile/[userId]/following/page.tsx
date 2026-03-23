'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserAPI, UserSummary } from '@/lib/api/user';
import { isApiSuccess } from '@/lib/api/client';

function FollowingContent() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followLoadingMap, setFollowLoadingMap] = useState<Record<string, boolean>>({});
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    loadFollowing(0);
    loadProfileName();
  }, [userId]);

  const loadProfileName = async () => {
    const res = await UserAPI.getUserProfile(userId);
    if (isApiSuccess(res)) {
      setProfileName(res.data.displayName || res.data.name || '');
    }
  };

  const loadFollowing = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await UserAPI.getFollowing(userId, pageNum, 20);
      if (isApiSuccess(response)) {
        const data = response.data;
        if (pageNum === 0) {
          setUsers(data.users);
        } else {
          setUsers(prev => [...prev, ...data.users]);
        }
        setPage(pageNum);
        setHasMore(data.hasNext);
        checkFollowStatuses(data.users);
      }
    } catch (err) {
      console.error('Failed to load following:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatuses = async (userList: UserSummary[]) => {
    for (const u of userList) {
      if (u.id === currentUser?.id) continue;
      try {
        const res = await UserAPI.getFollowStatus(u.id);
        if (isApiSuccess(res)) {
          setFollowingMap(prev => ({ ...prev, [u.id]: res.data.following }));
        }
      } catch { /* ignore */ }
    }
  };

  const handleFollow = async (uid: string) => {
    setFollowLoadingMap(prev => ({ ...prev, [uid]: true }));
    try {
      const isFollowing = followingMap[uid];
      const response = isFollowing
        ? await UserAPI.unfollowUser(uid)
        : await UserAPI.followUser(uid);
      if (isApiSuccess(response)) {
        setFollowingMap(prev => ({ ...prev, [uid]: !isFollowing }));
      }
    } catch { /* ignore */ } finally {
      setFollowLoadingMap(prev => ({ ...prev, [uid]: false }));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      <Container maxWidth={false} sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{
          position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1,
          p: 2, borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <IconButton onClick={() => router.back()} size="small">
            <BackIcon sx={{ color: '#374151' }} />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#374151', lineHeight: 1.2 }}>
              Following
            </Typography>
            {profileName && (
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                {profileName}
              </Typography>
            )}
          </Box>
        </Box>

        {/* User List */}
        <Box sx={{ bgcolor: 'white' }}>
          {loading && users.length === 0 ? (
            <Box sx={{ p: 2 }}>
              {[...Array(8)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, p: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="40%" height={20} />
                    <Skeleton width="25%" height={16} />
                  </Box>
                  <Skeleton variant="rounded" width={90} height={32} />
                </Box>
              ))}
            </Box>
          ) : users.length > 0 ? (
            <>
              {users.map((u) => {
                const isCurrentUser = u.id === currentUser?.id;
                const isFollowing = followingMap[u.id] || false;
                const isLoadingFollow = followLoadingMap[u.id] || false;

                return (
                  <Box
                    key={u.id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2, p: 2,
                      cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' },
                    }}
                    onClick={() => isCurrentUser ? router.push('/profile') : router.push(`/profile/${u.id}`)}
                  >
                    <Avatar src={u.profilePicture} sx={{ width: 48, height: 48, bgcolor: '#6B46C1' }}>
                      {u.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                        {u.displayName || u.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B46C1', fontWeight: 500 }} noWrap>
                        @{u.creatorHandle || u.username || 'user'}
                      </Typography>
                    </Box>
                    {!isCurrentUser && (
                      <Button
                        variant={isFollowing ? 'outlined' : 'contained'}
                        size="small"
                        disabled={isLoadingFollow}
                        onClick={(e) => { e.stopPropagation(); handleFollow(u.id); }}
                        sx={{
                          minWidth: 100, textTransform: 'none', borderRadius: 3, fontWeight: 600, fontSize: '0.8rem',
                          ...(isFollowing
                            ? { borderColor: '#E5E7EB', color: '#374151' }
                            : { bgcolor: '#6B46C1', '&:hover': { bgcolor: '#553C9A' } }),
                        }}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </Box>
                );
              })}
              {hasMore && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Button
                    onClick={() => loadFollowing(page + 1)}
                    disabled={loading}
                    sx={{ textTransform: 'none', color: '#6B46C1', fontWeight: 600 }}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Load more'}
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary">Not following anyone yet</Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default function FollowingPage() {
  return (
    <ProtectedRoute>
      <FollowingContent />
    </ProtectedRoute>
  );
}
