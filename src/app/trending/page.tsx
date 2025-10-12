'use client';

import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Box,
  Chip,
  Avatar
} from '@mui/material';
import {
  Whatshot as TrendingIcon,
  Visibility as ViewIcon,
  ThumbUp as LikeIcon
} from '@mui/icons-material';

export default function TrendingPage() {
  const trendingContent = [
    { id: 1, title: 'Viral Cat Meme', views: 125000, likes: 8500, author: 'memeknight', category: 'Animals', image: 'https://picsum.photos/300/200?random=1' },
    { id: 2, title: 'Work From Home Reality', views: 98000, likes: 6200, author: 'officememes', category: 'Work', image: 'https://picsum.photos/300/200?random=2' },
    { id: 3, title: 'Dancing Baby Video', views: 87000, likes: 5100, author: 'babydance', category: 'Entertainment', image: 'https://picsum.photos/300/200?random=3' },
    { id: 4, title: 'Programming Humor', views: 76000, likes: 4800, author: 'codejokes', category: 'Tech', image: 'https://picsum.photos/300/200?random=4' },
    { id: 5, title: 'Food Fail Compilation', views: 65000, likes: 3900, author: 'kitchenfail', category: 'Food', image: 'https://picsum.photos/300/200?random=5' },
    { id: 6, title: 'Relatable Student Life', views: 54000, likes: 3200, author: 'studentlife', category: 'Education', image: 'https://picsum.photos/300/200?random=6' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingIcon sx={{ color: 'orange' }} /> Trending Content
      </Typography>

      <Grid container spacing={3}>
        {trendingContent.map((content) => (
          <Grid item xs={12} sm={6} md={4} key={content.id}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
              <CardMedia
                component="img"
                height="200"
                image={content.image}
                alt={content.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {content.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {content.author.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" color="textSecondary">
                    {content.author}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ViewIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{content.views.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LikeIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{content.likes.toLocaleString()}</Typography>
                  </Box>
                </Box>

                <Chip label={content.category} size="small" color="primary" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}