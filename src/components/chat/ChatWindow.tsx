'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    TextField,
    Paper,
    InputAdornment
} from '@mui/material';
import {
    Send as SendIcon,
    MoreVert as MoreIcon,
    AttachFile as AttachIcon,
    EmojiEmotions as EmojiIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';

interface Message {
    id: number;
    text: string;
    sender: 'me' | 'other';
    timestamp: string;
}

interface ChatWindowProps {
    user: {
        name: string;
        avatar: string;
        status?: string;
    };
    onBack?: () => void;
}

export default function ChatWindow({ user, onBack }: ChatWindowProps) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: 'Hey! How are you doing?', sender: 'other', timestamp: '10:00 AM' },
        { id: 2, text: 'I saw your latest post, it was awesome! 🔥', sender: 'other', timestamp: '10:01 AM' },
        { id: 3, text: 'Thanks! Glad you liked it.', sender: 'me', timestamp: '10:05 AM' },
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (message.trim()) {
            setMessages([
                ...messages,
                {
                    id: messages.length + 1,
                    text: message,
                    sender: 'me',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>
            {/* Chat Header */}
            <Box sx={{
                p: 2,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)'
            }}>
                {onBack && (
                    <IconButton onClick={onBack} sx={{ mr: -1 }}>
                        <BackIcon />
                    </IconButton>
                )}
                <Avatar src={user.avatar} sx={{ bgcolor: '#6B46C1' }}>
                    {user.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981' }} />
                        Online
                    </Typography>
                </Box>
                <IconButton>
                    <MoreIcon />
                </IconButton>
            </Box>

            {/* Messages Area */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                bgcolor: '#F9FAFB'
            }}>
                {messages.map((msg) => (
                    <Box
                        key={msg.id}
                        sx={{
                            alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                            maxWidth: '70%'
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: msg.sender === 'me' ? '#6B46C1' : 'white',
                                color: msg.sender === 'me' ? 'white' : '#1F2937',
                                borderRadius: msg.sender === 'me' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                boxShadow: msg.sender === 'me'
                                    ? '0 4px 12px rgba(107, 70, 193, 0.2)'
                                    : '0 2px 8px rgba(0,0,0,0.05)',
                                border: msg.sender === 'other' ? '1px solid rgba(0,0,0,0.04)' : 'none'
                            }}
                        >
                            <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                                {msg.text}
                            </Typography>
                        </Paper>
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                mt: 0.5,
                                textAlign: msg.sender === 'me' ? 'right' : 'left',
                                color: '#9CA3AF',
                                fontSize: '0.75rem'
                            }}
                        >
                            {msg.timestamp}
                        </Typography>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{
                p: 2,
                bgcolor: 'white',
                borderTop: '1px solid rgba(0,0,0,0.06)'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: '#F3F4F6',
                    borderRadius: 4,
                    p: 1,
                    pl: 2
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
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '0.95rem' }
                        }}
                    />
                    <IconButton
                        onClick={handleSend}
                        disabled={!message.trim()}
                        sx={{
                            bgcolor: message.trim() ? '#6B46C1' : '#E5E7EB',
                            color: 'white',
                            width: 40,
                            height: 40,
                            '&:hover': {
                                bgcolor: message.trim() ? '#553C9A' : '#E5E7EB',
                            },
                            '&.Mui-disabled': {
                                color: 'white',
                                opacity: 0.7
                            }
                        }}
                    >
                        <SendIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
}
