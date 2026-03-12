'use client';

import React, { useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  AccessTime,
  CalendarToday,
  ContentCopy,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { getBlogPostBySlug, getRelatedPosts, BlogPost } from '@/lib/data/blogPosts';

const categoryColors: Record<string, { bg: string; color: string }> = {
  'Meme Culture': { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' },
  'Creator Tips': { bg: 'rgba(107, 70, 193, 0.15)', color: '#6B46C1' },
  'Platform Updates': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' },
  Monetization: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
};

function parseMarkdownToHtml(markdown: string): string {
  let html = markdown.trim();

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match
      .split('|')
      .filter((c) => c.trim())
      .map((c) => c.trim());
    if (cells.every((c) => /^[-:]+$/.test(c))) return '<!--table-sep-->';
    return `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
  });
  html = html.replace(
    /((<tr>.*<\/tr>\n?)+)/g,
    '<table style="width:100%;border-collapse:collapse;margin:16px 0;">$1</table>'
  );
  html = html.replace(/<!--table-sep-->\n?/g, '');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code style="background:rgba(107,70,193,0.15);padding:2px 6px;border-radius:4px;font-size:0.85em;color:#1a1a1a;">$1</code>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<oli>$1</oli>');
  html = html.replace(/((<oli>.*<\/oli>\n?)+)/g, (match) => {
    return '<ol>' + match.replace(/<\/?oli>/g, (tag) => tag.replace('oli', 'li')) + '</ol>';
  });

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#6B46C1;text-decoration:underline;">$1</a>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />');

  // Paragraphs: wrap remaining text lines
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<table') ||
        trimmed.startsWith('<hr')
      ) {
        return trimmed;
      }
      return `<p>${trimmed}</p>`;
    })
    .join('\n');

  return html;
}

function RelatedPostCard({ post }: { post: BlogPost }) {
  const router = useRouter();
  const colors = categoryColors[post.category] || { bg: '#E5E7EB', color: '#1a1a1a' };

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
          height: 120,
          background: `linear-gradient(135deg, ${colors.bg}, ${colors.color}22)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Typography
          sx={{ color: colors.color, fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.3 }}
        >
          {post.title}
        </Typography>
      </Box>
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Chip
          label={post.category}
          size="small"
          sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 600, fontSize: '0.6rem', height: 20, mb: 1, alignSelf: 'flex-start' }}
        />
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.75rem', lineHeight: 1.5, flexGrow: 1 }}>
          {post.excerpt.length > 80 ? `${post.excerpt.substring(0, 80)}...` : post.excerpt}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#6B46C1', fontWeight: 600, fontSize: '0.65rem' }}>
            {post.author}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.65rem' }}>
            {post.readTime}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState('');

  const post = useMemo(() => getBlogPostBySlug(slug), [slug]);
  const relatedPosts = useMemo(() => (slug ? getRelatedPosts(slug, 3) : []), [slug]);

  if (!post) {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
            Article Not Found
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
            The article you are looking for does not exist.
          </Typography>
          <Button
            onClick={() => router.push('/blog')}
            variant="contained"
            sx={{
              bgcolor: '#6B46C1',
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': { bgcolor: '#553C9A' },
            }}
          >
            Back to Blog
          </Button>
        </Box>
      </Box>
    );
  }

  const colors = categoryColors[post.category] || { bg: '#E5E7EB', color: '#1a1a1a' };
  const contentHtml = parseMarkdownToHtml(post.content);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSnackMsg('Link copied to clipboard!');
      setSnackOpen(true);
    } catch {
      setSnackMsg('Could not copy link');
      setSnackOpen(true);
    }
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${post.title} - Check out this article on MemeToMoney!`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
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
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2, gap: 1.5 }}>
            <IconButton onClick={() => router.push('/blog')} size="small" sx={{ color: '#1a1a1a' }}>
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

      <Container maxWidth="md" sx={{ pt: 3 }}>
        {/* Cover Image Area */}
        <Box
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            mb: 3,
            height: { xs: 200, md: 320 },
            background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #EC4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
          }}
        >
          <Typography
            sx={{
              color: 'white',
              fontWeight: 800,
              fontSize: { xs: '1.3rem', md: '2rem' },
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              lineHeight: 1.3,
            }}
          >
            {post.title}
          </Typography>
        </Box>

        {/* Article Meta */}
        <Card sx={{ borderRadius: 3, bgcolor: 'white', border: '1px solid #E5E7EB', boxShadow: 'none', mb: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            {/* Category + Tags */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={post.category}
                size="small"
                sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.75rem' }}
              />
              {post.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', borderColor: '#E5E7EB', color: '#6B7280' }}
                />
              ))}
            </Box>

            {/* Title */}
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: '#1a1a1a', mb: 2, lineHeight: 1.3, fontSize: { xs: '1.5rem', md: '2rem' } }}
            >
              {post.title}
            </Typography>

            {/* Author / Date / Read Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#6B46C1' }}>
                {post.author}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6B7280' }}>
                <CalendarToday sx={{ fontSize: 15 }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6B7280' }}>
                <AccessTime sx={{ fontSize: 15 }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  {post.readTime}
                </Typography>
              </Box>
            </Box>

            {/* Share Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, pb: 3, borderBottom: '1px solid #E5E7EB' }}>
              <Button
                startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
                onClick={handleCopyLink}
                size="small"
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  bgcolor: '#E5E7EB',
                  color: '#1a1a1a',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '&:hover': { bgcolor: 'rgba(107, 70, 193, 0.15)' },
                }}
              >
                Copy Link
              </Button>
              <Button
                startIcon={<ShareIcon sx={{ fontSize: 16 }} />}
                onClick={handleShareTwitter}
                size="small"
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  bgcolor: 'rgba(107, 70, 193, 0.15)',
                  color: '#6B46C1',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '&:hover': { bgcolor: 'rgba(107, 70, 193, 0.25)' },
                }}
              >
                Share on Twitter
              </Button>
            </Box>

            {/* Article Content */}
            <Box
              dangerouslySetInnerHTML={{ __html: contentHtml }}
              sx={{
                '& h1': { fontSize: '1.75rem', fontWeight: 800, color: '#1a1a1a', mt: 4, mb: 2, lineHeight: 1.3 },
                '& h2': { fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', mt: 3.5, mb: 1.5, lineHeight: 1.3 },
                '& h3': { fontSize: '1.15rem', fontWeight: 700, color: '#1a1a1a', mt: 3, mb: 1, lineHeight: 1.4 },
                '& p': { fontSize: '1rem', color: '#6B7280', lineHeight: 1.8, mb: 2 },
                '& ul, & ol': { pl: 3, mb: 2 },
                '& li': { fontSize: '1rem', color: '#6B7280', lineHeight: 1.8, mb: 0.5 },
                '& strong': { color: '#1a1a1a', fontWeight: 700 },
                '& a': { color: '#6B46C1', textDecoration: 'underline' },
                '& pre': {
                  bgcolor: '#E5E7EB',
                  border: '1px solid #E5E7EB',
                  borderRadius: 2,
                  p: 2,
                  overflow: 'auto',
                  mb: 2,
                },
                '& pre code': { background: 'none', padding: 0, fontSize: '0.9rem', color: '#1a1a1a' },
                '& table': { width: '100%', borderCollapse: 'collapse', mb: 2 },
                '& td': {
                  border: '1px solid #E5E7EB',
                  px: 2,
                  py: 1,
                  fontSize: '0.9rem',
                  color: '#6B7280',
                },
                '& tr:first-of-type td': {
                  fontWeight: 700,
                  bgcolor: '#E5E7EB',
                  color: '#1a1a1a',
                },
                '& hr': { border: 'none', borderTop: '1px solid #E5E7EB', my: 3 },
              }}
            />
          </CardContent>
        </Card>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 2 }}>
              Related Articles
            </Typography>
            <Grid container spacing={2}>
              {relatedPosts.map((rp) => (
                <Grid item xs={12} sm={4} key={rp.slug}>
                  <RelatedPostCard post={rp} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ borderRadius: 2 }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
