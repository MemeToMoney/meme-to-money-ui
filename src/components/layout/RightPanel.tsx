'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  Tag as TagIcon,
  EmojiEvents as TrophyIcon,
  PersonAdd as PersonAddIcon,
  CurrencyRupee as CoinIcon,
  Timer as TimerIcon,
  Whatshot as FireIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI } from '@/lib/api/content';
import { MonetizationAPI, LeaderboardEntry } from '@/lib/api/monetization';
import { UserAPI, UserSummary } from '@/lib/api/user';
import { isApiSuccess, formatCreatorHandle, getHandleInitial } from '@/lib/api/client';
import { getChallengeOfTheWeek } from '@/data/weekly-challenges';

interface TrendingTag {
  hashtag: string;
  count: number;
}

export default function RightPanel() {
  const router = useRouter();
  const { user } = useAuth();

  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  const [topEarners, setTopEarners] = useState<(LeaderboardEntry & { resolvedName?: string; resolvedPicture?: string })[]>([]);
  const [earnersLoading, setEarnersLoading] = useState(true);

  const [suggestedUsers, setSuggestedUsers] = useState<UserSummary[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch trending hashtags
    ContentAPI.getTrendingHashtags(10)
      .then((res) => {
        if (isApiSuccess(res)) {
          // API may return array of { hashtag, count } or similar
          const tags = Array.isArray(res.data) ? res.data : [];
          setTrendingTags(tags.slice(0, 8));
        }
      })
      .catch(() => {})
      .finally(() => setTagsLoading(false));

    // Fetch leaderboard and resolve user names
    MonetizationAPI.getLeaderboard('weekly', 5)
      .then(async (res) => {
        if (isApiSuccess(res)) {
          const entries = Array.isArray(res.data) ? res.data.slice(0, 5) : [];
          setTopEarners(entries);
          // Resolve profiles for entries missing handle/displayName
          const needsResolve = entries.filter(
            (e) => !e.handle && !e.displayName
          );
          if (needsResolve.length > 0) {
            const resolved = await Promise.all(
              needsResolve.map(async (entry) => {
                try {
                  const profileRes = await UserAPI.getUserProfile(entry.userId);
                  if (isApiSuccess(profileRes)) {
                    const u = profileRes.data;
                    return {
                      userId: entry.userId,
                      name: u.creatorHandle || u.displayName || u.name || u.username || 'User',
                      picture: u.profilePicture,
                    };
                  }
                } catch {}
                return null;
              })
            );
            setTopEarners((prev) =>
              prev.map((entry) => {
                const match = resolved.find((r) => r && r.userId === entry.userId);
                if (match) {
                  return { ...entry, resolvedName: match.name, resolvedPicture: match.picture };
                }
                return entry;
              })
            );
          }
        }
      })
      .catch(() => {})
      .finally(() => setEarnersLoading(false));

    // Fetch suggested users
    UserAPI.getSuggestions(5)
      .then((res) => {
        if (isApiSuccess(res)) {
          const users = Array.isArray(res.data) ? res.data : [];
          setSuggestedUsers(users.slice(0, 5));
        }
      })
      .catch(() => {})
      .finally(() => setSuggestionsLoading(false));
  }, []);

  const handleFollow = async (userId: string) => {
    try {
      const res = await UserAPI.followUser(userId);
      if (isApiSuccess(res)) {
        setFollowingIds((prev) => new Set(prev).add(userId));
      }
    } catch {}
  };

  const handleUnfollow = async (userId: string) => {
    try {
      const res = await UserAPI.unfollowUser(userId);
      if (isApiSuccess(res)) {
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    } catch {}
  };

  const sectionHeaderSx = {
    fontWeight: 800,
    fontSize: '0.8rem',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1.5,
  };

  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        bgcolor: '#f8f9fa',
        borderLeft: '1px solid #E5E7EB',
        p: 2,
        display: { xs: 'none', lg: 'block' },
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#D1D5DB', borderRadius: 2 },
      }}
    >
      {/* ===== Weekly Challenge ===== */}
      {(() => {
        const challenge = getChallengeOfTheWeek();
        const now = new Date();
        const diff = challenge.endDate.getTime() - now.getTime();
        const daysLeft = Math.max(0, Math.floor(diff / 86400000));
        const hoursLeft = Math.max(0, Math.floor((diff % 86400000) / 3600000));
        return (
          <Box sx={{ mb: 3 }}>
            <Typography sx={sectionHeaderSx}>
              <FireIcon sx={{ fontSize: 18, color: '#EF4444' }} />
              Weekly Challenge
            </Typography>
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(107, 70, 193, 0.15)' },
              }}
              onClick={() => router.push('/battles')}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                  color: 'white',
                  p: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <TrophyIcon sx={{ fontSize: 16, color: '#FDE68A' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.6rem' }}>
                    This Week
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 0.5 }}>
                  {challenge.theme}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, fontSize: '0.65rem', lineHeight: 1.4, mb: 1 }}>
                  {challenge.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#FDE68A', fontSize: '0.65rem' }}>
                    Win up to ₹{challenge.prizePool}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimerIcon sx={{ fontSize: 12 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem' }}>
                      {diff > 0 ? `${daysLeft}d ${hoursLeft}h` : 'Ended'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      })()}

      {/* ===== Trending Tags ===== */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={sectionHeaderSx}>
          <TagIcon sx={{ fontSize: 18, color: '#6B46C1' }} />
          Trending Tags
        </Typography>
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
          }}
        >
          {tagsLoading ? (
            <Box sx={{ p: 1.5 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="text" height={28} sx={{ mb: 0.5 }} />
              ))}
            </Box>
          ) : trendingTags.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#9CA3AF', p: 2, display: 'block', textAlign: 'center' }}>
              No trending tags yet
            </Typography>
          ) : (
            trendingTags.map((tag, idx) => (
              <Box
                key={tag.hashtag}
                onClick={() => router.push(`/search?q=${encodeURIComponent(tag.hashtag)}`)}
                sx={{
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: '#F9FAFB' },
                  borderBottom: idx < trendingTags.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#6B46C1', fontSize: '0.82rem' }}>
                    #{tag.hashtag}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem' }}>
                    {tag.count?.toLocaleString() || 0} posts
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#D1D5DB', fontWeight: 700, fontSize: '0.7rem' }}>
                  {idx + 1}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* ===== Top Earners ===== */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={sectionHeaderSx}>
          <TrophyIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
          Top Earners
        </Typography>
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
          }}
        >
          {earnersLoading ? (
            <Box sx={{ p: 1.5 }}>
              {[...Array(5)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={18} />
                    <Skeleton variant="text" width="40%" height={14} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : topEarners.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#9CA3AF', p: 2, display: 'block', textAlign: 'center' }}>
              Leaderboard coming soon
            </Typography>
          ) : (
            topEarners.map((entry, idx) => {
              const rankColors = ['#F59E0B', '#9CA3AF', '#CD7F32'];
              const rankColor = idx < 3 ? rankColors[idx] : '#D1D5DB';
              return (
                <Box
                  key={entry.userId}
                  onClick={() => router.push(`/profile/${entry.userId}`)}
                  sx={{
                    px: 2,
                    py: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    '&:hover': { bgcolor: '#F9FAFB' },
                    borderBottom: idx < topEarners.length - 1 ? '1px solid #F3F4F6' : 'none',
                  }}
                >
                  {/* Rank badge */}
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      color: rankColor,
                      width: 18,
                      textAlign: 'center',
                    }}
                  >
                    {entry.rank || idx + 1}
                  </Typography>
                  <Avatar
                    src={entry.profilePicture || (entry as any).resolvedPicture}
                    sx={{ width: 32, height: 32, bgcolor: '#6B46C1', fontSize: '0.8rem' }}
                  >
                    {getHandleInitial(entry.handle || entry.displayName || (entry as any).resolvedName || 'User')}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: '#1a1a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatCreatorHandle(entry.handle || entry.displayName || (entry as any).resolvedName || 'User')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <CoinIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#92400E', fontSize: '0.7rem' }}>
                      {entry.totalCoins > 999
                        ? `${(entry.totalCoins / 1000).toFixed(1)}K`
                        : entry.totalCoins.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
        <Button
          variant="text"
          onClick={() => router.push('/leaderboard')}
          sx={{
            color: '#6B46C1',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.75rem',
            mt: 0.5,
            p: 0,
            minWidth: 'auto',
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          View Full Leaderboard
        </Button>
      </Box>

      {/* ===== Who to Follow ===== */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={sectionHeaderSx}>
          <PersonAddIcon sx={{ fontSize: 18, color: '#6B46C1' }} />
          Who to Follow
        </Typography>
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
          }}
        >
          {suggestionsLoading ? (
            <Box sx={{ p: 1.5 }}>
              {[...Array(3)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={18} />
                    <Skeleton variant="text" width="35%" height={14} />
                  </Box>
                  <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>
          ) : suggestedUsers.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#9CA3AF', p: 2, display: 'block', textAlign: 'center' }}>
              No suggestions right now
            </Typography>
          ) : (
            suggestedUsers.map((suggestedUser, idx) => {
              const isFollowing = followingIds.has(suggestedUser.id);
              return (
                <Box
                  key={suggestedUser.id}
                  sx={{
                    px: 2,
                    py: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: idx < suggestedUsers.length - 1 ? '1px solid #F3F4F6' : 'none',
                  }}
                >
                  <Avatar
                    src={suggestedUser.profilePicture}
                    onClick={() => router.push(`/profile/${suggestedUser.id}`)}
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: '#6B46C1',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {getHandleInitial(suggestedUser.creatorHandle || suggestedUser.displayName || suggestedUser.name)}
                  </Avatar>
                  <Box
                    sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    onClick={() => router.push(`/profile/${suggestedUser.id}`)}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: '#1a1a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatCreatorHandle(suggestedUser.creatorHandle || suggestedUser.displayName || suggestedUser.name)}
                    </Typography>
                    {suggestedUser.bio && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#9CA3AF',
                          fontSize: '0.65rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                      >
                        {suggestedUser.bio}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    size="small"
                    variant={isFollowing ? 'outlined' : 'contained'}
                    onClick={() => (isFollowing ? handleUnfollow(suggestedUser.id) : handleFollow(suggestedUser.id))}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      minWidth: 'auto',
                      ...(isFollowing
                        ? {
                            color: '#6B7280',
                            borderColor: '#E5E7EB',
                            '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' },
                          }
                        : {
                            bgcolor: '#6B46C1',
                            '&:hover': { bgcolor: '#553C9A' },
                          }),
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Typography
        variant="caption"
        sx={{ color: '#D1D5DB', fontSize: '0.6rem', display: 'block', textAlign: 'center', mt: 2 }}
      >
        MemeToMoney 2026
      </Typography>
    </Box>
  );
}
