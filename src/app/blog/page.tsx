'use client';

import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack,
  AccessTime,
  CalendarToday,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { blogPosts, blogCategories, BlogPost } from '@/lib/data/blogPosts';

const categoryColors: Record<string, { bg: string; color: string }> = {
  'Meme Culture': { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' },
  'Creator Tips': { bg: 'rgba(107, 70, 193, 0.15)', color: '#6B46C1' },
  'Platform Updates': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' },
  Monetization: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
};

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

export default function BlogPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredPost = blogPosts.find((p) => p.featured);

  const filteredPosts = useMemo(() => {
    let posts = blogPosts.filter((p) => !p.featured);
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
  }, [selectedCategory, searchQuery]);

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
              }}
            >
              Blog
            </Typography>
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
    </Box>
  );
}
