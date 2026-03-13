'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  CardMedia,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  BookmarkBorder,
  Bookmark,
  MoreVert,
  PlayArrow,
  VideoLibrary as ShortsIcon,
  EmojiEvents as TrophyIcon,
  Whatshot as FireIcon,
  CameraAlt as MemeCamIcon,
  CurrencyRupee as TipIcon,
  NotificationsOutlined as NotificationsIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI, Content, UIFeedResponse, UserEngagementStatus, BattleAPI, Battle, TextPostRequest } from '@/lib/api/content';
import { MonetizationAPI } from '@/lib/api/monetization';
import { isApiSuccess, formatTimeAgo as formatTimeAgoUtil, formatCreatorHandle, getHandleInitial } from '@/lib/api/client';
import { UserAPI } from '@/lib/api/user';
import CommentDialog from '@/components/content/CommentDialog';
import FeedAdCard from '@/components/ads/FeedAdCard';
import ShareDialog from '@/components/ShareDialog';


function FeedPageContent() {
  const [feedData, setFeedData] = useState<Content[]>([]);
  const [hotNowData, setHotNowData] = useState<Content[]>([]);
  const [shortsData, setShortsData] = useState<Content[]>([]);
  const [shortsLoading, setShortsLoading] = useState(true);
  const [engagements, setEngagements] = useState<{ [contentId: string]: UserEngagementStatus }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentContentId, setCommentContentId] = useState<string>('');
  const [creatorProfiles, setCreatorProfiles] = useState<{ [id: string]: { name: string; avatar?: string } }>({});
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [activeBattleCount, setActiveBattleCount] = useState<number>(0);
  const [composeExpanded, setComposeExpanded] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeHashtags, setComposeHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [composePosting, setComposePosting] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharePostId, setSharePostId] = useState<string>('');
  const [sharePostTitle, setSharePostTitle] = useState<string>('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const composeBodyRef = useRef<HTMLTextAreaElement>(null);
  const composeBoxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  const COMPOSE_MAX_CHARS = 1000;

  // Collapse compose box when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (composeBoxRef.current && !composeBoxRef.current.contains(e.target as Node) && !composeBody && !composeTitle) {
        setComposeExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [composeBody, composeTitle]);

  const handleComposeSubmit = async () => {
    if (!user?.id || !user?.username || !composeBody.trim()) return;
    setComposePosting(true);
    try {
      const data: TextPostRequest = {
        description: composeBody.trim(),
        hashtags: composeHashtags.length > 0 ? composeHashtags : undefined,
      };
      if (composeTitle.trim()) data.title = composeTitle.trim();
      const response = await ContentAPI.createTextPost(data, user.id, user.creatorHandle || user.displayName || user.name || user.username);
      if (isApiSuccess(response) && response.data) {
        setFeedData(prev => [response.data, ...prev]);
        setComposeBody('');
        setComposeTitle('');
        setComposeHashtags([]);
        setHashtagInput('');
        setComposeExpanded(false);
      }
    } catch (err) {
      console.error('Failed to create text post:', err);
    } finally {
      setComposePosting(false);
    }
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && hashtagInput.trim()) {
      e.preventDefault();
      const tag = hashtagInput.trim().replace(/^#/, '');
      if (tag && !composeHashtags.includes(tag)) {
        setComposeHashtags(prev => [...prev, tag]);
      }
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setComposeHashtags(prev => prev.filter(t => t !== tag));
  };

  const resolveCreatorProfiles = async (posts: Content[]) => {
    const unknownCreatorIds = posts
      .filter(p => !creatorProfiles[p.creatorId] && (
        !p.creatorHandle || p.creatorHandle.startsWith('user_') || /^[a-f0-9]{24}$/.test(p.creatorHandle)
      ))
      .map(p => p.creatorId)
      .filter((id, i, arr) => arr.indexOf(id) === i);
    if (unknownCreatorIds.length === 0) return;
    const profiles: { [id: string]: { name: string; avatar?: string } } = {};
    await Promise.all(
      unknownCreatorIds.map(async (cid) => {
        try {
          const res = await UserAPI.getUserProfile(cid);
          if (isApiSuccess(res)) {
            const u = res.data;
            profiles[cid] = { name: u.creatorHandle || u.displayName || u.name || u.username || 'User', avatar: u.profilePicture };
          }
        } catch {}
      })
    );
    if (Object.keys(profiles).length > 0) setCreatorProfiles(prev => ({ ...prev, ...profiles }));
  };

  const getCreatorDisplayName = (post: Content) => {
    if (post.creatorHandle && !post.creatorHandle.startsWith('user_') && !/^[a-f0-9]{24}$/.test(post.creatorHandle))
      return formatCreatorHandle(post.creatorHandle);
    const profile = creatorProfiles[post.creatorId];
    return profile ? formatCreatorHandle(profile.name) : 'User';
  };

  const getCreatorInitial = (post: Content) => {
    if (post.creatorHandle && !post.creatorHandle.startsWith('user_') && !/^[a-f0-9]{24}$/.test(post.creatorHandle))
      return getHandleInitial(post.creatorHandle);
    const profile = creatorProfiles[post.creatorId];
    return profile ? getHandleInitial(profile.name) : 'U';
  };

  const getCreatorAvatar = (post: Content) => creatorProfiles[post.creatorId]?.avatar;

  useEffect(() => {
    loadTrendingData(); // Single call for both hot now and shorts
    // Load coin balance and battle count in parallel
    MonetizationAPI.getBalance().then(res => {
      if (isApiSuccess(res)) setCoinBalance(res.data);
    }).catch(() => {});
    BattleAPI.getLiveBattles(0, 1).then(res => {
      if (isApiSuccess(res)) setActiveBattleCount(res.data.totalElements || 0);
    }).catch(() => {});
  }, []);
  useEffect(() => { loadFeedData(true); }, []);

  // Combined trending data load - single API call for both hot now and shorts
  const loadTrendingData = async () => {
    try {
      setShortsLoading(true);
      const response = await ContentAPI.getTrendingFeed(0, 10, 24, user?.id);
      if (isApiSuccess(response)) {
        const allContent = response.data.content.content || [];
        setHotNowData(allContent.slice(0, 5));
        const shorts = allContent.filter((c: Content) => c.type === 'SHORT_VIDEO' && (c.status === 'PUBLISHED' || c.status === 'READY')).slice(0, 3);
        setShortsData(shorts);
      }
    } catch {} finally { setShortsLoading(false); }
  };

  const loadFeedData = async (resetFeed = false) => {
    try {
      if (resetFeed) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      const currentPage = resetFeed ? 0 : page;
      const response = await ContentAPI.getHomeFeed(currentPage, 10, user?.id);
      if (isApiSuccess(response)) {
        const newContent = response.data.content.content;
        const newEngagements = response.data.userEngagements;
        if (resetFeed) { setFeedData(newContent); setPage(1); }
        else { setFeedData(prev => [...prev, ...newContent]); setPage(prev => prev + 1); }
        setEngagements(prev => ({ ...prev, ...newEngagements }));
        setHasMore(!response.data.content.last);
        resolveCreatorProfiles(newContent);
      } else { setError((response as any).message || 'Failed to load feed'); }
    } catch (err: any) { setError(err.message || 'Failed to load feed'); }
    finally { setLoading(false); setLoadingMore(false); }
  };

  // Infinite scroll - auto-load when sentinel comes into view
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadFeedData(false);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page]);

  const handleLike = async (contentId: string) => {
    if (!user?.id) return;
    const isCurrentlyLiked = engagements[contentId]?.liked || false;
    const action = isCurrentlyLiked ? 'UNLIKE' : 'LIKE';
    setEngagements(prev => ({ ...prev, [contentId]: { ...prev[contentId], liked: !isCurrentlyLiked, contentId, userId: user.id } }));
    setFeedData(prev => prev.map(post => post.id === contentId ? { ...post, likeCount: post.likeCount + (isCurrentlyLiked ? -1 : 1) } : post));
    try {
      const response = await ContentAPI.recordEngagement(contentId, { action }, user.id, user.username);
      if (!isApiSuccess(response)) {
        setEngagements(prev => ({ ...prev, [contentId]: { ...prev[contentId], liked: isCurrentlyLiked } }));
        setFeedData(prev => prev.map(post => post.id === contentId ? { ...post, likeCount: post.likeCount + (isCurrentlyLiked ? 1 : -1) } : post));
      }
    } catch {}
  };

  const handleShare = async (contentId: string) => {
    if (!user?.id) return;
    const shareUrl = `${window.location.origin}/post/${contentId}`;
    try {
      if (navigator.share) { await navigator.share({ title: 'Check this out on MemeToMoney!', url: shareUrl }); }
      else { await navigator.clipboard.writeText(shareUrl); alert('Link copied!'); }
      await ContentAPI.recordEngagement(contentId, { action: 'SHARE' }, user.id, user.username);
      setFeedData(prev => prev.map(post => post.id === contentId ? { ...post, shareCount: post.shareCount + 1 } : post));
    } catch {}
  };

  const handleSave = async (contentId: string) => {
    if (!user?.id) return;
    const isCurrentlySaved = engagements[contentId]?.bookmarked || false;
    setEngagements(prev => ({ ...prev, [contentId]: { ...prev[contentId], bookmarked: !isCurrentlySaved, contentId, userId: user.id } }));
    try {
      if (isCurrentlySaved) await ContentAPI.unsavePost(contentId, user.id);
      else await ContentAPI.savePost(contentId, user.id);
    } catch {
      setEngagements(prev => ({ ...prev, [contentId]: { ...prev[contentId], bookmarked: isCurrentlySaved } }));
    }
  };

  const handleComment = (contentId: string) => { setCommentContentId(contentId); setCommentDialogOpen(true); };
  const formatTimeAgo = formatTimeAgoUtil;
  const getContentUrl = (content: Content) => content.processedFile?.cdnUrl || content.originalFile?.cdnUrl || content.thumbnailUrl;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuPostId(postId);
  };
  const handleMenuClose = () => { setMenuAnchorEl(null); setMenuPostId(null); };

  const handleDeleteClick = (postId: string) => {
    handleMenuClose();
    setDeletePostId(postId);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!deletePostId || !user?.id) return;
    setDeleting(true);
    try {
      const response = await ContentAPI.deleteContent(deletePostId);
      if (isApiSuccess(response)) {
        setFeedData(prev => prev.filter(p => p.id !== deletePostId));
        setDeleteDialogOpen(false);
        setDeletePostId(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };
  const handleDeleteCancel = () => { setDeleteDialogOpen(false); setDeletePostId(null); };

  const handleShareDialogOpen = (postId: string, title?: string) => {
    handleMenuClose();
    setSharePostId(postId);
    setSharePostTitle(title || '');
    setShareDialogOpen(true);
  };

  const handleCopyLink = async (postId: string) => {
    handleMenuClose();
    const shareUrl = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSnackbar({ open: true, message: 'Link copied!' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to copy link' });
    }
  };

  const handleMenuBookmark = (postId: string) => {
    handleMenuClose();
    handleSave(postId);
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth={false} sx={{ p: 0, maxWidth: { xs: '100%', sm: '100%', md: '100%' } }}>
        {/* Header */}
        <Box sx={{ position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1, p: 2, borderBottom: '1px solid #E5E7EB' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ fontFamily: 'cursive', fontWeight: 'bold', background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              MemeToMoney
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {/* Coin balance pill */}
              <Chip
                icon={<TipIcon sx={{ fontSize: 14, color: '#F59E0B !important' }} />}
                label={coinBalance}
                size="small"
                onClick={() => router.push('/profile')}
                sx={{ bgcolor: '#FFFBEB', color: '#92400E', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', '&:hover': { bgcolor: '#FEF3C7' } }}
              />
              <IconButton onClick={() => router.push('/search')} sx={{ color: '#6B7280' }} size="small"><SearchIcon /></IconButton>
              <IconButton onClick={() => router.push('/notifications')} sx={{ color: '#6B7280' }} size="small"><NotificationsIcon /></IconButton>
              <IconButton onClick={() => router.push('/messages')} sx={{ color: '#6B7280' }} size="small"><ChatBubbleOutline /></IconButton>
            </Box>
          </Box>
        </Box>

        {/* Quick Actions Bar - Battles, Leaderboard, Meme Cam */}
        <Box sx={{ display: 'flex', gap: 1, px: 2, py: 1.5, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          <Chip
            icon={<MemeCamIcon sx={{ fontSize: 16 }} />}
            label="Meme Cam"
            onClick={() => router.push('/meme-cam')}
            sx={{ bgcolor: '#6B46C1', color: 'white', fontWeight: 700, '&:hover': { bgcolor: '#553C9A' }, '& .MuiChip-icon': { color: 'white' } }}
          />
          <Chip
            icon={<FireIcon sx={{ fontSize: 16 }} />}
            label={activeBattleCount > 0 ? `Battles (${activeBattleCount})` : 'Battles'}
            onClick={() => router.push('/battles')}
            sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, '&:hover': { bgcolor: '#FDE68A' }, '& .MuiChip-icon': { color: '#92400E' } }}
          />
          <Chip
            icon={<TrophyIcon sx={{ fontSize: 16 }} />}
            label="Leaderboard"
            onClick={() => router.push('/leaderboard')}
            sx={{ bgcolor: '#EDE9FE', color: '#6B46C1', fontWeight: 700, '&:hover': { bgcolor: '#DDD6FE' }, '& .MuiChip-icon': { color: '#6B46C1' } }}
          />
        </Box>

        {/* Hot Now Carousel */}
        {hotNowData.length > 0 && (
          <Box sx={{ mb: 2, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <FireIcon sx={{ color: '#EF4444', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a1a1a' }}>Hot Now</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {hotNowData.map((post) => {
                const url = getContentUrl(post);
                return (
                  <Card
                    key={post.id}
                    sx={{
                      minWidth: 140, maxWidth: 140, borderRadius: 2, overflow: 'hidden',
                      flexShrink: 0, cursor: 'pointer',
                      transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)' },
                    }}
                  >
                    <Box sx={{ position: 'relative', aspectRatio: '3/4' }}>
                      {url ? (
                        <CardMedia component="img" image={url} alt={post.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #6B46C1, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem', textAlign: 'center', p: 1 }}>{post.title}</Typography>
                        </Box>
                      )}
                      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', p: 1, pt: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Favorite sx={{ fontSize: 12, color: '#EF4444' }} />
                          <Typography variant="caption" sx={{ color: 'white', fontSize: '0.65rem', fontWeight: 600 }}>
                            {post.likeCount > 999 ? `${(post.likeCount / 1000).toFixed(1)}K` : post.likeCount}
                          </Typography>
                        </Box>
                      </Box>
                      {/* Fire badge */}
                      <Box sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(239,68,68,0.9)', borderRadius: 1, px: 0.5, py: 0.25 }}>
                        <Typography sx={{ color: 'white', fontSize: '0.55rem', fontWeight: 800 }}>HOT</Typography>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Shorts Preview */}
        {shortsData.length > 0 && (
          <Box sx={{ mb: 2, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#374151' }}>
                <ShortsIcon sx={{ color: '#6B46C1', fontSize: 20 }} /> Shorts
              </Typography>
              <Button variant="text" onClick={() => router.push('/shorts')} sx={{ color: '#6B46C1', textTransform: 'none', fontWeight: 'bold', fontSize: '0.8rem', p: 0, minWidth: 'auto' }}>
                View All
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
              {shortsData.map((short) => {
                const thumbnailUrl = short.thumbnailUrl || short.processedFile?.cdnUrl || short.originalFile?.cdnUrl;
                return (
                  <Card key={short.id} onClick={() => router.push('/shorts')} sx={{ minWidth: 100, borderRadius: 2, overflow: 'hidden', position: 'relative', aspectRatio: '9/16', cursor: 'pointer', flexShrink: 0, '&:hover': { transform: 'scale(1.02)' }, transition: 'transform 0.2s' }}>
                    <CardMedia component="img" image={thumbnailUrl || `https://picsum.photos/300/400?random=${short.id}`} alt={short.title || 'Short'} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PlayArrow sx={{ color: 'white', fontSize: 16 }} />
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', p: 1, pt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Avatar sx={{ width: 16, height: 16, fontSize: '0.5rem' }}>{getHandleInitial(short.creatorHandle)}</Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.6rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formatCreatorHandle(short.creatorHandle)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Feed Label */}
        <Box sx={{ px: 2, mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#374151' }}>
            For You
          </Typography>
        </Box>

        {/* Compose Text Post */}
        <Box ref={composeBoxRef} sx={{ mx: 1, mb: 2 }}>
          <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Avatar
                  sx={{ bgcolor: '#6B46C1', width: 36, height: 36, fontSize: '0.9rem', mt: 0.5, flexShrink: 0 }}
                >
                  {user?.username ? getHandleInitial(user.username) : 'U'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {!composeExpanded ? (
                    <Box
                      onClick={() => { setComposeExpanded(true); setTimeout(() => composeBodyRef.current?.focus(), 100); }}
                      sx={{
                        py: 1.2, px: 2, bgcolor: '#F3F4F6', borderRadius: 3, cursor: 'pointer',
                        color: '#9CA3AF', fontSize: '0.9rem', '&:hover': { bgcolor: '#E5E7EB' },
                        transition: 'background 0.2s',
                      }}
                    >
                      What&apos;s on your mind?
                    </Box>
                  ) : (
                    <>
                      <TextField
                        placeholder="Title (optional)"
                        value={composeTitle}
                        onChange={(e) => setComposeTitle(e.target.value)}
                        fullWidth
                        size="small"
                        variant="standard"
                        InputProps={{ disableUnderline: true, sx: { fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' } }}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        inputRef={composeBodyRef}
                        placeholder="What's on your mind?"
                        value={composeBody}
                        onChange={(e) => {
                          if (e.target.value.length <= COMPOSE_MAX_CHARS) setComposeBody(e.target.value);
                        }}
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={8}
                        variant="standard"
                        InputProps={{ disableUnderline: true, sx: { fontSize: '0.95rem', color: '#374151', lineHeight: 1.6 } }}
                        sx={{ mb: 1 }}
                      />
                      {/* Character counter */}
                      <Typography variant="caption" sx={{ color: composeBody.length > COMPOSE_MAX_CHARS * 0.9 ? '#EF4444' : '#9CA3AF', display: 'block', textAlign: 'right', mb: 1 }}>
                        {composeBody.length}/{COMPOSE_MAX_CHARS}
                      </Typography>

                      {/* Hashtag chips */}
                      {composeHashtags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {composeHashtags.map(tag => (
                            <Chip
                              key={tag}
                              label={`#${tag}`}
                              size="small"
                              onDelete={() => removeHashtag(tag)}
                              deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                              sx={{ bgcolor: '#EDE9FE', color: '#6B46C1', fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Hashtag input */}
                      <TextField
                        placeholder="Add hashtags (press Enter)"
                        value={hashtagInput}
                        onChange={(e) => setHashtagInput(e.target.value)}
                        onKeyDown={handleHashtagKeyDown}
                        fullWidth
                        size="small"
                        variant="standard"
                        InputProps={{ disableUnderline: true, sx: { fontSize: '0.8rem', color: '#6B46C1' } }}
                        sx={{ mb: 1.5 }}
                      />

                      {/* Actions row */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() => { setComposeExpanded(false); setComposeBody(''); setComposeTitle(''); setComposeHashtags([]); setHashtagInput(''); }}
                          sx={{ textTransform: 'none', color: '#6B7280', fontSize: '0.85rem' }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!composeBody.trim() || composePosting}
                          onClick={handleComposeSubmit}
                          sx={{
                            textTransform: 'none', bgcolor: '#6B46C1', borderRadius: 2, px: 3,
                            fontWeight: 700, fontSize: '0.85rem',
                            '&:hover': { bgcolor: '#553C9A' },
                            '&.Mui-disabled': { bgcolor: '#D1D5DB', color: '#9CA3AF' },
                          }}
                        >
                          {composePosting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Post'}
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Loading */}
        {loading && feedData.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Box sx={{ px: 2, mb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
              <Button onClick={() => loadFeedData(true)} sx={{ ml: 2, color: 'inherit' }}>Retry</Button>
            </Alert>
          </Box>
        )}

        {/* Feed Posts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 1 }}>
          {feedData.map((post, index) => {
            const engagement = engagements[post.id];
            const isLiked = engagement?.liked || false;
            const contentUrl = getContentUrl(post);

            return (
              <React.Fragment key={post.id}>
              {/* Native Ad - appears after every 3rd post (starting after post 3) */}
              {index > 0 && index % 3 === 0 && (
                <FeedAdCard />
              )}
              {/* Daily Challenge Card - appears after 2nd post */}
              {index === 2 && (
                <Card sx={{ borderRadius: 3, overflow: 'hidden', background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F59E0B 100%)', color: 'white', cursor: 'pointer' }}
                  onClick={() => router.push('/battles')}
                >
                  <Box sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <FireIcon sx={{ fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        Daily Meme Challenge
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                      Battle for 500 Coins!
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1.5 }}>
                      Create a meme, challenge a creator, win coins
                    </Typography>
                    <Chip label="Join Battle" size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' } }}
                    />
                  </Box>
                </Card>
              )}
              <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.15)' } }}>
                {/* Post Header */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => router.push(`/profile/${post.creatorId}`)}>
                    <Avatar src={getCreatorAvatar(post)} sx={{ bgcolor: '#6B46C1', width: 36, height: 36, fontSize: '0.9rem' }}>{getCreatorInitial(post)}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{getCreatorDisplayName(post)}</Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem' }}>{formatTimeAgo(post.publishedAt || post.createdAt)}</Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, post.id)}><MoreVert sx={{ fontSize: 18 }} /></IconButton>
                  <Menu
                    anchorEl={menuPostId === post.id ? menuAnchorEl : null}
                    open={menuPostId === post.id && Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 180 } }}
                  >
                    <MenuItem onClick={() => handleShareDialogOpen(post.id, post.title || post.description)}>
                      <ListItemIcon><Share sx={{ fontSize: 20 }} /></ListItemIcon>
                      <ListItemText>Share</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleMenuBookmark(post.id)}>
                      <ListItemIcon>
                        {engagement?.bookmarked
                          ? <Bookmark sx={{ fontSize: 20, color: '#6B46C1' }} />
                          : <BookmarkBorder sx={{ fontSize: 20 }} />}
                      </ListItemIcon>
                      <ListItemText>{engagement?.bookmarked ? 'Unsave' : 'Save'}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleCopyLink(post.id)}>
                      <ListItemIcon><CopyIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                      <ListItemText>Copy Link</ListItemText>
                    </MenuItem>
                    {user?.id === post.creatorId && (
                      <MenuItem onClick={() => handleDeleteClick(post.id)} sx={{ color: '#DC2626' }}>
                        <ListItemIcon><DeleteIcon sx={{ color: '#DC2626', fontSize: 20 }} /></ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                      </MenuItem>
                    )}
                    {user?.id !== post.creatorId && (
                      <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon><FlagIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                        <ListItemText>Report</ListItemText>
                      </MenuItem>
                    )}
                  </Menu>
                </Box>

                {/* Post Content */}
                {post.type === 'TEXT_POST' ? (
                  <Box sx={{ px: 2, pb: 1 }}>
                    {post.title && (
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a', lineHeight: 1.3, fontSize: '1.05rem' }}>
                        {post.title}
                      </Typography>
                    )}
                    <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 2, p: 2.5, borderLeft: '4px solid #6B46C1' }}>
                      <Typography variant="body1" sx={{ color: '#374151', fontSize: '1rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {post.description}
                      </Typography>
                    </Box>
                  </Box>
                ) : contentUrl ? (
                  <Box sx={{ position: 'relative' }}>
                    {post.type === 'SHORT_VIDEO' ? (
                      <Box component="video" src={contentUrl} poster={post.thumbnailUrl} controls sx={{ width: '100%', maxHeight: { xs: 500, md: 600 }, objectFit: 'contain', backgroundColor: '#000' }}
                        onPlay={() => { if (user?.id) ContentAPI.recordView(post.id, user.id); }}
                      />
                    ) : (
                      <CardMedia component="img" image={contentUrl} alt={post.title || 'Content'} sx={{ width: '100%', maxHeight: { xs: 500, md: 600 }, objectFit: 'contain', bgcolor: '#f0f0f0', cursor: 'pointer' }}
                        onClick={() => { if (user?.id) ContentAPI.recordView(post.id, user.id); }}
                      />
                    )}
                  </Box>
                ) : null}

                {/* Post Actions */}
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <IconButton onClick={() => handleLike(post.id)} sx={{ p: 0 }} size="small">
                        {isLiked ? <Favorite sx={{ color: '#E91E63', fontSize: 22 }} /> : <FavoriteBorder sx={{ fontSize: 22 }} />}
                      </IconButton>
                      <IconButton onClick={() => handleComment(post.id)} sx={{ p: 0 }} size="small"><ChatBubbleOutline sx={{ fontSize: 22 }} /></IconButton>
                      <IconButton onClick={() => handleShareDialogOpen(post.id, post.title || post.description)} sx={{ p: 0 }} size="small"><Share sx={{ fontSize: 22 }} /></IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* Tip button */}
                      {post.monetizationEnabled && (
                        <IconButton sx={{ p: 0, color: '#F59E0B' }} size="small"><TipIcon sx={{ fontSize: 22 }} /></IconButton>
                      )}
                      <IconButton onClick={() => handleSave(post.id)} sx={{ p: 0 }} size="small">
                        {engagement?.bookmarked ? <Bookmark sx={{ color: '#6B46C1', fontSize: 22 }} /> : <BookmarkBorder sx={{ fontSize: 22 }} />}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Like Count + Earnings hint */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {post.likeCount > 0 && (
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                        {post.likeCount.toLocaleString()} likes
                      </Typography>
                    )}
                    {post.monetizationEnabled && post.likeCount > 50 && (
                      <Chip label="Earning" size="small" icon={<TipIcon sx={{ fontSize: 12, color: '#059669 !important' }} />}
                        sx={{ height: 20, bgcolor: '#ECFDF5', color: '#059669', fontSize: '0.6rem', fontWeight: 700, '& .MuiChip-icon': { ml: 0.5 } }}
                      />
                    )}
                  </Box>

                  {/* Caption */}
                  {(post.title || post.description) && (
                    <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 'bold' }}>{getCreatorDisplayName(post)}</span>{' '}
                      {post.title || post.description}
                    </Typography>
                  )}

                  {/* View Comments */}
                  {post.commentCount > 0 && (
                    <Typography variant="body2" sx={{ color: '#6B7280', cursor: 'pointer', mb: 0.5, fontSize: '0.8rem' }} onClick={() => handleComment(post.id)}>
                      View all {post.commentCount} comments
                    </Typography>
                  )}

                  {/* Reply with Meme hint */}
                  <Typography variant="caption" sx={{ color: '#8B5CF6', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }} onClick={() => handleComment(post.id)}>
                    Reply with a meme...
                  </Typography>

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <Typography variant="body2" sx={{ color: '#6B46C1', fontSize: '0.8rem', mt: 0.5 }}>
                      {post.hashtags.map(tag => `#${tag}`).join(' ')}
                    </Typography>
                  )}

                  {(post.viewCount > 0 || post.shareCount > 0) && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, pt: 1, borderTop: '1px solid #f0f0f0' }}>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>{post.viewCount.toLocaleString()} views</Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>{post.shareCount.toLocaleString()} shares</Typography>
                    </Box>
                  )}
                </Box>
              </Card>
              </React.Fragment>
            );
          })}
        </Box>

        {/* Infinite scroll sentinel */}
        {hasMore && feedData.length > 0 && (
          <Box ref={loadMoreRef} sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            {loadingMore && <CircularProgress size={28} sx={{ color: '#6B46C1' }} />}
          </Box>
        )}

        {/* Empty State */}
        {!loading && feedData.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>No content found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Be the first to share something amazing!</Typography>
            <Button variant="contained" onClick={() => router.push('/meme-cam')} startIcon={<MemeCamIcon />}
              sx={{ bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#553C9A' } }}>
              Create a Meme
            </Button>
          </Box>
        )}
      </Container>

      <CommentDialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} contentId={commentContentId} />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false);
          // Record share engagement
          if (sharePostId && user?.id) {
            ContentAPI.recordEngagement(sharePostId, { action: 'SHARE' }, user.id, user.username).catch(() => {});
            setFeedData(prev => prev.map(p => p.id === sharePostId ? { ...p, shareCount: p.shareCount + 1 } : p));
          }
        }}
        contentId={sharePostId}
        title={sharePostTitle}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#374151' }}>Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#6B7280' }}>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} disabled={deleting} sx={{ textTransform: 'none', color: '#6B7280', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            sx={{ textTransform: 'none', bgcolor: '#DC2626', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: '#B91C1C' } }}
          >
            {deleting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for copy link feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedPageContent />
    </ProtectedRoute>
  );
}
