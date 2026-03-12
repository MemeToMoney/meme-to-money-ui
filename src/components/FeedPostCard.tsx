import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Avatar,
    IconButton,
    CardMedia,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
} from '@mui/material';
import {
    Favorite,
    FavoriteBorder,
    ChatBubbleOutline,
    Share,
    BookmarkBorder,
    Bookmark,
    MoreVert,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { Content, ContentAPI, UserEngagementStatus } from '@/lib/api/content';
import { isApiSuccess, formatTimeAgo, formatCreatorHandle, getHandleInitial } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import ShareDialog from './ShareDialog';

interface FeedPostCardProps {
    post: Content;
    initialEngagement?: UserEngagementStatus;
    onLike?: (contentId: string, isLiked: boolean) => void;
    onComment?: (contentId: string) => void;
    onShare?: (contentId: string) => void;
    onSave?: (contentId: string) => void;
    onDelete?: (contentId: string) => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
    post,
    initialEngagement,
    onLike,
    onComment,
    onShare,
    onSave,
    onDelete,
}) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(initialEngagement?.liked || false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [shareCount, setShareCount] = useState(post.shareCount);
    const [isSaved, setIsSaved] = useState(initialEngagement?.bookmarked || false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isOwnPost = user?.id === post.creatorId;

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!user?.id) return;
        setDeleting(true);
        try {
            const response = await ContentAPI.deleteContent(post.id);
            if (isApiSuccess(response)) {
                setDeleteDialogOpen(false);
                if (onDelete) onDelete(post.id);
            } else {
                console.error('Failed to delete post:', (response as any).message);
            }
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    const getContentUrl = (content: Content) => {
        return content.processedFile?.cdnUrl || content.originalFile?.cdnUrl || content.thumbnailUrl;
    };

    const getContentAlt = (content: Content) => {
        return content.title || content.description || 'Content';
    };

    // formatTimeAgo and formatCreatorHandle are now imported from client.ts

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

    const handleShareClick = () => {
        setShareDialogOpen(true);
        if (!user?.id) return;
        setShareCount(prev => prev + 1);
        if (onShare) onShare(post.id);
        ContentAPI.recordEngagement(post.id, { action: 'SHARE' }, user.id, user.username).catch(() => {});
    };

    const handleSaveClick = async () => {
        if (!user?.id) return;
        const newSaved = !isSaved;
        setIsSaved(newSaved);
        if (onSave) onSave(post.id);
        try {
            if (newSaved) {
                await ContentAPI.savePost(post.id, user.id);
            } else {
                await ContentAPI.unsavePost(post.id, user.id);
            }
        } catch {
            setIsSaved(!newSaved);
        }
    };

    const contentUrl = getContentUrl(post);

    return (
        <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', transition: 'all 0.2s ease-in-out', '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.15)' } }}>
            {/* Post Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#6B46C1' }}>
                        {getHandleInitial(post.creatorHandle)}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {formatCreatorHandle(post.creatorHandle)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {formatTimeAgo(post.publishedAt || post.createdAt)}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleMenuOpen}>
                    <MoreVert />
                </IconButton>
                <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            minWidth: 160,
                        }
                    }}
                >
                    {isOwnPost && (
                        <MenuItem onClick={handleDeleteClick} sx={{ color: '#DC2626' }}>
                            <ListItemIcon>
                                <DeleteIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText>Delete</ListItemText>
                        </MenuItem>
                    )}
                    {!isOwnPost && (
                        <MenuItem onClick={handleMenuClose}>
                            <ListItemText>Report</ListItemText>
                        </MenuItem>
                    )}
                </Menu>
            </Box>

            {/* Post Content */}
            {post.type === 'TEXT_POST' ? (
                <Box sx={{ px: 2, pb: 1 }}>
                    {post.title && (
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a', lineHeight: 1.3 }}>
                            {post.title}
                        </Typography>
                    )}
                    <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 2, p: 2.5, borderLeft: '4px solid #6B46C1' }}>
                        <Typography variant="body1" sx={{ color: '#374151', fontSize: '1.05rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {post.description}
                        </Typography>
                    </Box>
                    {post.hashtags && post.hashtags.length > 0 && (
                        <Typography variant="body2" sx={{ color: '#6B46C1', mt: 1.5 }}>
                            {post.hashtags.map(tag => `#${tag}`).join(' ')}
                        </Typography>
                    )}
                </Box>
            ) : contentUrl ? (
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
            ) : null}

            {/* Post Actions */}
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <IconButton onClick={handleLikeClick} sx={{ p: 0, transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.15)' } }}>
                            {isLiked ? (
                                <Favorite sx={{ color: '#E91E63' }} />
                            ) : (
                                <FavoriteBorder />
                            )}
                        </IconButton>
                        <IconButton onClick={() => onComment && onComment(post.id)} sx={{ p: 0, transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.15)' } }}>
                            <ChatBubbleOutline />
                        </IconButton>
                        <IconButton onClick={handleShareClick} sx={{ p: 0, transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.15)' } }}>
                            <Share />
                        </IconButton>
                    </Box>
                    <IconButton onClick={handleSaveClick} sx={{ p: 0, transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.15)' } }}>
                        {isSaved ? <Bookmark sx={{ color: '#111827' }} /> : <BookmarkBorder />}
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
                        <span style={{ fontWeight: 'bold' }}>{formatCreatorHandle(post.creatorHandle)}</span>{' '}
                        {post.title || post.description}
                    </Typography>
                )}

                {/* View Comments */}
                {post.commentCount > 0 && (
                    <Typography
                        variant="body2"
                        sx={{ color: '#6B7280', cursor: 'pointer', mb: 1 }}
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
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {post.viewCount.toLocaleString()} views
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {shareCount.toLocaleString()} shares
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Share Dialog */}
            <ShareDialog
                open={shareDialogOpen}
                onClose={() => setShareDialogOpen(false)}
                contentId={post.id}
                title={post.title || post.description}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1,
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: '#374151' }}>Delete Post</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#6B7280' }}>
                        Are you sure you want to delete this post? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleDeleteCancel}
                        disabled={deleting}
                        sx={{ textTransform: 'none', color: '#6B7280', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        disabled={deleting}
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            bgcolor: '#DC2626',
                            fontWeight: 600,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#B91C1C' },
                        }}
                    >
                        {deleting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};
