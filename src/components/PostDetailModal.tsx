import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { Content, ContentAPI } from '@/lib/api/content';
import { useAuth } from '@/contexts/AuthContext';
import { isApiSuccess } from '@/lib/api/client';
import { FeedPostCard } from './FeedPostCard';

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

    // Initialize state when post changes
    React.useEffect(() => {
        if (post) {
            setIsLiked(false); // TODO: Get actual liked status
            setLikeCount(post.likeCount || 0);
        }
    }, [post]);

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

    // Mobile View: Use FeedPostCard directly
    if (isMobile) {
        return (
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
                    <FeedPostCard post={post} onLike={onLike} onComment={onComment} onShare={onShare} onSave={onSave} />
                </Box>
            </Dialog>
        );
    }

    // Desktop View: Split Layout
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
                    height: '90vh', // Fixed height for desktop modal
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

                {/* Right Side: Details */}
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
                                {post.creatorHandle ? post.creatorHandle.charAt(1)?.toUpperCase() : 'U'}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {post.creatorHandle || 'Unknown User'}
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose}>
                            <MoreVert />
                        </IconButton>
                    </Box>

                    {/* Comments Area (Scrollable) */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                        {/* Caption as first comment */}
                        {(post.title || post.description) && (
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Avatar
                                    sx={{ width: 32, height: 32, bgcolor: '#6B46C1' }}
                                >
                                    {post.creatorHandle ? post.creatorHandle.charAt(1)?.toUpperCase() : 'U'}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2">
                                        <span style={{ fontWeight: 'bold', marginRight: 8 }}>
                                            {post.creatorHandle}
                                        </span>
                                        {post.title || post.description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Placeholder for comments */}
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                            No comments yet.
                        </Typography>
                    </Box>

                    {/* Actions & Input */}
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                                <IconButton onClick={handleLikeClick}>
                                    {isLiked ? <Favorite sx={{ color: '#E91E63' }} /> : <FavoriteBorder />}
                                </IconButton>
                                <IconButton>
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
                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
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
                                sx={{ fontSize: '0.9rem' }}
                            />
                            <Button
                                disabled={!commentText.trim()}
                                sx={{ textTransform: 'none', fontWeight: 600, color: '#6B46C1' }}
                            >
                                Post
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Dialog>
    );
};
