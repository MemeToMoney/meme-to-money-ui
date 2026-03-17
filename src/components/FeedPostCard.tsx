import React, { useState, useEffect } from 'react';
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
    Snackbar,
    Alert,
    Chip,
    Tooltip,
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
    ContentCopy as CopyIcon,
    Flag as FlagIcon,
    Loop as RemixIcon,
    RocketLaunch as BoostIcon,
    CallSplit as DuetIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Content, ContentAPI, UserEngagementStatus } from '@/lib/api/content';
import { isApiSuccess, formatTimeAgo, formatCreatorHandle, getHandleInitial } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import ShareDialog from './ShareDialog';

/**
 * Adds a "Created on MemeToMoney" watermark to an image and returns a Blob.
 */
async function addWatermark(imageUrl: string, creatorHandle: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('No canvas context')); return; }

            ctx.drawImage(img, 0, 0);

            // Watermark bar at the bottom
            const barHeight = Math.max(32, img.height * 0.05);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.fillRect(0, img.height - barHeight, img.width, barHeight);

            const fontSize = Math.max(12, barHeight * 0.5);
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const handle = creatorHandle?.startsWith('@') ? creatorHandle : `@${creatorHandle || 'unknown'}`;
            ctx.fillText(
                `Created on MemeToMoney \u00B7 ${handle}`,
                img.width / 2,
                img.height - barHeight / 2
            );

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
            }, 'image/png');
        };
        img.onerror = () => reject(new Error('Failed to load image for watermark'));
        img.src = imageUrl;
    });
}

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
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(initialEngagement?.liked || false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [shareCount, setShareCount] = useState(post.shareCount);
    const [isSaved, setIsSaved] = useState(initialEngagement?.bookmarked || false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [boostDialogOpen, setBoostDialogOpen] = useState(false);
    const [selectedBoostCoins, setSelectedBoostCoins] = useState(100);
    const [boosting, setBoosting] = useState(false);
    const [isBoosted, setIsBoosted] = useState(post.isBoosted || false);
    const [coinBalance, setCoinBalance] = useState<number | null>(null);

    const isOwnPost = user?.id === post.creatorId;

    // Sync engagement state when initialEngagement changes (e.g. after API fetch)
    useEffect(() => {
        if (initialEngagement) {
            setIsLiked(initialEngagement.liked || false);
            setIsSaved(initialEngagement.bookmarked || false);
        }
    }, [initialEngagement]);

    // Fetch engagement status on mount if not provided
    useEffect(() => {
        if (!initialEngagement && user?.id) {
            ContentAPI.getBulkEngagementStatus([post.id], user.id)
                .then(res => {
                    if (isApiSuccess(res) && res.data && res.data[post.id]) {
                        const eng = res.data[post.id];
                        setIsLiked(eng.liked || false);
                        setIsSaved(eng.bookmarked || false);
                    }
                })
                .catch(() => {});
        }
    }, [post.id, user?.id]);

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
                setSnackbar({ open: true, message: 'Post deleted' });
                if (onDelete) onDelete(post.id);
            } else {
                setSnackbar({ open: true, message: 'Failed to delete post. Please try again.' });
            }
        } catch (error) {
            console.error('Delete error:', error);
            setSnackbar({ open: true, message: 'Failed to delete post. Please try again.' });
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    const handleCopyLink = async () => {
        handleMenuClose();
        const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : '';
        try {
            await navigator.clipboard.writeText(shareUrl);
            setSnackbar({ open: true, message: 'Link copied!' });
        } catch {
            setSnackbar({ open: true, message: 'Failed to copy link' });
        }
    };

    const handleMenuShareClick = () => {
        handleMenuClose();
        setShareDialogOpen(true);
    };

    const handleMenuSaveClick = () => {
        handleMenuClose();
        handleSaveClick();
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

    const handleShareClick = async () => {
        if (!user?.id) { setShareDialogOpen(true); return; }
        setShareCount(prev => prev + 1);
        if (onShare) onShare(post.id);
        ContentAPI.recordEngagement(post.id, { action: 'SHARE' }, user.id, user.username).catch(() => {});

        // For image memes, try to share a watermarked version via native share
        const imgUrl = getContentUrl(post);
        if (post.type === 'MEME' && imgUrl && typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
            try {
                const blob = await addWatermark(imgUrl, post.creatorHandle);
                const file = new File([blob], 'meme.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: post.title || 'Check out this meme on MemeToMoney!',
                        files: [file],
                    });
                    return;
                }
            } catch {
                // Fall through to dialog
            }
        }

        setShareDialogOpen(true);
    };

    const handleRemixClick = () => {
        router.push(`/upload?remix=${post.id}`);
    };

    const handleDuetClick = () => {
        router.push(`/upload?duet=${post.id}&duetType=SIDE_BY_SIDE`);
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

    const handleBoostClick = () => {
        handleMenuClose();
        setBoostDialogOpen(true);
        // Fetch coin balance
        if (user?.id) {
            import('@/lib/api/monetization').then(({ MonetizationAPI }) => {
                MonetizationAPI.getBalance().then(res => {
                    if (res.status === 200 && res.data !== null) {
                        setCoinBalance(res.data);
                    }
                }).catch(() => {});
            });
        }
    };

    const handleBoostConfirm = async () => {
        if (!user?.id) return;
        setBoosting(true);
        try {
            const response = await ContentAPI.boostContent(post.id, selectedBoostCoins, user.id);
            if (isApiSuccess(response)) {
                setIsBoosted(true);
                setBoostDialogOpen(false);
                setSnackbar({ open: true, message: `Post boosted! Estimated ${(selectedBoostCoins * 200).toLocaleString()} extra impressions.` });
            } else {
                setSnackbar({ open: true, message: (response as any).message || 'Failed to boost post' });
            }
        } catch (error) {
            console.error('Boost error:', error);
            setSnackbar({ open: true, message: 'Failed to boost post. Please try again.' });
        } finally {
            setBoosting(false);
        }
    };

    const boostOptions = [50, 100, 200, 500];

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
                    <MenuItem onClick={handleMenuShareClick}>
                        <ListItemIcon><Share sx={{ fontSize: 20 }} /></ListItemIcon>
                        <ListItemText>Share</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleMenuSaveClick}>
                        <ListItemIcon>
                            {isSaved ? <Bookmark sx={{ fontSize: 20, color: '#111827' }} /> : <BookmarkBorder sx={{ fontSize: 20 }} />}
                        </ListItemIcon>
                        <ListItemText>{isSaved ? 'Unsave' : 'Save'}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleCopyLink}>
                        <ListItemIcon><CopyIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                        <ListItemText>Copy Link</ListItemText>
                    </MenuItem>
                    {isOwnPost && (
                        <MenuItem onClick={handleBoostClick} sx={{ color: '#6B46C1' }}>
                            <ListItemIcon>
                                <BoostIcon sx={{ color: '#6B46C1', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText>Boost</ListItemText>
                        </MenuItem>
                    )}
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
                            <ListItemIcon><FlagIcon sx={{ fontSize: 20 }} /></ListItemIcon>
                            <ListItemText>Report</ListItemText>
                        </MenuItem>
                    )}
                </Menu>
            </Box>

            {/* Boosted badge */}
            {isBoosted && (
                <Box sx={{ px: 2, pb: 0.5 }}>
                    <Chip
                        icon={<BoostIcon sx={{ fontSize: 14 }} />}
                        label="Boosted"
                        size="small"
                        sx={{
                            bgcolor: '#FEF3C7',
                            color: '#92400E',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            '& .MuiChip-icon': { color: '#F59E0B' },
                        }}
                    />
                </Box>
            )}

            {/* Remix badge */}
            {post.remixOfId && (
                <Box sx={{ px: 2, pb: 1 }}>
                    <Chip
                        icon={<RemixIcon sx={{ fontSize: 16 }} />}
                        label="Remix"
                        size="small"
                        sx={{ bgcolor: '#F3F4F6', color: '#6B46C1', fontWeight: 600, fontSize: '0.75rem' }}
                    />
                </Box>
            )}

            {/* Duet badge */}
            {post.duetOfId && (
                <Box sx={{ px: 2, pb: 1 }}>
                    <Chip
                        icon={<DuetIcon sx={{ fontSize: 16 }} />}
                        label={`Duet${post.duetType === 'REACTION' ? ' (Reaction)' : post.duetType === 'TOP_BOTTOM' ? ' (Top/Bottom)' : ''}`}
                        size="small"
                        sx={{ bgcolor: '#F3F4F6', color: '#6B46C1', fontWeight: 600, fontSize: '0.75rem' }}
                    />
                </Box>
            )}

            {/* Remix count */}
            {(post.remixCount ?? 0) > 0 && (
                <Box sx={{ px: 2, pb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {post.remixCount} remix{post.remixCount === 1 ? '' : 'es'}
                    </Typography>
                </Box>
            )}

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
                        <Tooltip title="Remix">
                            <IconButton onClick={handleRemixClick} sx={{ p: 0, transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.15)' } }}>
                                <RemixIcon />
                            </IconButton>
                        </Tooltip>
                        {(post.type === 'SHORT_VIDEO' || post.type === 'MEME') && (
                            <Tooltip title="Duet">
                                <IconButton onClick={handleDuetClick} sx={{ p: 0, transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.15)' } }}>
                                    <DuetIcon />
                                </IconButton>
                            </Tooltip>
                        )}
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
                imageUrl={post.type === 'MEME' ? contentUrl : undefined}
                creatorHandle={post.creatorHandle}
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

            {/* Boost Dialog */}
            <Dialog
                open={boostDialogOpen}
                onClose={() => setBoostDialogOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BoostIcon sx={{ color: '#6B46C1' }} />
                    Boost Your Post
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                        Spend coins to get your post seen by more people. Each coin gives ~200 extra impressions for 24 hours.
                    </Typography>

                    {coinBalance !== null && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1.5, bgcolor: '#FAF5FF', borderRadius: 2, border: '1px solid #EDE9FE' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#6B46C1' }}>
                                Your Balance:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151' }}>
                                {coinBalance.toLocaleString()} coins
                            </Typography>
                        </Box>
                    )}

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#374151' }}>
                        Select coin amount:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {boostOptions.map((amount) => (
                            <Chip
                                key={amount}
                                label={`${amount} coins`}
                                onClick={() => setSelectedBoostCoins(amount)}
                                sx={{
                                    cursor: 'pointer',
                                    bgcolor: selectedBoostCoins === amount ? '#6B46C1' : '#F3F4F6',
                                    color: selectedBoostCoins === amount ? 'white' : '#374151',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    px: 1,
                                    '&:hover': {
                                        bgcolor: selectedBoostCoins === amount ? '#553C9A' : '#E5E7EB',
                                    },
                                }}
                            />
                        ))}
                    </Box>

                    <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>Estimated Reach</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151' }}>
                                +{(selectedBoostCoins * 200).toLocaleString()} impressions
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>Duration</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151' }}>24 hours</Typography>
                        </Box>
                    </Box>

                    {coinBalance !== null && coinBalance < selectedBoostCoins && (
                        <Typography variant="caption" sx={{ color: '#DC2626', mt: 1, display: 'block' }}>
                            Insufficient coins. You need {selectedBoostCoins - coinBalance} more coins.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setBoostDialogOpen(false)}
                        disabled={boosting}
                        sx={{ textTransform: 'none', color: '#6B7280', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBoostConfirm}
                        disabled={boosting || (coinBalance !== null && coinBalance < selectedBoostCoins)}
                        variant="contained"
                        startIcon={boosting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <BoostIcon />}
                        sx={{
                            textTransform: 'none',
                            bgcolor: '#6B46C1',
                            fontWeight: 700,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#553C9A' },
                        }}
                    >
                        {boosting ? 'Boosting...' : `Boost for ${selectedBoostCoins} coins`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Copy Link Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Card>
    );
};
