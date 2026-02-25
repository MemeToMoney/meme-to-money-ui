import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    Box,
    IconButton,
    useMediaQuery,
    useTheme,
    Grid,
    Typography,
    Avatar,
    Divider,
    TextField,
    Button,
    CardMedia,
    CircularProgress,
} from '@mui/material';
import {
    Close as CloseIcon,
    Favorite,
    FavoriteBorder,
    ChatBubbleOutline,
    Share,
    BookmarkBorder,
    MoreVert,
    Send as SendIcon,
    FavoriteBorder as FavoriteBorderSmall,
} from '@mui/icons-material';
import { Content, ContentAPI, Comment } from '@/lib/api/content';
import { useAuth } from '@/contexts/AuthContext';
import { isApiSuccess, formatCreatorHandle, getHandleInitial, parseJavaDate } from '@/lib/api/client';
import { FeedPostCard } from './FeedPostCard';
import CommentDialog from './content/CommentDialog';

interface PostDetailModalProps {
    open: boolean;
    onClose: () => void;
    post: Content | null;
    onLike?: (contentId: string, isLiked: boolean) => void;
    onComment?: (contentId: string) => void;
    onShare?: (contentId: string) => void;
    onSave?: (contentId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
    open,
    onClose,
    post,
    onLike,
    onComment,
    onShare,
    onSave,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useAuth();

    // State for interactions
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);

    // Initialize state when post changes
    useEffect(() => {
        if (post) {
            setIsLiked(false);
            setLikeCount(post.likeCount || 0);
            setComments([]);
            if (open) {
                loadComments();
            }
        }
    }, [post, open]);

    const loadComments = async () => {
        if (!post) return;
        try {
            setCommentsLoading(true);
            const response = await ContentAPI.getComments(post.id, 0, 10);
            if (isApiSuccess(response)) {
                setComments(response.data.content || []);
            }
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || !user || !post) return;

        try {
            setSubmittingComment(true);
            const response = await ContentAPI.addComment(
                post.id,
                { text: commentText.trim() },
                user.id,
                user.username || user.displayName || 'user'
            );
            if (isApiSuccess(response)) {
                setComments(prev => [response.data, ...prev]);
                setCommentText('');
            }
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    if (!post) return null;

    const getContentUrl = (content: Content) => {
        return content.processedFile?.cdnUrl || content.originalFile?.cdnUrl || content.thumbnailUrl;
    };

    const contentUrl = getContentUrl(post);

    const handleLikeClick = async () => {
        if (!user?.id) return;

        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount((prev) => prev + (newIsLiked ? 1 : -1));

        if (onLike) onLike(post.id, newIsLiked);

        try {
            await ContentAPI.recordEngagement(
                post.id,
                { action: newIsLiked ? 'LIKE' : 'UNLIKE' },
                user.id,
                user.username
            );
        } catch (error) {
            console.error('Like error:', error);
            setIsLiked(!newIsLiked);
            setLikeCount((prev) => prev + (!newIsLiked ? 1 : -1));
        }
    };

    const formatTimeAgo = (dateInput: string | number[]) => {
        if (!dateInput) return '';
        let date: Date;
        if (Array.isArray(dateInput)) {
            const [year, month, day, hour, minute, second] = dateInput;
            date = new Date(year, month - 1, day, hour, minute, second);
        } else {
            date = new Date(dateInput);
        }
        if (isNaN(date.getTime())) return '';
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInMinutes < 1) return 'now';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInHours < 24) return `${diffInHours}h`;
        return `${diffInDays}d`;
    };

    // Mobile View: Use FeedPostCard + CommentDialog
    if (isMobile) {
        return (
            <>
                <Dialog
                    open={open}
                    onClose={onClose}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            m: 2,
                        },
                    }}
                >
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                zIndex: 1,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <FeedPostCard
                            post={post}
                            onLike={onLike}
                            onComment={() => setCommentDialogOpen(true)}
                            onShare={onShare}
                            onSave={onSave}
                        />
                    </Box>
                </Dialog>
                <CommentDialog
                    open={commentDialogOpen}
                    onClose={() => setCommentDialogOpen(false)}
                    contentId={post.id}
                />
            </>
        );
    }

    // Desktop View: Split Layout with live comments
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 0,
                    bgcolor: 'black',
                    overflow: 'hidden',
                    height: '90vh',
                    maxHeight: '90vh',
                },
            }}
        >
            <Grid container sx={{ height: '100%' }}>
                {/* Left Side: Media */}
                <Grid
                    item
                    xs={12}
                    md={7}
                    lg={8}
                    sx={{
                        bgcolor: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                    }}
                >
                    {post.type === 'SHORT_VIDEO' ? (
                        <Box
                            component="video"
                            src={contentUrl}
                            controls
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                            }}
                        />
                    ) : (
                        <CardMedia
                            component="img"
                            image={contentUrl}
                            alt={post.title}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                            }}
                        />
                    )}
                </Grid>

                {/* Right Side: Details + Comments */}
                <Grid
                    item
                    xs={12}
                    md={5}
                    lg={4}
                    sx={{
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#6B46C1' }}>
                                {getHandleInitial(post.creatorHandle)}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {formatCreatorHandle(post.creatorHandle)}
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Comments Area (Scrollable) */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                        {/* Caption as first comment */}
                        {(post.title || post.description) && (
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#6B46C1' }}>
                                    {getHandleInitial(post.creatorHandle)}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2">
                                        <span style={{ fontWeight: 'bold', marginRight: 8 }}>
                                            {formatCreatorHandle(post.creatorHandle)}
                                        </span>
                                        {post.title || post.description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        {parseJavaDate(post.publishedAt || post.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        <Divider sx={{ mb: 2 }} />

                        {/* Actual comments */}
                        {commentsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={24} sx={{ color: '#6B46C1' }} />
                            </Box>
                        ) : comments.length > 0 ? (
                            comments.map(comment => (
                                <Box key={comment.id} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#6B46C1', fontSize: '0.7rem' }}>
                                        {comment.userHandle?.replace('@', '').charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2">
                                            <span style={{ fontWeight: 'bold', marginRight: 6 }}>
                                                {comment.userHandle || comment.username}
                                            </span>
                                            {comment.text}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5, alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatTimeAgo(comment.createdAt)}
                                            </Typography>
                                            {(comment.likeCount || 0) > 0 && (
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                    {comment.likeCount} like{comment.likeCount !== 1 ? 's' : ''}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <FavoriteBorderSmall sx={{ fontSize: 12, color: '#9CA3AF', mt: 1, cursor: 'pointer' }} />
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                                No comments yet. Start the conversation!
                            </Typography>
                        )}
                    </Box>

                    {/* Actions & Input */}
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                                <IconButton onClick={handleLikeClick}>
                                    {isLiked ? <Favorite sx={{ color: '#E91E63' }} /> : <FavoriteBorder />}
                                </IconButton>
                                <IconButton onClick={() => setCommentDialogOpen(true)}>
                                    <ChatBubbleOutline />
                                </IconButton>
                                <IconButton>
                                    <Share />
                                </IconButton>
                            </Box>
                            <IconButton>
                                <BookmarkBorder />
                            </IconButton>
                        </Box>

                        <Box sx={{ px: 2, pb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {likeCount.toLocaleString()} likes
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                {parseJavaDate(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </Typography>
                        </Box>

                        <Divider />

                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                fullWidth
                                placeholder="Add a comment..."
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmitComment();
                                    }
                                }}
                                sx={{ fontSize: '0.9rem' }}
                            />
                            <Button
                                disabled={!commentText.trim() || submittingComment}
                                onClick={handleSubmitComment}
                                sx={{ textTransform: 'none', fontWeight: 600, color: '#6B46C1' }}
                            >
                                {submittingComment ? <CircularProgress size={18} /> : 'Post'}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Full Comment Dialog (mobile-style, for "view all comments") */}
            <CommentDialog
                open={commentDialogOpen}
                onClose={() => {
                    setCommentDialogOpen(false);
                    loadComments(); // Refresh comments when dialog closes
                }}
                contentId={post.id}
            />
        </Dialog>
    );
};
