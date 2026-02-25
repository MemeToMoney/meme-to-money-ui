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
  Popover,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  ArrowBack as BackIcon,
  DoneAll as ReadIcon,
  Done as SentIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { MessagingAPI, Message } from '@/lib/api/messaging';
import { ContentAPI } from '@/lib/api/content';
import { isApiSuccess } from '@/lib/api/client';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

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
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const response = await MessagingAPI.getMessages(conversationId, 0, 100);
      if (isApiSuccess(response)) {
        const msgs = response.data.content || response.data || [];
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

  useEffect(() => {
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderId !== currentUserId) {
        MessagingAPI.markAsRead(conversationId, lastMsg.id).catch(() => {});
      }
    }
  }, [messages, conversationId, currentUserId]);

  const handleSend = async () => {
    if ((!messageText.trim() && !attachmentFile) || sending) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    let mediaUrl: string | undefined;
    let mediaType: string | undefined;
    let msgType: 'TEXT' | 'IMAGE' = 'TEXT';

    // Upload attachment if present
    if (attachmentFile) {
      setUploading(true);
      try {
        const uploadRes = await ContentAPI.uploadFile(attachmentFile);
        if (isApiSuccess(uploadRes)) {
          mediaUrl = uploadRes.data;
          mediaType = attachmentFile.type;
          msgType = attachmentFile.type.startsWith('image/') ? 'IMAGE' : 'TEXT';
        }
      } catch (err) {
        console.error('Failed to upload file:', err);
      } finally {
        setUploading(false);
        setAttachmentFile(null);
        setAttachmentPreview(null);
      }
    }

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      type: msgType,
      text: text || undefined,
      mediaUrl,
      createdAt: new Date().toISOString(),
      status: 'SENT',
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const payload: any = { type: msgType, text: text || undefined };
      if (mediaUrl) {
        payload.mediaUrl = mediaUrl;
        payload.mediaType = mediaType;
      }
      const response = await MessagingAPI.sendMessage(conversationId, payload);
      if (isApiSuccess(response)) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? response.data : m))
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setMessageText(text);
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

  const handleEmojiClick = (emojiData: any) => {
    setMessageText((prev) => prev + emojiData.emoji);
    setEmojiAnchor(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setAttachmentFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setAttachmentPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };

  const clearAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
                        alt="attachment"
                        sx={{ maxWidth: '100%', maxHeight: 300, borderRadius: 1, mb: msg.text ? 1 : 0, cursor: 'pointer' }}
                        onClick={() => window.open(msg.mediaUrl, '_blank')}
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

      {/* Attachment Preview */}
      {attachmentFile && (
        <Box sx={{ px: 2, py: 1, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', gap: 1 }}>
          {attachmentPreview ? (
            <Box component="img" src={attachmentPreview} sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }} />
          ) : (
            <Box sx={{ px: 2, py: 1, bgcolor: '#E5E7EB', borderRadius: 1, fontSize: '0.85rem' }}>
              {attachmentFile.name}
            </Box>
          )}
          <IconButton size="small" onClick={clearAttachment}>
            <CloseIcon fontSize="small" />
          </IconButton>
          {uploading && <CircularProgress size={20} sx={{ color: '#6B46C1' }} />}
        </Box>
      )}

      {/* Input Area */}
      <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          bgcolor: '#F3F4F6', borderRadius: 4, p: 1, pl: 2,
        }}>
          <IconButton
            size="small"
            sx={{ color: '#6B7280' }}
            onClick={(e) => setEmojiAnchor(emojiAnchor ? null : e.currentTarget)}
          >
            <EmojiIcon />
          </IconButton>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*,.pdf,.doc,.docx"
            style={{ display: 'none' }}
          />
          <IconButton
            size="small"
            sx={{ color: '#6B7280' }}
            onClick={() => fileInputRef.current?.click()}
          >
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
            disabled={(!messageText.trim() && !attachmentFile) || sending}
            sx={{
              bgcolor: (messageText.trim() || attachmentFile) ? '#6B46C1' : '#E5E7EB',
              color: 'white', width: 40, height: 40,
              '&:hover': { bgcolor: (messageText.trim() || attachmentFile) ? '#553C9A' : '#E5E7EB' },
              '&.Mui-disabled': { color: 'white', opacity: 0.7 },
            }}
          >
            {sending ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SendIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} width={320} height={400} />
      </Popover>
    </Box>
  );
}
