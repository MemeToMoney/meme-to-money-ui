'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeOff as MuteIcon,
  VolumeUp as VolumeIcon,
  Favorite as LikeIcon,
  FavoriteBorder as UnlikeIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  PersonAdd as FollowIcon,
  Check as CheckIcon,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ContentAPI, Content } from '@/lib/api/content';
import { UserAPI } from '@/lib/api/user';
import { isApiSuccess, formatCreatorHandle, getHandleInitial } from '@/lib/api/client';
import CommentDialog from '@/components/content/CommentDialog';
import ShareDialog from '@/components/ShareDialog';
import ShortsAd from '@/components/ads/ShortsAd';

interface VideoPlayerProps {
  content: Content;
  isPlaying: boolean;
  isMuted: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onFollow: () => void;
  onProfileClick: () => void;
}

function VideoPlayer({
  content,
  isPlaying,
  isMuted,
  isLiked,
  isSaved,
  isFollowing,
  onPlayPause,
  onMuteToggle,
  onLike,
  onComment,
  onShare,
  onSave,
  onFollow,
  onProfileClick,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const videoUrl = content.processedFile?.cdnUrl || content.originalFile?.cdnUrl;
  const formatCount = (n: number) => n > 999 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', bgcolor: 'black', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={content.thumbnailUrl}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        loop
        playsInline
        onClick={onPlayPause}
      />

      {!isPlaying && (
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
          <IconButton
            onClick={onPlayPause}
            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', width: 80, height: 80 }}
          >
            <PlayIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>
      )}

      {/* Mute Toggle */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
        <IconButton onClick={onMuteToggle} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
          {isMuted ? <MuteIcon /> : <VolumeIcon />}
        </IconButton>
      </Box>

      {/* Creator Info */}
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 80, color: 'white', zIndex: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            onClick={onProfileClick}
            sx={{ width: 40, height: 40, border: '2px solid white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            {getHandleInitial(content.creatorHandle)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              onClick={onProfileClick}
              sx={{ fontWeight: 'bold', textShadow: '0 2px 6px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)', cursor: 'pointer' }}
            >
              {formatCreatorHandle(content.creatorHandle)}
            </Typography>
          </Box>
          <Button
            startIcon={isFollowing ? <CheckIcon /> : <FollowIcon />}
            variant="contained"
            size="small"
            onClick={onFollow}
            sx={{
              bgcolor: isFollowing ? 'rgba(255,255,255,0.2)' : '#6B46C1',
              color: 'white',
              textTransform: 'none',
              borderRadius: 20,
              px: 2,
              py: 0.5,
              '&:hover': { bgcolor: isFollowing ? 'rgba(255,255,255,0.3)' : '#553C9A' },
            }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </Box>

        <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.4, textShadow: '0 2px 6px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)' }}>
          {content.title || content.description}
        </Typography>

        {content.hashtags && content.hashtags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {content.hashtags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                size="small"
                sx={{ bgcolor: 'rgba(107,70,193,0.8)', color: 'white', fontSize: '0.75rem', height: 24, borderRadius: 12 }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Right Side Actions */}
      <Box sx={{ position: 'absolute', bottom: 100, right: 12, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', zIndex: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton onClick={onLike} sx={{ color: isLiked ? '#ff4444' : 'white', bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', width: 48, height: 48, transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.1)', bgcolor: 'rgba(0,0,0,0.65)' } }}>
            {isLiked ? <LikeIcon sx={{ fontSize: 28 }} /> : <UnlikeIcon sx={{ fontSize: 28 }} />}
          </IconButton>
          <Typography variant="caption" sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold', mt: 0.5, textShadow: '0 2px 6px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)' }}>
            {formatCount(content.likeCount || 0)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton onClick={onComment} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', width: 48, height: 48, transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.1)', bgcolor: 'rgba(0,0,0,0.65)' } }}>
            <CommentIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold', mt: 0.5, textShadow: '0 2px 6px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)' }}>
            {formatCount(content.commentCount || 0)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton onClick={onShare} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', width: 48, height: 48, transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.1)', bgcolor: 'rgba(0,0,0,0.65)' } }}>
            <ShareIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold', mt: 0.5, textShadow: '0 2px 6px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)' }}>
            {formatCount(content.shareCount || 0)}
          </Typography>
        </Box>

        <IconButton onClick={onSave} sx={{ color: isSaved ? '#FFD700' : 'white', bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', width: 48, height: 48, transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.1)', bgcolor: 'rgba(0,0,0,0.65)' } }}>
          {isSaved ? <Bookmark sx={{ fontSize: 28 }} /> : <BookmarkBorder sx={{ fontSize: 28 }} />}
        </IconButton>
      </Box>

      {/* View Count Badge */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 3 }}>
        <Chip
          label={`${(content.viewCount || 0).toLocaleString()} views`}
          size="small"
          sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.75rem', backdropFilter: 'blur(10px)' }}
        />
      </Box>
    </Box>
  );
}

function ShortsPageContent() {
  const [shorts, setShorts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentContentId, setCommentContentId] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareContentId, setShareContentId] = useState('');
  const [page, setPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadShorts(0);
  }, []);

  const loadShorts = async (pageNum: number) => {
    try {
      setLoading(true);
      // Try home feed first (most reliable), then trending as fallback
      let videoContent: Content[] = [];

      // Try home feed - it contains all content types including SHORT_VIDEO
      const homeResponse = await ContentAPI.getHomeFeed(pageNum, 20, user?.id);
      if (isApiSuccess(homeResponse)) {
        videoContent = (homeResponse.data.content?.content || []).filter(
          (c: Content) => c.type === 'SHORT_VIDEO' && (c.status === 'PUBLISHED' || c.status === 'READY')
        );
      }

      // If no shorts from home feed, try trending
      if (videoContent.length === 0) {
        const trendingResponse = await ContentAPI.getTrendingFeed(pageNum, 20, 168, user?.id);
        if (isApiSuccess(trendingResponse)) {
          videoContent = (trendingResponse.data.content?.content || []).filter(
            (c: Content) => c.type === 'SHORT_VIDEO' && (c.status === 'PUBLISHED' || c.status === 'READY')
          );
        }
      }

      if (pageNum === 0) {
        setShorts(videoContent);
        if (videoContent.length > 0) setPlayingVideo(videoContent[0].id);
      } else {
        setShorts(prev => [...prev, ...videoContent]);
      }
      setPage(pageNum);

      // Load engagement statuses
      if (user?.id && videoContent.length > 0) {
        const ids = videoContent.map((c: Content) => c.id);
        try {
          const engRes = await ContentAPI.getBulkEngagementStatus(ids, user.id);
          if (isApiSuccess(engRes)) {
            const engData = engRes.data;
            const newLiked: Record<string, boolean> = {};
            const newSaved: Record<string, boolean> = {};
            for (const [cid, status] of Object.entries(engData)) {
              newLiked[cid] = status.liked;
              newSaved[cid] = status.bookmarked;
            }
            setLikedMap(prev => ({ ...prev, ...newLiked }));
            setSavedMap(prev => ({ ...prev, ...newSaved }));
          }
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load shorts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (contentId: string) => {
    if (!user?.id) return;
    const isLiked = likedMap[contentId] || false;
    setLikedMap(prev => ({ ...prev, [contentId]: !isLiked }));
    setShorts(prev => prev.map(s => s.id === contentId
      ? { ...s, likeCount: (s.likeCount || 0) + (isLiked ? -1 : 1) } : s
    ));
    try {
      await ContentAPI.recordEngagement(contentId, { action: isLiked ? 'UNLIKE' : 'LIKE' }, user.id, user.username);
    } catch {
      setLikedMap(prev => ({ ...prev, [contentId]: isLiked }));
    }
  };

  const handleSave = async (contentId: string) => {
    if (!user?.id) return;
    const isSaved = savedMap[contentId] || false;
    setSavedMap(prev => ({ ...prev, [contentId]: !isSaved }));
    try {
      if (isSaved) await ContentAPI.unsavePost(contentId, user.id);
      else await ContentAPI.savePost(contentId, user.id);
    } catch {
      setSavedMap(prev => ({ ...prev, [contentId]: isSaved }));
    }
  };

  const handleFollow = async (creatorId: string) => {
    if (!user?.id || !creatorId) return;
    const isFollowing = followingMap[creatorId] || false;
    setFollowingMap(prev => ({ ...prev, [creatorId]: !isFollowing }));
    try {
      if (isFollowing) await UserAPI.unfollowUser(creatorId);
      else await UserAPI.followUser(creatorId);
    } catch {
      setFollowingMap(prev => ({ ...prev, [creatorId]: isFollowing }));
    }
  };

  const handleComment = (contentId: string) => {
    setCommentContentId(contentId);
    setCommentDialogOpen(true);
  };

  const handleShare = (contentId: string) => {
    setShareContentId(contentId);
    setShareDialogOpen(true);
    if (user?.id) {
      ContentAPI.recordEngagement(contentId, { action: 'SHARE' }, user.id, user.username).catch(() => {});
    }
  };

  useEffect(() => {
    if (shorts[currentVideoIndex]) {
      setPlayingVideo(shorts[currentVideoIndex].id);
      // Record view
      if (user?.id) {
        ContentAPI.recordView(shorts[currentVideoIndex].id, user.id).catch(() => {});
      }
    }
  }, [currentVideoIndex]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      const viewportHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / viewportHeight);
      if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < shorts.length) {
        setCurrentVideoIndex(newIndex);
      }
      // Load more when near end
      if (newIndex >= shorts.length - 2) {
        loadShorts(page + 1);
      }
    }
  };

  if (loading && shorts.length === 0) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'black' }}>
        <CircularProgress sx={{ color: '#6B46C1' }} />
      </Box>
    );
  }

  if (!loading && shorts.length === 0) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'black', color: 'white', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">No shorts yet</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Be the first to upload a short video!</Typography>
        <Button onClick={() => router.push('/upload')} sx={{ color: '#6B46C1', textTransform: 'none', fontWeight: 600 }}>
          Create Short
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ p: 0, height: '100vh', overflow: 'hidden' }}>
      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          height: '100vh',
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {shorts.map((content, index) => (
          <React.Fragment key={content.id}>
            {/* Ad slot every 3 videos (after 3rd, 6th, 9th...) */}
            {index > 0 && index % 3 === 0 && (
              <Box sx={{ height: '100vh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
                <ShortsAd />
              </Box>
            )}
            <Box sx={{ height: '100vh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
              <VideoPlayer
                content={content}
                isPlaying={playingVideo === content.id}
                isMuted={isMuted}
                isLiked={likedMap[content.id] || false}
                isSaved={savedMap[content.id] || false}
                isFollowing={followingMap[content.creatorId] || false}
                onPlayPause={() => setPlayingVideo(prev => prev === content.id ? null : content.id)}
                onMuteToggle={() => setIsMuted(prev => !prev)}
                onLike={() => handleLike(content.id)}
                onComment={() => handleComment(content.id)}
                onShare={() => handleShare(content.id)}
                onSave={() => handleSave(content.id)}
                onFollow={() => handleFollow(content.creatorId)}
                onProfileClick={() => router.push(`/profile/${content.creatorId}`)}
              />
            </Box>
          </React.Fragment>
        ))}
      </Box>

      {/* Page Indicator */}
      <Box sx={{ position: 'fixed', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 1, zIndex: 10 }}>
        {shorts.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 4,
              height: currentVideoIndex === index ? 20 : 8,
              bgcolor: currentVideoIndex === index ? 'white' : 'rgba(255,255,255,0.5)',
              borderRadius: 2,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>

      {/* Header */}
      <Box sx={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 6px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)', bgcolor: 'rgba(0,0,0,0.3)', px: 2, py: 0.5, borderRadius: 20, backdropFilter: 'blur(10px)' }}>
          Shorts
        </Typography>
      </Box>

      {/* Comment Dialog */}
      <CommentDialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        contentId={commentContentId}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        contentId={shareContentId}
      />
    </Container>
  );
}

export default function ShortsPage() {
  return (
    <ProtectedRoute>
      <ShortsPageContent />
    </ProtectedRoute>
  );
}
