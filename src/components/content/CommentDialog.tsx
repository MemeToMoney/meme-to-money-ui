import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    TextField,
    Button,
    Avatar,
    CircularProgress,
    Divider,
    Collapse,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Delete as DeleteIcon,
    FavoriteBorder,
    Favorite,
    Reply as ReplyIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { ContentAPI, Comment } from '@/lib/api/content';
import { useAuth } from '@/contexts/AuthContext';
import { isApiSuccess } from '@/lib/api/client';

interface CommentDialogProps {
    open: boolean;
    onClose: () => void;
    contentId: string;
    onCommentCountChange?: (delta: number) => void;
}

export default function CommentDialog({ open, onClose, contentId, onCommentCountChange }: CommentDialogProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [replyTo, setReplyTo] = useState<{ id: string; handle: string } | null>(null);
    const [repliesMap, setRepliesMap] = useState<Record<string, Comment[]>>({});
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
    const [repliesLoading, setRepliesLoading] = useState<Set<string>>(new Set());
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
    const { user } = useAuth();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const loadComments = useCallback(async (reset = false) => {
        if (!contentId) return;

        try {
            setLoading(true);
            const currentPage = reset ? 0 : page;
            const response = await ContentAPI.getComments(contentId, currentPage);

            if (isApiSuccess(response)) {
                if (reset) {
                    setComments(response.data.content);
                    setPage(1);
                } else {
                    setComments(prev => [...prev, ...response.data.content]);
                    setPage(prev => prev + 1);
                }
                setHasMore(response.data.content.length > 0);
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoading(false);
        }
    }, [contentId, page]);

    useEffect(() => {
        if (open) {
            loadComments(true);
            setReplyTo(null);
            setExpandedReplies(new Set());
            setRepliesMap({});
        }
    }, [open, contentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        try {
            setSubmitting(true);
            const commentRequest: any = { text: newComment.trim() };
            if (replyTo) {
                commentRequest.parentCommentId = replyTo.id;
            }

            const response = await ContentAPI.addComment(
                contentId,
                commentRequest,
                user.id,
                user.username || user.displayName || 'user'
            );

            if (isApiSuccess(response)) {
                if (replyTo) {
                    // Add reply to the replies map
                    setRepliesMap(prev => ({
                        ...prev,
                        [replyTo.id]: [...(prev[replyTo.id] || []), response.data],
                    }));
                    // Auto-expand replies for this comment
                    setExpandedReplies(prev => new Set(prev).add(replyTo.id));
                } else {
                    // Add top-level comment
                    setComments(prev => [response.data, ...prev]);
                }
                setNewComment('');
                setReplyTo(null);
                onCommentCountChange?.(1);
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string, isReply = false, parentId?: string) => {
        if (!user || !contentId) return;

        try {
            const response = await ContentAPI.deleteComment(contentId, commentId, user.id);
            if (isApiSuccess(response)) {
                if (isReply && parentId) {
                    setRepliesMap(prev => ({
                        ...prev,
                        [parentId]: (prev[parentId] || []).filter(r => r.id !== commentId),
                    }));
                } else {
                    setComments(prev => prev.filter(c => c.id !== commentId));
                }
                onCommentCountChange?.(-1);
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const handleToggleReplies = async (commentId: string) => {
        if (expandedReplies.has(commentId)) {
            setExpandedReplies(prev => {
                const next = new Set(prev);
                next.delete(commentId);
                return next;
            });
            return;
        }

        // Load replies if not cached
        if (!repliesMap[commentId]) {
            setRepliesLoading(prev => new Set(prev).add(commentId));
            try {
                const response = await ContentAPI.getCommentReplies(contentId, commentId);
                if (isApiSuccess(response)) {
                    setRepliesMap(prev => ({ ...prev, [commentId]: response.data }));
                }
            } catch (err) {
                console.error('Failed to load replies:', err);
            } finally {
                setRepliesLoading(prev => {
                    const next = new Set(prev);
                    next.delete(commentId);
                    return next;
                });
            }
        }

        setExpandedReplies(prev => new Set(prev).add(commentId));
    };

    const handleLikeComment = async (commentId: string) => {
        if (!user) return;
        const isLiked = likedComments.has(commentId);

        // Optimistic update
        setLikedComments(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(commentId);
            else next.add(commentId);
            return next;
        });

        // Update like count in comments
        const updateLikeCount = (c: Comment) =>
            c.id === commentId ? { ...c, likeCount: (c.likeCount || 0) + (isLiked ? -1 : 1) } : c;

        setComments(prev => prev.map(updateLikeCount));
        setRepliesMap(prev => {
            const updated = { ...prev };
            for (const key of Object.keys(updated)) {
                updated[key] = updated[key].map(updateLikeCount);
            }
            return updated;
        });

        try {
            if (isLiked) {
                await ContentAPI.unlikeComment(contentId, commentId, user.id);
            } else {
                await ContentAPI.likeComment(contentId, commentId, user.id);
            }
        } catch {
            // Revert on failure
            setLikedComments(prev => {
                const next = new Set(prev);
                if (isLiked) next.add(commentId);
                else next.delete(commentId);
                return next;
            });
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, likeCount: (c.likeCount || 0) + (isLiked ? 1 : -1) } : c
            ));
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

    const renderComment = (comment: Comment, isReply = false, parentId?: string) => {
        const isOwn = user?.id === comment.userId;
        const isLiked = likedComments.has(comment.id);
        const replies = repliesMap[comment.id] || [];
        const isExpanded = expandedReplies.has(comment.id);
        const isLoadingReplies = repliesLoading.has(comment.id);

        return (
            <Box key={comment.id} sx={{ ml: isReply ? 5 : 0, mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 1.5, py: 1 }}>
                    <Avatar
                        sx={{
                            width: isReply ? 28 : 32,
                            height: isReply ? 28 : 32,
                            bgcolor: '#6B46C1',
                            fontSize: isReply ? '0.7rem' : '0.8rem',
                            cursor: 'pointer',
                        }}
                    >
                        {comment.userHandle?.replace('@', '').charAt(0).toUpperCase() || 'U'}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: isReply ? '0.8rem' : '0.85rem' }}>
                                {comment.userHandle || comment.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(comment.createdAt)}
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 0.25, color: '#1f2937', fontSize: isReply ? '0.83rem' : '0.875rem' }}>
                            {comment.text}
                        </Typography>

                        {/* Action row */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.25, cursor: 'pointer' }}
                                onClick={() => handleLikeComment(comment.id)}
                            >
                                {isLiked ? (
                                    <Favorite sx={{ fontSize: 14, color: '#EF4444' }} />
                                ) : (
                                    <FavoriteBorder sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                )}
                                {(comment.likeCount || 0) > 0 && (
                                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>
                                        {comment.likeCount}
                                    </Typography>
                                )}
                            </Box>

                            {!isReply && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#6B7280',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        '&:hover': { color: '#6B46C1' },
                                    }}
                                    onClick={() => setReplyTo({ id: comment.id, handle: comment.userHandle || comment.username })}
                                >
                                    Reply
                                </Typography>
                            )}

                            {isOwn && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#9CA3AF',
                                        cursor: 'pointer',
                                        '&:hover': { color: '#EF4444' },
                                    }}
                                    onClick={() => handleDeleteComment(comment.id, isReply, parentId)}
                                >
                                    Delete
                                </Typography>
                            )}
                        </Box>

                        {/* Show replies toggle */}
                        {!isReply && (replies.length > 0 || !isExpanded) && (
                            <Box sx={{ mt: 0.5 }}>
                                {isLoadingReplies ? (
                                    <CircularProgress size={14} sx={{ color: '#6B46C1', ml: 1 }} />
                                ) : (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#6B46C1',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.25,
                                            '&:hover': { textDecoration: 'underline' },
                                        }}
                                        onClick={() => handleToggleReplies(comment.id)}
                                    >
                                        {isExpanded
                                            ? 'Hide replies'
                                            : replies.length > 0
                                                ? `View ${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}`
                                                : 'View replies'}
                                        <ExpandMoreIcon
                                            sx={{
                                                fontSize: 16,
                                                transform: isExpanded ? 'rotate(180deg)' : 'none',
                                                transition: 'transform 0.2s',
                                            }}
                                        />
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Replies */}
                {!isReply && (
                    <Collapse in={isExpanded}>
                        {replies.map(reply => renderComment(reply, true, comment.id))}
                    </Collapse>
                )}
            </Box>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : 3,
                    height: fullScreen ? '100%' : '80vh',
                    maxHeight: '80vh',
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="h6" fontWeight="bold">Comments</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 1 }}>
                    {loading && comments.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress size={24} sx={{ color: '#6B46C1' }} />
                        </Box>
                    ) : comments.length === 0 ? (
                        <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                            <Typography>No comments yet. Be the first!</Typography>
                        </Box>
                    ) : (
                        <>
                            {comments.map(comment => renderComment(comment))}
                            {hasMore && !loading && (
                                <Button
                                    fullWidth
                                    onClick={() => loadComments(false)}
                                    sx={{ color: '#6B46C1', textTransform: 'none', mb: 2 }}
                                >
                                    Load more comments
                                </Button>
                            )}
                        </>
                    )}
                </Box>

                {/* Reply indicator */}
                {replyTo && (
                    <Box sx={{
                        px: 2, py: 1,
                        bgcolor: '#F3F4F6',
                        borderTop: '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <Typography variant="caption" sx={{ color: '#6B46C1', fontWeight: 600 }}>
                            Replying to {replyTo.handle}
                        </Typography>
                        <IconButton size="small" onClick={() => setReplyTo(null)}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>
                )}

                {/* Comment input */}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        p: 2,
                        borderTop: '1px solid #E5E7EB',
                        bgcolor: 'white',
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-end',
                    }}
                >
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder={replyTo ? `Reply to ${replyTo.handle}...` : 'Add a comment...'}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                        size="small"
                        autoFocus={!!replyTo}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: '#f8f9fa',
                            },
                        }}
                    />
                    <IconButton
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        sx={{
                            color: newComment.trim() ? '#6B46C1' : '#ccc',
                            mb: 0.5,
                        }}
                    >
                        {submitting ? <CircularProgress size={24} /> : <SendIcon />}
                    </IconButton>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
