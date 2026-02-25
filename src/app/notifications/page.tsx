'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Box,
  Typography,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  ListItemButton,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  PersonAdd as PersonAddIcon,
  ChatBubble as ChatBubbleIcon,
  DoneAll as DoneAllIcon,
  NotificationsNone as EmptyIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationAPI, Notification } from '@/lib/api/notifications';
import { UserAPI, UserSummary } from '@/lib/api/user';
import { isApiSuccess, parseJavaDate } from '@/lib/api/client';

function NotificationsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actorInfo, setActorInfo] = useState<{ [id: string]: UserSummary }>({});
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await NotificationAPI.getNotifications(user.id, 0, 50);
      if (isApiSuccess(response)) {
        const data = response.data;
        const notifs: Notification[] = data.content || data || [];
        setNotifications(Array.isArray(notifs) ? notifs : []);

        // Load actor info
        const actorIds = new Set<string>();
        (Array.isArray(notifs) ? notifs : []).forEach((n: Notification) => {
          if (n.actorId) actorIds.add(n.actorId);
        });

        const infoMap: { [id: string]: UserSummary } = {};
        await Promise.all(
          Array.from(actorIds).map(async (aid) => {
            try {
              const res = await UserAPI.getUserProfile(aid);
              if (isApiSuccess(res)) {
                infoMap[aid] = res.data;
              }
            } catch { /* ignore */ }
          })
        );
        setActorInfo((prev) => ({ ...prev, ...infoMap }));
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await NotificationAPI.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* ignore */ }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!user?.id) return;

    if (!notif.read) {
      NotificationAPI.markAsRead(notif.id, user.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }

    if (notif.type === 'FOLLOW' || notif.type === 'FOLLOW_REQUEST') {
      router.push(`/profile/${notif.actorId}`);
    } else if (notif.type === 'LIKE' || notif.type === 'COMMENT') {
      router.push('/feed');
    }
  };

  const handleFollowBack = async (actorId: string) => {
    try {
      await UserAPI.followUser(actorId);
      setFollowedBack((prev) => new Set(prev).add(actorId));
    } catch { /* ignore */ }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return <FavoriteIcon sx={{ color: '#EF4444', fontSize: 20 }} />;
      case 'FOLLOW':
      case 'FOLLOW_REQUEST': return <PersonAddIcon sx={{ color: '#6B46C1', fontSize: 20 }} />;
      case 'COMMENT': return <ChatBubbleIcon sx={{ color: '#10B981', fontSize: 20 }} />;
      default: return <PersonAddIcon sx={{ color: '#6B7280', fontSize: 20 }} />;
    }
  };

  const formatTime = (dateValue: any) => {
    try {
      const date = parseJavaDate(dateValue);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);
      if (diffMin < 1) return 'now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDay < 7) return `${diffDay}d ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const getActorName = (actorId: string) => {
    const actor = actorInfo[actorId];
    return actor?.displayName || actor?.name || actor?.username || 'Someone';
  };

  const getActorAvatar = (actorId: string) => {
    return actorInfo[actorId]?.profilePicture;
  };

  const groupByDate = (notifs: Notification[]) => {
    const groups: { label: string; items: Notification[] }[] = [];
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let currentLabel = '';
    let currentItems: Notification[] = [];

    notifs.forEach((n) => {
      const parsedDate = parseJavaDate(n.createdAt);
      const date = parsedDate.toDateString();
      let label: string;
      if (date === today) label = 'Today';
      else if (date === yesterday) label = 'Yesterday';
      else label = parsedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

      if (label !== currentLabel) {
        if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems });
        currentLabel = label;
        currentItems = [n];
      } else {
        currentItems.push(n);
      }
    });
    if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems });
    return groups;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const grouped = groupByDate(notifications);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      {/* Header */}
      <Box sx={{
        position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1,
        p: 2, borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6B46C1' }}>
          Notifications
          {unreadCount > 0 && (
            <Typography component="span" variant="body2" sx={{
              ml: 1, bgcolor: '#EF4444', color: 'white', px: 1, py: 0.25,
              borderRadius: 2, fontSize: '0.75rem', fontWeight: 700,
            }}>
              {unreadCount}
            </Typography>
          )}
        </Typography>
        {unreadCount > 0 && (
          <IconButton onClick={handleMarkAllRead} sx={{ color: '#6B46C1' }} title="Mark all as read">
            <DoneAllIcon />
          </IconButton>
        )}
      </Box>

      <Container maxWidth="sm" sx={{ px: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <EmptyIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 600, mb: 1 }}>
              No notifications yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              When people like, comment, or follow you, you'll see it here
            </Typography>
          </Box>
        ) : (
          grouped.map((group) => (
            <Box key={group.label}>
              <Typography variant="subtitle2" sx={{
                px: 3, py: 1.5, bgcolor: '#f3f4f6',
                fontWeight: 700, color: '#374151', fontSize: '0.8rem',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {group.label}
              </Typography>
              <List disablePadding>
                {group.items.map((notif, index) => (
                  <React.Fragment key={notif.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => handleNotificationClick(notif)}
                        sx={{
                          px: 3, py: 2,
                          bgcolor: notif.read ? 'white' : 'rgba(107, 70, 193, 0.03)',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                        }}
                      >
                        <ListItemAvatar>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={getActorAvatar(notif.actorId)}
                              sx={{ width: 48, height: 48, bgcolor: '#6B46C1' }}
                            >
                              {getActorName(notif.actorId).charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{
                              position: 'absolute', bottom: -2, right: -2,
                              bgcolor: 'white', borderRadius: '50%', p: 0.25,
                            }}>
                              {getNotificationIcon(notif.type)}
                            </Box>
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ color: '#111827', fontWeight: notif.read ? 400 : 600 }}>
                              <strong>{getActorName(notif.actorId)}</strong>{' '}
                              {notif.message || notif.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: notif.read ? '#9CA3AF' : '#6B46C1', fontWeight: notif.read ? 400 : 600 }}>
                              {formatTime(notif.createdAt)}
                            </Typography>
                          }
                        />
                        {(notif.type === 'FOLLOW' || notif.type === 'FOLLOW_REQUEST') && !followedBack.has(notif.actorId) && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleFollowBack(notif.actorId); }}
                            sx={{
                              bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 2,
                              fontWeight: 600, fontSize: '0.75rem', px: 2, ml: 1,
                              '&:hover': { bgcolor: '#553C9A' },
                            }}
                          >
                            Follow back
                          </Button>
                        )}
                        {followedBack.has(notif.actorId) && (
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                            sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem', ml: 1 }}
                          >
                            Following
                          </Button>
                        )}
                      </ListItemButton>
                    </ListItem>
                    {index < group.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          ))
        )}
      </Container>
    </Box>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
