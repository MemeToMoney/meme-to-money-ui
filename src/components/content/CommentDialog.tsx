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
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Close as CloseIcon, Send as SendIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ContentAPI, Comment } from '@/lib/api/content';
import { useAuth } from '@/contexts/AuthContext';
import { isApiSuccess } from '@/lib/api/client';

interface CommentDialogProps {
    open: boolean;
    onClose: () => void;
    contentId: string;
}

export default function CommentDialog({ open, onClose, contentId }: CommentDialogProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
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
        }
    }, [open, contentId, loadComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        try {
            setSubmitting(true);
            const response = await ContentAPI.addComment(
                contentId,
                { text: newComment.trim() },
                user.id,
                user.username || 'user'
            );

            if (isApiSuccess(response)) {
                setComments(prev => [response.data, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTimeAgo = (dateInput: string | number[]) => {
        if (!dateInput) return '';

        let date: Date;

        // Handle array format [year, month, day, hour, minute, second, nano]
        if (Array.isArray(dateInput)) {
            // Month is 0-indexed in JS Date, but usually 1-indexed in Java LocalDateTime array
            // However, typical JSON serialization of LocalDateTime might be [2025, 11, 26, ...]
            // Let's assume standard Java array serialization: [year, month, day, hour, minute, second, nano]
            // Note: Java Month enum is 1-12. JS Date month is 0-11.
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

    const handleDeleteComment = async (commentId: string) => {
        if (!user || !contentId) return;

        try {
            const response = await ContentAPI.deleteComment(contentId, commentId, user.id);
            if (isApiSuccess(response)) {
                // Refresh comments from API as requested
                loadComments(true);
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
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
                    maxHeight: '80vh'
                }
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
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    {loading && comments.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress size={24} sx={{ color: '#6B46C1' }} />
                        </Box>
                    ) : comments.length === 0 ? (
                        <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                            <Typography>No comments yet. Be the first!</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {comments.map((comment) => (
                                <ListItem
                                    key={comment.id}
                                    alignItems="flex-start"
                                    sx={{ px: 0 }}
                                    secondaryAction={
                                        user?.id === comment.userId && (
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                size="small"
                                                sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444' } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#6B46C1', fontSize: '0.8rem' }}>
                                            {comment.userHandle?.charAt(0).toUpperCase() || 'U'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {comment.userHandle}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatTimeAgo(comment.createdAt)}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                                                {comment.text}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                            {hasMore && !loading && (
                                <Button
                                    fullWidth
                                    onClick={() => loadComments(false)}
                                    sx={{ color: '#6B46C1', textTransform: 'none' }}
                                >
                                    Load more comments
                                </Button>
                            )}
                        </List>
                    )}
                </Box>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        p: 2,
                        borderTop: '1px solid #E5E7EB',
                        bgcolor: 'white',
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-end'
                    }}
                >
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: '#f8f9fa'
                            }
                        }}
                    />
                    <IconButton
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        sx={{
                            color: newComment.trim() ? '#6B46C1' : '#ccc',
                            mb: 0.5
                        }}
                    >
                        {submitting ? <CircularProgress size={24} /> : <SendIcon />}
                    </IconButton>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
