'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack,
  AccessTime,
  CalendarToday,
  Edit as EditIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { blogPosts, blogCategories, BlogPost } from '@/lib/data/blogPosts';
import { useAuth } from '@/contexts/AuthContext';
import { ContentAPI, Content } from '@/lib/api/content';

const categoryColors: Record<string, { bg: string; color: string }> = {
  'Meme Culture': { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' },
  'Creator Tips': { bg: 'rgba(107, 70, 193, 0.15)', color: '#6B46C1' },
  'Platform Updates': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' },
  Monetization: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
};

// Convert API content to BlogPost format for display
function contentToBlogPost(content: Content): BlogPost {
  const wordCount = (content.description || '').split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));
  return {
    slug: `user-post-${content.id}`,
    title: content.title || 'Untitled',
    excerpt: (content.description || '').substring(0, 200) + ((content.description || '').length > 200 ? '...' : ''),
    content: content.description || '',
    category: (content.category as BlogPost['category']) || 'Meme Culture',
    author: content.creatorHandle || 'Anonymous',
    date: content.createdAt || new Date().toISOString(),
    readTime: `${readMinutes} min read`,
    coverImage: '',
    tags: content.tags || [],
    featured: false,
  };
}

function BlogPostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const router = useRouter();
  const colors = categoryColors[post.category] || { bg: '#E5E7EB', color: '#1a1a1a' };

  if (featured) {
    return (
      <Card
        onClick={() => router.push(`/blog/${post.slug}`)}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          cursor: 'pointer',
          bgcolor: 'white',
          border: '1px solid #E5E7EB',
          boxShadow: 'none',
          transition: 'all 0.2s',
          '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.3)', transform: 'translateY(-2px)' },
          mb: 3,
        }}
      >
        <Box sx={{ position: 'relative', height: { xs: 200, md: 300 } }}>
          <CardMedia
            component="div"
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                color: 'white',
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2rem' },
                textAlign: 'center',
                px: 4,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {post.title}
            </Typography>
          </CardMedia>
          <Chip
            label="Featured"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: '#F59E0B',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Chip
              label={post.category}
              size="small"
              sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 600, fontSize: '0.7rem' }}
            />
          </Box>
          <Typography
            variant="body1"
            sx={{ color: '#6B7280', mb: 2, lineHeight: 1.6 }}
          >
            {post.excerpt}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#6B7280' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B46C1' }}>
              {post.author}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarToday sx={{ fontSize: 14 }} />
              <Typography variant="caption">
                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 14 }} />
              <Typography variant="caption">{post.readTime}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={() => router.push(`/blog/${post.slug}`)}
      sx={{
        borderRadius: 2.5,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: 'white',
        border: '1px solid #E5E7EB',
        boxShadow: 'none',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.3)', transform: 'translateY(-2px)' },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          height: 160,
          background: `linear-gradient(135deg, ${colors.bg}, ${colors.color}22)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Typography
          sx={{
            color: colors.color,
            fontWeight: 700,
            fontSize: '0.95rem',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {post.title}
        </Typography>
      </Box>
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 1 }}>
          <Chip
            label={post.category}
            size="small"
            sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 600, fontSize: '0.65rem', height: 22 }}
          />
        </Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, mb: 0.5, color: '#1a1a1a', lineHeight: 1.4 }}
        >
          {post.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#6B7280', mb: 1.5, fontSize: '0.8rem', lineHeight: 1.5, flexGrow: 1 }}
        >
          {post.excerpt.length > 100 ? `${post.excerpt.substring(0, 100)}...` : post.excerpt}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B46C1' }}>
            {post.author}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#6B7280' }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              {post.readTime}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

const writableCategories = ['Meme Culture', 'Creator Tips', 'Platform Updates', 'Monetization'] as const;

export default function BlogPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [createCategory, setCreateCategory] = useState<string>('Meme Culture');
  const [createTags, setCreateTags] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // User-created blog posts from API
  const [userPosts, setUserPosts] = useState<BlogPost[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);

  const featuredPost = blogPosts.find((p) => p.featured);

  // Load user-created text posts from the content service
  const loadUserPosts = useCallback(async () => {
    setLoadingUserPosts(true);
    try {
      const response = await ContentAPI.searchContent(
        undefined,
        undefined,
        'TEXT_POST',
        undefined,
        0,
        50,
        user?.id
      );
      if (response.status === 200 && response.data) {
        const pageData = response.data;
        // Handle both Page<Content> and raw array responses
        const contentItems: Content[] = Array.isArray(pageData)
          ? pageData
          : pageData.content
            ? Array.isArray(pageData.content)
              ? pageData.content
              : []
            : [];
        const converted = contentItems
          .filter((c: Content) => c.type === 'TEXT_POST')
          .map(contentToBlogPost);
        setUserPosts(converted);
      }
    } catch {
      // Silently fail - hardcoded posts will still show
    } finally {
      setLoadingUserPosts(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserPosts();
  }, [loadUserPosts]);

  // Combine hardcoded + user posts
  const allPosts = useMemo(() => {
    const hardcoded = blogPosts.filter((p) => !p.featured);
    return [...hardcoded, ...userPosts];
  }, [userPosts]);

  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    if (selectedCategory !== 'All') {
      posts = posts.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return posts;
  }, [allPosts, selectedCategory, searchQuery]);

  const handleCreateOpen = () => {
    setCreateTitle('');
    setCreateContent('');
    setCreateCategory('Meme Culture');
    setCreateTags('');
    setCreateError('');
    setCreateOpen(true);
  };

  const handleCreateClose = () => {
    if (!creating) {
      setCreateOpen(false);
    }
  };

  const handleCreateSubmit = async () => {
    // Validation
    if (!createTitle.trim()) {
      setCreateError('Title is required');
      return;
    }
    if (!createContent.trim()) {
      setCreateError('Content is required');
      return;
    }
    if (!user) {
      setCreateError('You must be logged in');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const tags = createTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const response = await ContentAPI.createTextPost(
        {
          title: createTitle.trim(),
          description: createContent.trim(),
          tags,
          category: createCategory,
        },
        user.id,
        user.creatorHandle || user.username || user.name
      );

      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: 'Blog post created successfully!', severity: 'success' });
        setCreateOpen(false);
        // Reload user posts
        loadUserPosts();
      } else {
        setCreateError(response.message || 'Failed to create blog post');
      }
    } catch {
      setCreateError('Something went wrong. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'white',
          zIndex: 10,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2, gap: 1.5 }}>
            <IconButton onClick={() => router.push('/feed')} size="small" sx={{ color: '#1a1a1a' }}>
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                flexGrow: 1,
              }}
            >
              Blog
            </Typography>
            {isAuthenticated && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleCreateOpen}
                sx={{
                  bgcolor: '#6B46C1',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2,
                  '&:hover': { bgcolor: '#553C9A' },
                }}
              >
                Write Blog
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              bgcolor: 'white',
              color: '#1a1a1a',
              '& fieldset': { borderColor: '#E5E7EB' },
              '&:hover fieldset': { borderColor: '#6B46C1' },
              '&.Mui-focused fieldset': { borderColor: '#6B46C1' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6B7280' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Category Filter Chips */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 3,
            overflowX: 'auto',
            pb: 0.5,
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {blogCategories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => setSelectedCategory(category)}
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                flexShrink: 0,
                bgcolor: selectedCategory === category ? '#6B46C1' : 'white',
                color: selectedCategory === category ? 'white' : '#1a1a1a',
                border: selectedCategory === category ? 'none' : '1px solid #E5E7EB',
                '&:hover': {
                  bgcolor: selectedCategory === category ? '#553C9A' : '#E5E7EB',
                },
              }}
            />
          ))}
        </Box>

        {/* Featured Post */}
        {featuredPost && selectedCategory === 'All' && !searchQuery && (
          <BlogPostCard post={featuredPost} featured />
        )}

        {/* Community Posts Section Header */}
        {userPosts.length > 0 && selectedCategory === 'All' && !searchQuery && (
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: '#1a1a1a', mt: 2, mb: 1.5 }}
          >
            All Articles
          </Typography>
        )}

        {/* Loading indicator for user posts */}
        {loadingUserPosts && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ color: '#6B46C1' }} />
          </Box>
        )}

        {/* Post Grid */}
        {filteredPosts.length > 0 ? (
          <Grid container spacing={2}>
            {filteredPosts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.slug}>
                <BlogPostCard post={post} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
              No articles found
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Try a different search term or category
            </Typography>
          </Box>
        )}
      </Container>

      {/* Create Blog Post Dialog */}
      <Dialog
        open={createOpen}
        onClose={handleCreateClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'white',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 800,
            color: '#1a1a1a',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon sx={{ color: '#6B46C1' }} />
            Write a Blog Post
          </Box>
          <IconButton onClick={handleCreateClose} size="small" disabled={creating} sx={{ color: '#6B7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCreateError('')}>
              {createError}
            </Alert>
          )}

          <TextField
            label="Title"
            fullWidth
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            disabled={creating}
            sx={{
              mb: 2.5,
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: '#6B46C1' },
                '&.Mui-focused fieldset': { borderColor: '#6B46C1' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#6B46C1' },
            }}
            placeholder="Give your blog post a title"
          />

          <TextField
            label="Content"
            fullWidth
            multiline
            rows={10}
            value={createContent}
            onChange={(e) => setCreateContent(e.target.value)}
            disabled={creating}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: '#6B46C1' },
                '&.Mui-focused fieldset': { borderColor: '#6B46C1' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#6B46C1' },
            }}
            placeholder="Write your blog post content here. You can use markdown formatting."
          />

          <FormControl
            fullWidth
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: '#6B46C1' },
                '&.Mui-focused fieldset': { borderColor: '#6B46C1' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#6B46C1' },
            }}
          >
            <InputLabel>Category</InputLabel>
            <Select
              value={createCategory}
              onChange={(e) => setCreateCategory(e.target.value)}
              label="Category"
              disabled={creating}
            >
              {writableCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Tags"
            fullWidth
            value={createTags}
            onChange={(e) => setCreateTags(e.target.value)}
            disabled={creating}
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: '#6B46C1' },
                '&.Mui-focused fieldset': { borderColor: '#6B46C1' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#6B46C1' },
            }}
            placeholder="Enter tags separated by commas (e.g. memes, tips, guide)"
            helperText="Separate multiple tags with commas"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, borderTop: '1px solid #E5E7EB', pt: 2 }}>
          <Button
            onClick={handleCreateClose}
            disabled={creating}
            sx={{
              color: '#6B7280',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSubmit}
            disabled={creating || !createTitle.trim() || !createContent.trim()}
            startIcon={creating ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <AddIcon />}
            sx={{
              bgcolor: '#6B46C1',
              color: 'white',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#553C9A' },
              '&.Mui-disabled': { bgcolor: '#D1D5DB', color: 'white' },
            }}
          >
            {creating ? 'Publishing...' : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
