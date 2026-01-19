'use client';

import React from 'react';
import {
  Box,
  Typography,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  PersonAdd as PersonAddIcon,
  ChatBubble as ChatIcon
} from '@mui/icons-material';

const mockNotifications = [
  {
    id: 1,
    type: 'like',
    user: 'john_doe',
    avatar: '/api/placeholder/40/40',
    message: 'liked your meme',
    time: '2m ago',
    icon: <FavoriteIcon sx={{ color: '#EF4444' }} />
  },
  {
    id: 2,
    type: 'follow',
    user: 'jane_smith',
    avatar: '/api/placeholder/40/40',
    message: 'started following you',
    time: '5m ago',
    icon: <PersonAddIcon sx={{ color: '#6B46C1' }} />,
    hasAction: true
  },
  {
    id: 3,
    type: 'comment',
    user: 'mike_wilson',
    avatar: '/api/placeholder/40/40',
    message: 'commented on your post',
    time: '1h ago',
    icon: <ChatIcon sx={{ color: '#10B981' }} />
  },
  {
    id: 4,
    type: 'follow',
    user: 'sara_jones',
    avatar: '/api/placeholder/40/40',
    message: 'started following you',
    time: '2h ago',
    icon: <PersonAddIcon sx={{ color: '#6B46C1' }} />,
    hasAction: true
  }
];

export default function NotificationsPage() {
  return (
    <Container maxWidth={false} sx={{ p: 0, height: '100%' }}>
      {/* Header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        bgcolor: 'white',
        zIndex: 1,
        p: 2,
        borderBottom: '1px solid #E5E7EB'
      }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: '#374151'
          }}
        >
          Notifications
        </Typography>
      </Box>

      {/* Today Section */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: '#6B7280',
            fontWeight: 600,
            mb: 2,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em'
          }}
        >
          Today
        </Typography>

        <List sx={{ p: 0 }}>
          {mockNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  px: 0,
                  py: 1.5,
                  alignItems: 'flex-start'
                }}
              >
                <ListItemAvatar sx={{ minWidth: 48 }}>
                  <Avatar
                    src={notification.avatar}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: '#F3F4F6'
                    }}
                  >
                    {notification.user[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  sx={{ mr: 1 }}
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {notification.icon}
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          {notification.user}
                        </Box>
                        {' '}{notification.message}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {notification.time}
                      </Typography>
                      {notification.hasAction && (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            px: 2,
                            py: 0.5,
                            borderColor: '#6B46C1',
                            color: '#6B46C1',
                            '&:hover': {
                              borderColor: '#553C9A',
                              bgcolor: 'rgba(107, 70, 193, 0.04)'
                            }
                          }}
                        >
                          Follow back
                        </Button>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < mockNotifications.length - 1 && (
                <Divider sx={{ my: 1 }} />
              )}
            </React.Fragment>
          ))}
        </List>

        {/* Empty state if no notifications */}
        {mockNotifications.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When people like, comment, or follow you, you'll see it here
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}