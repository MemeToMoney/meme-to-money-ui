import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Avatar,
    IconButton,
    CardMedia,
} from '@mui/material';
import {
    Favorite,
    FavoriteBorder,
    ChatBubbleOutline,
    Share,
    BookmarkBorder,
    MoreVert,
} from '@mui/icons-material';
import { Content, ContentAPI, UserEngagementStatus } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeedPostCardProps {
    post: Content;
    initialEngagement?: UserEngagementStatus;
    onLike?: (contentId: string, isLiked: boolean) => void;
    onComment?: (contentId: string) => void;
    onShare?: (contentId: string) => void;
    onSave?: (contentId: string) => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
    post,
    initialEngagement,
    onLike,
    onComment,
    onShare,
    onSave,
}) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(initialEngagement?.liked || false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [shareCount, setShareCount] = useState(post.shareCount);

    const getContentUrl = (content: Content) => {
        return content.processedFile?.cdnUrl || content.originalFile?.cdnUrl || content.thumbnailUrl;
    };

    const getContentAlt = (content: Content) => {
        return content.title || content.description || 'Content';
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) return 'now';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInHours < 24) return `${diffInHours}h`;
        if (diffInDays < 7) return `${diffInDays}d`;
        return date.toLocaleDateString();
    };

    const handleLikeClick = async () => {
        if (!user?.id) return;

        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => prev + (newIsLiked ? 1 : -1));

        if (onLike) {
            onLike(post.id, newIsLiked);
        }

        try {
            const response = await ContentAPI.recordEngagement(
                post.id,
                { action: newIsLiked ? 'LIKE' : 'UNLIKE' },
                user.id,
                user.username
            );

            if (!isApiSuccess(response)) {
                // Revert on failure
                setIsLiked(!newIsLiked);
                setLikeCount(prev => prev + (!newIsLiked ? 1 : -1));
            }
        } catch (error) {
            console.error('Like error:', error);
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikeCount(prev => prev + (!newIsLiked ? 1 : -1));
        }
    };

    const handleShareClick = async () => {
        if (!user?.id) return;

        setShareCount(prev => prev + 1);
        if (onShare) onShare(post.id);

        try {
            await ContentAPI.recordEngagement(
                post.id,
                { action: 'SHARE' },
                user.id,
                user.username
            );
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const contentUrl = getContentUrl(post);

    return (
        <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%' }}>
            {/* Post Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#6B46C1' }}>
                        {post.creatorHandle ? post.creatorHandle.charAt(1)?.toUpperCase() : 'U'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {post.creatorHandle || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            {formatTimeAgo(post.publishedAt || post.createdAt)}
                        </Typography>
                    </Box>
                </Box>
                <IconButton>
                    <MoreVert />
                </IconButton>
            </Box>

            {/* Post Content */}
            {contentUrl && (
                <Box sx={{ position: 'relative' }}>
                    {post.type === 'SHORT_VIDEO' ? (
                        <Box
                            component="video"
                            src={contentUrl}
                            poster={post.thumbnailUrl}
                            controls
                            sx={{
                                width: '100%',
                                maxHeight: 600,
                                objectFit: 'contain',
                                backgroundColor: '#000'
                            }}
                            onPlay={() => {
                                if (user?.id) {
                                    ContentAPI.recordView(post.id, user.id);
                                }
                            }}
                        />
                    ) : (
                        <CardMedia
                            component="img"
                            image={contentUrl}
                            alt={getContentAlt(post)}
                            sx={{
                                width: '100%',
                                maxHeight: 600,
                                objectFit: 'contain',
                                bgcolor: '#f0f0f0',
                            }}
                            onClick={() => {
                                if (user?.id) {
                                    ContentAPI.recordView(post.id, user.id);
                                }
                            }}
                        />
                    )}
                </Box>
            )}

            {/* Post Actions */}
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <IconButton onClick={handleLikeClick} sx={{ p: 0 }}>
                            {isLiked ? (
                                <Favorite sx={{ color: '#E91E63' }} />
                            ) : (
                                <FavoriteBorder />
                            )}
                        </IconButton>
                        <IconButton onClick={() => onComment && onComment(post.id)} sx={{ p: 0 }}>
                            <ChatBubbleOutline />
                        </IconButton>
                        <IconButton onClick={handleShareClick} sx={{ p: 0 }}>
                            <Share />
                        </IconButton>
                    </Box>
                    <IconButton onClick={() => onSave && onSave(post.id)} sx={{ p: 0 }}>
                        <BookmarkBorder />
                    </IconButton>
                </Box>

                {/* Like Count */}
                {likeCount > 0 && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {likeCount.toLocaleString()} likes
                    </Typography>
                )}

                {/* Caption */}
                {(post.title || post.description) && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <span style={{ fontWeight: 'bold' }}>{post.creatorHandle}</span>{' '}
                        {post.title || post.description}
                    </Typography>
                )}

                {/* View Comments */}
                {post.commentCount > 0 && (
                    <Typography
                        variant="body2"
                        sx={{ color: '#666', cursor: 'pointer', mb: 1 }}
                        onClick={() => onComment && onComment(post.id)}
                    >
                        View all {post.commentCount} comments
                    </Typography>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                    <Typography variant="body2" sx={{ color: '#6B46C1' }}>
                        {post.hashtags.map(tag => `#${tag}`).join(' ')}
                    </Typography>
                )}

                {/* Views and Shares */}
                {(post.viewCount > 0 || shareCount > 0) && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid #f0f0f0' }}>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            {post.viewCount.toLocaleString()} views
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            {shareCount.toLocaleString()} shares
                        </Typography>
                    </Box>
                )}
            </Box>
        </Card>
    );
};
