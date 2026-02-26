'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Tab,
  Tabs,
  Chip,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  PersonAdd as PersonAddIcon,
  ChatBubble as ChatBubbleIcon,
  DoneAll as DoneAllIcon,
  NotificationsNone as EmptyNotifIcon,
  EmojiEvents as TrophyIcon,
  CurrencyRupee as CoinIcon,
  CardGiftcard as GiftIcon,
  People as ReferralIcon,
  TrendingUp as BonusIcon,
  ShoppingCart as PurchaseIcon,
  AccountBalanceWallet as PayoutIcon,
  Star as MilestoneIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  ReceiptLong as ReceiptIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationAPI, Notification } from '@/lib/api/notifications';
import { MonetizationAPI, Transaction, TransactionType, Earning } from '@/lib/api/monetization';
import { UserAPI, UserSummary } from '@/lib/api/user';
import { isApiSuccess, parseJavaDate } from '@/lib/api/client';

// ---- Activity Item (from transactions or earnings) ----
interface ActivityItem {
  id: string;
  type: TransactionType | string;
  coins: number;
  description: string;
  contentId?: string;
  relatedUserId?: string;
  createdAt: string;
}

// ---- Helpers ----

function getActivityIcon(type: string) {
  switch (type) {
    case 'TIP_RECEIVED':
      return <CoinIcon sx={{ color: '#F59E0B', fontSize: 20 }} />;
    case 'TIP_SENT':
      return <CoinIcon sx={{ color: '#EF4444', fontSize: 20 }} />;
    case 'BATTLE_WIN':
      return <TrophyIcon sx={{ color: '#F59E0B', fontSize: 20 }} />;
    case 'BATTLE_ENTRY':
      return <TrophyIcon sx={{ color: '#6B46C1', fontSize: 20 }} />;
    case 'REFERRAL_BONUS':
      return <ReferralIcon sx={{ color: '#10B981', fontSize: 20 }} />;
    case 'DAILY_REWARD':
      return <GiftIcon sx={{ color: '#EC4899', fontSize: 20 }} />;
    case 'CONTENT_BONUS':
      return <BonusIcon sx={{ color: '#3B82F6', fontSize: 20 }} />;
    case 'MILESTONE_REWARD':
      return <MilestoneIcon sx={{ color: '#F59E0B', fontSize: 20 }} />;
    case 'COIN_PURCHASE':
      return <PurchaseIcon sx={{ color: '#6B46C1', fontSize: 20 }} />;
    case 'PAYOUT':
      return <PayoutIcon sx={{ color: '#059669', fontSize: 20 }} />;
    default:
      return <CoinIcon sx={{ color: '#6B7280', fontSize: 20 }} />;
  }
}

function getActivityIconBgColor(type: string): string {
  switch (type) {
    case 'TIP_RECEIVED': return '#FFFBEB';
    case 'TIP_SENT': return '#FEF2F2';
    case 'BATTLE_WIN': return '#FFFBEB';
    case 'BATTLE_ENTRY': return '#EDE9FE';
    case 'REFERRAL_BONUS': return '#ECFDF5';
    case 'DAILY_REWARD': return '#FDF2F8';
    case 'CONTENT_BONUS': return '#EFF6FF';
    case 'MILESTONE_REWARD': return '#FFFBEB';
    case 'COIN_PURCHASE': return '#EDE9FE';
    case 'PAYOUT': return '#ECFDF5';
    default: return '#F3F4F6';
  }
}

function getActivityDescription(type: string, description?: string): string {
  if (description) return description;
  switch (type) {
    case 'TIP_RECEIVED': return 'You received a tip';
    case 'TIP_SENT': return 'You sent a tip';
    case 'BATTLE_WIN': return 'You won a meme battle!';
    case 'BATTLE_ENTRY': return 'Battle entry fee';
    case 'REFERRAL_BONUS': return 'Referral bonus earned';
    case 'DAILY_REWARD': return 'Daily reward claimed';
    case 'CONTENT_BONUS': return 'Content performance bonus';
    case 'MILESTONE_REWARD': return 'Milestone achievement reward';
    case 'COIN_PURCHASE': return 'Coins purchased';
    case 'PAYOUT': return 'Payout processed';
    default: return 'Transaction';
  }
}

function isEarning(type: string): boolean {
  return ['TIP_RECEIVED', 'BATTLE_WIN', 'REFERRAL_BONUS', 'DAILY_REWARD', 'CONTENT_BONUS', 'MILESTONE_REWARD', 'COIN_PURCHASE'].includes(type);
}

function formatTime(dateValue: any): string {
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
}

function groupByDate<T extends { createdAt: string }>(items: T[]): { label: string; items: T[] }[] {
  const groups: { label: string; items: T[] }[] = [];
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const weekAgo = new Date(Date.now() - 7 * 86400000);

  let currentLabel = '';
  let currentItems: T[] = [];

  items.forEach((item) => {
    const parsedDate = parseJavaDate(item.createdAt);
    const dateStr = parsedDate.toDateString();
    let label: string;
    if (dateStr === today) label = 'Today';
    else if (dateStr === yesterday) label = 'Yesterday';
    else if (parsedDate >= weekAgo) label = 'This Week';
    else label = 'Earlier';

    if (label !== currentLabel) {
      if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems });
      currentLabel = label;
      currentItems = [item];
    } else {
      currentItems.push(item);
    }
  });
  if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems });
  return groups;
}

// ---- Activity Tab ----

function ActivityTab({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadActivities = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // Try transactions endpoint first, fallback to earnings
      let items: ActivityItem[] = [];

      const txRes = await MonetizationAPI.getTransactions(userId, 0, 50);
      if (isApiSuccess(txRes)) {
        const data = txRes.data;
        const txList = data.content || data || [];
        if (Array.isArray(txList)) {
          items = txList.map((tx: Transaction) => ({
            id: tx.id,
            type: tx.type,
            coins: tx.coins,
            description: tx.description,
            contentId: tx.contentId,
            relatedUserId: tx.relatedUserId,
            createdAt: tx.createdAt,
          }));
        }
      }

      // If no transactions, try earnings as fallback
      if (items.length === 0) {
        const earningsRes = await MonetizationAPI.getEarnings();
        if (isApiSuccess(earningsRes)) {
          const earningsList = earningsRes.data;
          if (Array.isArray(earningsList)) {
            items = earningsList.map((e: Earning) => ({
              id: e.id,
              type: e.type,
              coins: e.coins,
              description: e.description,
              contentId: e.contentId,
              createdAt: e.createdAt,
            }));
          }
        }
      }

      setActivities(items);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const grouped = groupByDate(activities);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#6B46C1' }} />
      </Box>
    );
  }

  if (activities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
        <Box sx={{
          width: 100, height: 100, borderRadius: '50%', bgcolor: '#EDE9FE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 3,
        }}>
          <ReceiptIcon sx={{ fontSize: 48, color: '#6B46C1' }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
          No activity yet
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3, maxWidth: 280, mx: 'auto' }}>
          Your earnings from tips, battle wins, referrals, and rewards will appear here
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/battles')}
          startIcon={<TrophyIcon />}
          sx={{
            bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 3,
            fontWeight: 600, px: 3, '&:hover': { bgcolor: '#553C9A' },
          }}
        >
          Join a Battle
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Pull to refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <IconButton
          onClick={() => loadActivities(true)}
          disabled={refreshing}
          sx={{ color: '#6B46C1' }}
          size="small"
        >
          <RefreshIcon sx={{
            fontSize: 20,
            animation: refreshing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
          }} />
        </IconButton>
      </Box>

      {grouped.map((group) => (
        <Box key={group.label}>
          <Typography variant="subtitle2" sx={{
            px: 3, py: 1.5, bgcolor: '#f3f4f6',
            fontWeight: 700, color: '#374151', fontSize: '0.8rem',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {group.label}
          </Typography>
          <List disablePadding>
            {group.items.map((activity, index) => {
              const earning = isEarning(activity.type);
              return (
                <React.Fragment key={activity.id}>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ px: 3, py: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                      <ListItemAvatar>
                        <Avatar sx={{
                          width: 48, height: 48,
                          bgcolor: getActivityIconBgColor(activity.type),
                        }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, fontSize: '0.9rem' }}>
                            {getActivityDescription(activity.type, activity.description)}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                            {formatTime(activity.createdAt)}
                          </Typography>
                        }
                      />
                      <Box sx={{ textAlign: 'right', ml: 1, flexShrink: 0 }}>
                        <Typography variant="body2" sx={{
                          fontWeight: 700,
                          color: earning ? '#059669' : '#EF4444',
                          fontSize: '0.95rem',
                        }}>
                          {earning ? '+' : '-'}{activity.coins}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem' }}>
                          coins
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < group.items.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );
}

// ---- Notifications Tab ----

function NotificationsTab({ userId }: { userId: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actorInfo, setActorInfo] = useState<{ [id: string]: UserSummary }>({});
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await NotificationAPI.getNotifications(userId, 0, 50);
      if (isApiSuccess(response)) {
        const data = response.data;
        const notifs: Notification[] = data.content || data || [];
        const notifArray = Array.isArray(notifs) ? notifs : [];
        setNotifications(notifArray);

        // Load actor info
        const actorIds = new Set<string>();
        notifArray.forEach((n: Notification) => {
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
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await NotificationAPI.markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* ignore */ }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      NotificationAPI.markAsRead(notif.id, userId).catch(() => {});
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

  const getActorName = (actorId: string) => {
    const actor = actorInfo[actorId];
    return actor?.displayName || actor?.name || actor?.username || 'Someone';
  };

  const getActorAvatar = (actorId: string) => {
    return actorInfo[actorId]?.profilePicture;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const grouped = groupByDate(notifications);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#6B46C1' }} />
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
        <Box sx={{
          width: 100, height: 100, borderRadius: '50%', bgcolor: '#EDE9FE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 3,
        }}>
          <EmptyNotifIcon sx={{ fontSize: 48, color: '#6B46C1' }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
          No notifications yet
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3, maxWidth: 280, mx: 'auto' }}>
          When people like, comment, or follow you, you will see it here
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/feed')}
          sx={{
            bgcolor: '#6B46C1', textTransform: 'none', borderRadius: 3,
            fontWeight: 600, px: 3, '&:hover': { bgcolor: '#553C9A' },
          }}
        >
          Explore Feed
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Mark all read + Refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
        <Box>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              size="small"
              sx={{ bgcolor: '#EDE9FE', color: '#6B46C1', fontWeight: 600, fontSize: '0.7rem' }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <IconButton
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
            sx={{ color: '#6B46C1' }}
            size="small"
          >
            <RefreshIcon sx={{
              fontSize: 20,
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
            }} />
          </IconButton>
          {unreadCount > 0 && (
            <IconButton onClick={handleMarkAllRead} sx={{ color: '#6B46C1' }} size="small" title="Mark all as read">
              <DoneAllIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {grouped.map((group) => (
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
                        <Typography variant="caption" sx={{
                          color: notif.read ? '#9CA3AF' : '#6B46C1',
                          fontWeight: notif.read ? 400 : 600,
                        }}>
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
      ))}
    </Box>
  );
}

// ---- Main Page ----

function NotificationsPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      {/* Header */}
      <Box sx={{
        position: 'sticky', top: 0, bgcolor: 'white', zIndex: 10,
        borderBottom: '1px solid #E5E7EB',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 1.5 }}>
          <IconButton onClick={() => router.back()} sx={{ color: '#374151' }} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{
            fontWeight: 'bold', color: '#6B46C1', flex: 1, textAlign: 'center', mr: 5,
          }}>
            Activity
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#6B7280',
              minHeight: 44,
              py: 1,
            },
            '& .Mui-selected': {
              color: '#6B46C1 !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#6B46C1',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab label="Earnings" />
          <Tab label="Notifications" />
        </Tabs>
      </Box>

      <Container maxWidth="sm" sx={{ px: 0 }}>
        {user?.id && activeTab === 0 && <ActivityTab userId={user.id} />}
        {user?.id && activeTab === 1 && <NotificationsTab userId={user.id} />}
      </Container>
    </Box>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsPageContent />
    </ProtectedRoute>
  );
}
