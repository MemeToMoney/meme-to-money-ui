'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  ArrowBack as BackIcon,
  DoneAll as ReadIcon,
  Done as SentIcon,
} from '@mui/icons-material';
import { MessagingAPI, Message } from '@/lib/api/messaging';
import { isApiSuccess } from '@/lib/api/client';

interface ChatWindowProps {
  conversationId: string;
  conversationName: string;
  conversationAvatar?: string;
  currentUserId: string;
  onBack?: () => void;
}

export default function ChatWindow({
  conversationId,
  conversationName,
  conversationAvatar,
  currentUserId,
  onBack,
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const response = await MessagingAPI.getMessages(conversationId, 0, 100);
      if (isApiSuccess(response)) {
        const msgs = response.data.content || response.data || [];
        // Messages come newest first from API, reverse for display
        setMessages(Array.isArray(msgs) ? [...msgs].reverse() : []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    loadMessages();
  }, [conversationId, loadMessages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Mark conversation as read when viewing
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderId !== currentUserId) {
        MessagingAPI.markAsRead(conversationId, lastMsg.id).catch(() => {});
      }
    }
  }, [messages, conversationId, currentUserId]);

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      type: 'TEXT',
      text,
      createdAt: new Date().toISOString(),
      status: 'SENT',
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const response = await MessagingAPI.sendMessage(conversationId, { type: 'TEXT', text });
      if (isApiSuccess(response)) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? response.data : m))
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setMessageText(text); // Restore text
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const shouldShowDateHeader = (msg: Message, index: number) => {
    if (index === 0) return true;
    const prevDate = new Date(messages[index - 1].createdAt).toDateString();
    const currDate = new Date(msg.createdAt).toDateString();
    return prevDate !== currDate;
  };

  const getStatusIcon = (msg: Message) => {
    if (msg.senderId !== currentUserId) return null;
    if (msg.status === 'READ') return <ReadIcon sx={{ fontSize: 14, color: '#6B46C1' }} />;
    if (msg.status === 'DELIVERED') return <ReadIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />;
    return <SentIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>
      {/* Chat Header */}
      <Box sx={{
        p: 2, borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', gap: 2,
        bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
      }}>
        {onBack && (
          <IconButton onClick={onBack} sx={{ mr: -1 }}>
            <BackIcon />
          </IconButton>
        )}
        <Avatar src={conversationAvatar} sx={{ bgcolor: '#6B46C1' }}>
          {conversationName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{conversationName}</Typography>
        </Box>
        <IconButton>
          <MoreIcon />
        </IconButton>
      </Box>

      {/* Messages Area */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1, overflowY: 'auto', p: 3,
          display: 'flex', flexDirection: 'column', gap: 1,
          bgcolor: '#F9FAFB',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              No messages yet. Say hello!
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => (
            <React.Fragment key={msg.id}>
              {shouldShowDateHeader(msg, index) && (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Typography variant="caption" sx={{
                    bgcolor: 'rgba(0,0,0,0.05)', px: 2, py: 0.5, borderRadius: 2,
                    color: '#6B7280', fontWeight: 600,
                  }}>
                    {formatDateHeader(msg.createdAt)}
                  </Typography>
                </Box>
              )}
              {msg.type === 'SYSTEM' ? (
                <Box sx={{ textAlign: 'center', my: 1 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontStyle: 'italic' }}>
                    {msg.text}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ alignSelf: msg.senderId === currentUserId ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: msg.senderId === currentUserId ? '#6B46C1' : 'white',
                      color: msg.senderId === currentUserId ? 'white' : '#1F2937',
                      borderRadius: msg.senderId === currentUserId ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      boxShadow: msg.senderId === currentUserId
                        ? '0 4px 12px rgba(107, 70, 193, 0.2)'
                        : '0 2px 8px rgba(0,0,0,0.05)',
                      border: msg.senderId !== currentUserId ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    }}
                  >
                    {msg.mediaUrl && (
                      <Box
                        component="img"
                        src={msg.mediaUrl}
                        sx={{ maxWidth: '100%', borderRadius: 1, mb: msg.text ? 1 : 0 }}
                      />
                    )}
                    {msg.text && (
                      <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                        {msg.text}
                      </Typography>
                    )}
                  </Paper>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    mt: 0.5, justifyContent: msg.senderId === currentUserId ? 'flex-end' : 'flex-start',
                  }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                      {formatTime(msg.createdAt)}
                    </Typography>
                    {getStatusIcon(msg)}
                  </Box>
                </Box>
              )}
            </React.Fragment>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          bgcolor: '#F3F4F6', borderRadius: 4, p: 1, pl: 2,
        }}>
          <IconButton size="small" sx={{ color: '#6B7280' }}>
            <EmojiIcon />
          </IconButton>
          <IconButton size="small" sx={{ color: '#6B7280' }}>
            <AttachIcon />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Type a message..."
            variant="standard"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '0.95rem' },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            sx={{
              bgcolor: messageText.trim() ? '#6B46C1' : '#E5E7EB',
              color: 'white', width: 40, height: 40,
              '&:hover': { bgcolor: messageText.trim() ? '#553C9A' : '#E5E7EB' },
              '&.Mui-disabled': { color: 'white', opacity: 0.7 },
            }}
          >
            {sending ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SendIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
