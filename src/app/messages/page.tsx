'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  ListItemButton,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import ChatWindow from '@/components/chat/ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { MessagingAPI, Conversation } from '@/lib/api/messaging';
import { UserAPI, UserSummary } from '@/lib/api/user';
import { isApiSuccess } from '@/lib/api/client';
import { useSearchParams } from 'next/navigation';

function MessagesContent() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [searching, setSearching] = useState(false);

  // User name cache for displaying participant names
  const [userNames, setUserNames] = useState<{ [id: string]: { name: string; avatar?: string } }>({});

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await MessagingAPI.getConversations(0, 50);
      if (isApiSuccess(response)) {
        const convs = response.data.content || response.data || [];
        setConversations(Array.isArray(convs) ? convs : []);

        // Load participant names
        const allParticipantIds = new Set<string>();
        (Array.isArray(convs) ? convs : []).forEach((c: Conversation) => {
          c.participantIds?.forEach((pid: string) => {
            if (pid !== user.id) allParticipantIds.add(pid);
          });
        });

        // Fetch user info for each participant
        const nameMap: { [id: string]: { name: string; avatar?: string } } = {};
        await Promise.all(
          Array.from(allParticipantIds).map(async (pid) => {
            try {
              const res = await UserAPI.getUserProfile(pid);
              if (isApiSuccess(res)) {
                const u = res.data;
                nameMap[pid] = {
                  name: u.displayName || u.name || u.username || 'User',
                  avatar: u.profilePicture,
                };
              }
            } catch {
              nameMap[pid] = { name: 'User' };
            }
          })
        );
        setUserNames((prev) => ({ ...prev, ...nameMap }));
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadConversations();
    // Poll for new conversations every 10 seconds
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  // Auto-select conversation from URL query parameter
  useEffect(() => {
    const convId = searchParams.get('conversationId');
    if (convId && conversations.length > 0 && !selectedConversation) {
      const conv = conversations.find(c => c.id === convId);
      if (conv) {
        setSelectedConversation(conv);
      } else {
        // Conversation not in list yet, fetch it directly
        MessagingAPI.getConversation(convId).then(res => {
          if (isApiSuccess(res)) {
            setSelectedConversation(res.data);
          }
        }).catch(() => {});
      }
    }
  }, [searchParams, conversations, selectedConversation]);

  const handleConversationSelect = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    loadConversations(); // Refresh to update unread counts
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await UserAPI.searchUsers(query, 0, 10);
      if (isApiSuccess(res)) {
        setSearchResults((res.data.users || []).filter((u: UserSummary) => u.id !== user?.id));
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = async (targetUserId: string) => {
    try {
      const res = await MessagingAPI.createDirectConversation(targetUserId);
      if (isApiSuccess(res)) {
        setNewChatOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        await loadConversations();
        setSelectedConversation(res.data);
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.type === 'GROUP') return conv.name || 'Group';
    const otherId = conv.participantIds?.find((id: string) => id !== user?.id);
    if (otherId && userNames[otherId]) return userNames[otherId].name;
    return 'Chat';
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === 'GROUP') return conv.avatarUrl;
    const otherId = conv.participantIds?.find((id: string) => id !== user?.id);
    if (otherId && userNames[otherId]) return userNames[otherId].avatar;
    return undefined;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHr < 24) return `${diffHr}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ p: 0, height: { xs: 'calc(100dvh - 90px)', md: '100vh' }, display: 'flex', overflow: 'hidden', width: '100%' }}>
      {/* Conversation List */}
      <Box sx={{
        width: { xs: '100%', md: 360 },
        minWidth: { md: 360 },
        borderRight: { md: '1px solid rgba(0,0,0,0.08)' },
        bgcolor: 'white',
        display: { xs: selectedConversation ? 'none' : 'flex', md: 'flex' },
        flexDirection: 'column',
        height: '100%',
      }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>Messages</Typography>
          <IconButton onClick={() => setNewChatOpen(true)} sx={{ color: '#6B46C1' }}>
            <AddIcon />
          </IconButton>
        </Box>

        {/* Conversations List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : conversations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <SendIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 600, mb: 1 }}>No conversations yet</Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Start a new conversation by tapping the + button
            </Typography>
          </Box>
        ) : (
          <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {conversations.map((conv) => (
              <ListItem key={conv.id} disablePadding>
                <ListItemButton
                  onClick={() => handleConversationSelect(conv)}
                  selected={selectedConversation?.id === conv.id}
                  sx={{
                    px: 3, py: 2,
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      bgcolor: 'rgba(107, 70, 193, 0.06)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(107, 70, 193, 0.04)',
                      borderRight: '3px solid #6B46C1',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conv.unreadCount || 0}
                      color="error"
                      invisible={!conv.unreadCount}
                    >
                      <Avatar src={getConversationAvatar(conv)} sx={{ width: 52, height: 52, bgcolor: '#6B46C1' }}>
                        {getConversationName(conv).charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: conv.unreadCount ? 700 : 600, color: '#111827' }}>
                          {getConversationName(conv)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: conv.unreadCount ? '#6B46C1' : '#9CA3AF', fontWeight: conv.unreadCount ? 700 : 400 }}>
                          {formatTime(conv.lastMessageAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{
                        color: conv.unreadCount ? '#111827' : '#6B7280',
                        fontWeight: conv.unreadCount ? 600 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {conv.lastMessagePreview || 'No messages yet'}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Chat Window */}
      <Box sx={{
        flex: 1,
        display: { xs: selectedConversation ? 'block' : 'none', md: 'block' },
        height: '100%',
        bgcolor: '#F9FAFB',
      }}>
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation.id}
            conversationName={getConversationName(selectedConversation)}
            conversationAvatar={getConversationAvatar(selectedConversation)}
            currentUserId={user?.id || ''}
            onBack={handleBack}
          />
        ) : (
          <Box sx={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: '#6B7280', p: 4, textAlign: 'center',
          }}>
            <Box sx={{ width: 80, height: 80, bgcolor: 'rgba(107, 70, 193, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <SendIcon sx={{ fontSize: 40, color: '#6B46C1' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#374151', mb: 1 }}>Your Messages</Typography>
            <Typography variant="body1">Select a conversation to start chatting</Typography>
          </Box>
        )}
      </Box>

      {/* New Chat Dialog */}
      <Dialog open={newChatOpen} onClose={() => { setNewChatOpen(false); setSearchQuery(''); setSearchResults([]); }} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>New Message</Typography>
          <IconButton onClick={() => setNewChatOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearchUsers(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6B7280' }} /></InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />
          {searching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
          ) : (
            <List>
              {searchResults.map((u) => (
                <ListItem key={u.id} disablePadding>
                  <ListItemButton onClick={() => handleStartChat(u.id)} sx={{ borderRadius: 2 }}>
                    <ListItemAvatar>
                      <Avatar src={u.profilePicture} sx={{ bgcolor: '#6B46C1' }}>{u.name?.charAt(0)?.toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{u.displayName || u.name}</Typography>}
                      secondary={u.username ? `@${u.username}` : undefined}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#6B7280', py: 2 }}>No users found</Typography>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesContent />
    </ProtectedRoute>
  );
}
